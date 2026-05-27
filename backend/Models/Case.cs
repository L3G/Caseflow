namespace Caseflow.Models;

public sealed class Case
{
    public required string Id { get; init; }
    public required string ClientName { get; set; }
    public required string WorkflowTitle { get; set; }
    public required string Assignee { get; set; }
    public required CaseState State { get; set; }
    public required DateTime CreatedAt { get; init; }
    public required DateTime UpdatedAt { get; set; }
}
