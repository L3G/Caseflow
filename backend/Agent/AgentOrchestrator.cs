using System.Diagnostics;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;
using Caseflow.Data;
using Caseflow.Models;
using Caseflow.Services;
using Caseflow.Tools;

namespace Caseflow.Agent;

public sealed class AgentOrchestrator(
    AppDbContext db,
    ICaseStore caseStore,
    IAuditLog auditLog,
    IPlanner planner,
    IPolicy policy,
    ToolRegistry toolRegistry,
    IConfiguration config)
{
    private static readonly JsonSerializerOptions JsonOpts = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        Converters = { new JsonStringEnumConverter(JsonNamingPolicy.CamelCase) },
    };

    private readonly int _maxSteps = config.GetValue("Agent:MaxStepsPerRun", 8);
    private readonly int _maxDurationSeconds = config.GetValue("Agent:MaxRunDurationSeconds", 25);

    public async Task<AgentRunResult> RunUntilCheckpointAsync(
        string caseId,
        CancellationToken ct = default)
    {
        var sw = Stopwatch.StartNew();
        var startEventId = await db.CaseEvents
            .Where(e => e.CaseId == caseId)
            .OrderByDescending(e => e.Id)
            .Select(e => (long?)e.Id)
            .FirstOrDefaultAsync(ct) ?? 0;

        var steps = 0;
        var stopReason = AgentStopReason.PlannerDone;
        var stopMessage = "Loop exited.";
        var finalState = CaseState.New;

        while (true)
        {
            ct.ThrowIfCancellationRequested();

            if (steps >= _maxSteps)
            {
                stopReason = AgentStopReason.MaxStepsReached;
                stopMessage = $"Reached max steps ({_maxSteps}). Click Run Agent to continue.";
                break;
            }
            if (sw.Elapsed.TotalSeconds >= _maxDurationSeconds)
            {
                stopReason = AgentStopReason.MaxDurationReached;
                stopMessage = $"Reached max duration ({_maxDurationSeconds}s). Click Run Agent to continue.";
                break;
            }

            var snapshot = await caseStore.GetSnapshotAsync(caseId, recentEventCount: 10, ct)
                ?? throw new InvalidOperationException($"Case {caseId} not found.");
            finalState = snapshot.State;

            if (StateMachine.IsTerminal(snapshot.State))
            {
                stopReason = AgentStopReason.TerminalState;
                stopMessage = $"Case is in terminal state: {snapshot.State}.";
                break;
            }
            if (StateMachine.IsBlocked(snapshot.State))
            {
                stopReason = AgentStopReason.BlockedAwaitingHuman;
                stopMessage = $"Case is blocked on human action: {snapshot.State}.";
                break;
            }

            var validToolNames = StateMachine.ValidToolsFor(snapshot.State);
            var validTools = validToolNames
                .Select(n => toolRegistry.GetByName(n))
                .OfType<ITool>()
                .ToList();
            if (validTools.Count == 0)
            {
                stopReason = AgentStopReason.PlannerDone;
                stopMessage = $"No valid tools from state {snapshot.State}.";
                break;
            }

            var decision = await planner.PlanAsync(snapshot, validTools, ct);
            await auditLog.AppendAsync(
                caseId, CaseEventType.PlannerDecision, CaseEventActor.Agent, decision, ct);

            if (decision.NextAction == "Done")
            {
                stopReason = AgentStopReason.PlannerDone;
                stopMessage = "Planner returned Done.";
                break;
            }

            if (!StateMachine.IsValidTransition(snapshot.State, decision.NextAction))
            {
                await auditLog.AppendAsync(caseId, CaseEventType.PolicyViolation, CaseEventActor.Agent,
                    new
                    {
                        violation = "Planner chose an invalid tool for the current state.",
                        chosenTool = decision.NextAction,
                        state = snapshot.State,
                    }, ct);
                await FlagCaseAsync(caseId, "Planner chose an invalid tool.", ct);
                stopReason = AgentStopReason.PolicyViolation;
                stopMessage = $"Planner chose '{decision.NextAction}' which is not valid from state {snapshot.State}.";
                finalState = CaseState.Flagged;
                break;
            }

            var tool = toolRegistry.GetByName(decision.NextAction);
            if (tool is null)
            {
                await auditLog.AppendAsync(caseId, CaseEventType.PolicyViolation, CaseEventActor.Agent,
                    new
                    {
                        violation = "Planner chose an unregistered tool.",
                        chosenTool = decision.NextAction,
                    }, ct);
                stopReason = AgentStopReason.PolicyViolation;
                stopMessage = $"Tool '{decision.NextAction}' is not registered.";
                break;
            }

            var policyDecision = policy.Evaluate(tool, snapshot, decision);
            if (policyDecision == ToolPolicyDecision.Forbid)
            {
                stopReason = AgentStopReason.PolicyForbade;
                stopMessage = $"Policy forbade tool {decision.NextAction}.";
                break;
            }
            if (policyDecision == ToolPolicyDecision.AskHuman)
            {
                db.PendingApprovals.Add(new PendingApproval
                {
                    CaseId = caseId,
                    ToolName = decision.NextAction,
                    PlannerReasoning = decision.Reasoning,
                    ToolInputJson = "{}",
                    RequestedAt = DateTime.UtcNow,
                });
                await db.SaveChangesAsync(ct);
                await auditLog.AppendAsync(caseId, CaseEventType.ApprovalRequested, CaseEventActor.Agent,
                    new { toolName = decision.NextAction, reasoning = decision.Reasoning }, ct);
                stopReason = AgentStopReason.BlockedAwaitingHuman;
                stopMessage = $"Tool {decision.NextAction} requires human approval.";
                break;
            }

            await auditLog.AppendAsync(caseId, CaseEventType.ToolStarted, CaseEventActor.Agent,
                new { toolName = decision.NextAction }, ct);

            ToolResult result;
            try
            {
                using var emptyInput = JsonDocument.Parse("{}");
                result = await tool.ExecuteAsync(snapshot, emptyInput.RootElement, ct);
            }
            catch (Exception ex)
            {
                await auditLog.AppendAsync(caseId, CaseEventType.ToolFailed, CaseEventActor.Agent,
                    new { toolName = decision.NextAction, error = ex.Message }, ct);
                stopReason = AgentStopReason.ToolFailed;
                stopMessage = $"Tool {decision.NextAction} threw: {ex.Message}";
                break;
            }

            if (!result.Success)
            {
                await auditLog.AppendAsync(caseId, CaseEventType.ToolFailed, CaseEventActor.Agent,
                    new
                    {
                        toolName = decision.NextAction,
                        error = result.Error,
                        confidence = result.Confidence,
                    }, ct);
                stopReason = AgentStopReason.ToolFailed;
                stopMessage = $"Tool {decision.NextAction} returned failure: {result.Error}";
                break;
            }

            await caseStore.ApplyToolResultAsync(caseId, decision.NextAction, result, ct);
            if (result.NewState.HasValue) finalState = result.NewState.Value;

            steps++;
        }

        await auditLog.AppendAsync(caseId, CaseEventType.AgentStopped, CaseEventActor.Agent,
            new { stopReason, stopMessage, stepsTaken = steps }, ct);

        var newEvents = await db.CaseEvents
            .Where(e => e.CaseId == caseId && e.Id > startEventId)
            .OrderBy(e => e.At)
            .ToListAsync(ct);

        return new AgentRunResult(
            CaseId: caseId,
            FinalState: finalState,
            StopReason: stopReason,
            StopMessage: stopMessage,
            StepsTaken: steps,
            NewEvents: newEvents);
    }

    private async Task FlagCaseAsync(string caseId, string reason, CancellationToken ct)
    {
        var caseEntity = await db.Cases.FirstOrDefaultAsync(c => c.Id == caseId, ct);
        if (caseEntity is null) return;
        var oldState = caseEntity.State;
        caseEntity.State = CaseState.Flagged;
        caseEntity.UpdatedAt = DateTime.UtcNow;
        db.CaseEvents.Add(new CaseEvent
        {
            CaseId = caseId,
            EventType = CaseEventType.StateTransitioned,
            Actor = CaseEventActor.Agent,
            PayloadJson = JsonSerializer.Serialize(
                new { from = oldState, to = CaseState.Flagged, reason }, JsonOpts),
            At = DateTime.UtcNow,
        });
        await db.SaveChangesAsync(ct);
    }
}
