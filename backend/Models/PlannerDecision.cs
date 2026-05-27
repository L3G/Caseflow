namespace Caseflow.Models;

public sealed record PlannerDecision(
    string NextAction,
    string Reasoning,
    string ExpectedOutcome,
    IReadOnlyList<PlannerAlternative> AlternativesConsidered,
    PlannerConfidence EstimatedConfidence
);

public sealed record PlannerAlternative(
    string Action,
    string ReasonRejected
);

public enum PlannerConfidence
{
    High,
    Medium,
    Low
}
