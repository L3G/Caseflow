namespace Caseflow.Models;

public sealed record AgentRunResult(
    string CaseId,
    CaseState FinalState,
    AgentStopReason StopReason,
    string StopMessage,
    int StepsTaken,
    IReadOnlyList<CaseEvent> NewEvents
);

public enum AgentStopReason
{
    PlannerDone,
    TerminalState,
    BlockedAwaitingHuman,
    MaxStepsReached,
    MaxDurationReached,
    ToolFailed,
    PolicyViolation,
    PolicyForbade,
    Cancelled
}
