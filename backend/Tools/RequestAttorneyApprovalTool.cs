using System.Text.Json;
using Caseflow.Agent;
using Caseflow.Data;
using Caseflow.Models;

namespace Caseflow.Tools;

public sealed class RequestAttorneyApprovalTool(AppDbContext db) : ITool
{
    public string Name => "RequestAttorneyApproval";

    public string Description =>
        "Request mandatory attorney approval before the case can move to Approved. " +
        "Creates a pending approval entry and blocks the agent until a human resolves it.";

    public ToolPolicy Policy => new(
        ToolPolicyDecision.AutoExecute,
        "Always safe: only creates a checkpoint; never proceeds past it.");

    public Task<ToolResult> ExecuteAsync(
        CaseSnapshot snapshot,
        JsonElement input,
        CancellationToken ct = default)
    {
        db.PendingApprovals.Add(new PendingApproval
        {
            CaseId = snapshot.CaseId,
            ToolName = Name,
            PlannerReasoning = "Mandatory final checkpoint — all analyses complete, case ready for attorney sign-off.",
            ToolInputJson = "{}",
            RequestedAt = DateTime.UtcNow,
        });

        var result = new ToolResult(
            Success: true,
            Confidence: 1.0,
            OutputSummary: "Mandatory attorney approval requested.",
            Error: null,
            NewState: CaseState.AttorneyReviewPending,
            Persist: null);
        return Task.FromResult(result);
    }
}
