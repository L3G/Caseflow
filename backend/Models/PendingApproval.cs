namespace Caseflow.Models;

public sealed class PendingApproval
{
    public long Id { get; init; }
    public required string CaseId { get; init; }
    public required string ToolName { get; init; }
    public required string PlannerReasoning { get; init; }
    public required string ToolInputJson { get; init; }
    public required DateTime RequestedAt { get; init; }
    public DateTime? ResolvedAt { get; set; }
    public string? ResolvedBy { get; set; }
    public ApprovalDecision? Decision { get; set; }
    public string? Notes { get; set; }
}

public enum ApprovalDecision
{
    Approve,
    Reject
}
