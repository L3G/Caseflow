namespace Caseflow.Models;

public sealed class CaseEvent
{
    public long Id { get; init; }
    public required string CaseId { get; init; }
    public required CaseEventType EventType { get; init; }
    public required CaseEventActor Actor { get; init; }
    public required string PayloadJson { get; init; }
    public required DateTime At { get; init; }
}

public enum CaseEventType
{
    CaseCreated,
    DocumentUploaded,
    PlannerDecision,
    ToolStarted,
    ToolSucceeded,
    ToolFailed,
    StateTransitioned,
    ApprovalRequested,
    ApprovalResolved,
    AgentStopped,
    PolicyViolation
}

public enum CaseEventActor
{
    Agent,
    System,
    User
}
