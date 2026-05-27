using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;
using Caseflow.Data;
using Caseflow.Models;

namespace Caseflow.Endpoints;

public static class ApprovalsEndpoints
{
    private static readonly JsonSerializerOptions JsonOpts = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        Converters = { new JsonStringEnumConverter(JsonNamingPolicy.CamelCase) },
    };

    public static void MapApprovalsEndpoints(this WebApplication app)
    {
        app.MapPost("/api/approvals/{id:long}", async (
            long id,
            ApprovalDecisionRequest request,
            AppDbContext db,
            CancellationToken ct) =>
        {
            var approval = await db.PendingApprovals.FirstOrDefaultAsync(a => a.Id == id, ct);
            if (approval is null)
                return Results.NotFound(new { error = $"Approval {id} not found." });
            if (approval.ResolvedAt is not null)
                return Results.BadRequest(new { error = "Approval already resolved." });

            var decision = request.Decision?.ToLowerInvariant() switch
            {
                "approve" => ApprovalDecision.Approve,
                "reject"  => ApprovalDecision.Reject,
                _         => (ApprovalDecision?)null,
            };
            if (decision is null)
                return Results.BadRequest(new { error = "decision must be 'approve' or 'reject'." });

            var now = DateTime.UtcNow;
            approval.Decision = decision.Value;
            approval.ResolvedAt = now;
            approval.ResolvedBy = "human";
            approval.Notes = request.Notes;

            if (approval.ToolName == "RequestAttorneyApproval")
            {
                var caseEntity = await db.Cases.FirstOrDefaultAsync(c => c.Id == approval.CaseId, ct);
                if (caseEntity is not null)
                {
                    var oldState = caseEntity.State;
                    var newState = decision == ApprovalDecision.Approve
                        ? CaseState.Approved
                        : CaseState.Flagged;
                    caseEntity.State = newState;
                    caseEntity.UpdatedAt = now;

                    db.CaseEvents.Add(new CaseEvent
                    {
                        CaseId = approval.CaseId,
                        EventType = CaseEventType.StateTransitioned,
                        Actor = CaseEventActor.User,
                        PayloadJson = JsonSerializer.Serialize(
                            new { from = oldState, to = newState, approvalId = id }, JsonOpts),
                        At = now,
                    });
                }
            }

            db.CaseEvents.Add(new CaseEvent
            {
                CaseId = approval.CaseId,
                EventType = CaseEventType.ApprovalResolved,
                Actor = CaseEventActor.User,
                PayloadJson = JsonSerializer.Serialize(
                    new
                    {
                        approvalId = id,
                        toolName = approval.ToolName,
                        decision = decision.Value,
                        notes = request.Notes,
                    }, JsonOpts),
                At = now,
            });

            await db.SaveChangesAsync(ct);

            return Results.Ok(approval);
        });
    }
}

public sealed record ApprovalDecisionRequest(string? Decision, string? Notes);
