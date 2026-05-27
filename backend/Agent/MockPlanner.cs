using Caseflow.Models;
using Caseflow.Tools;

namespace Caseflow.Agent;

public sealed class MockPlanner : IPlanner
{
    public Task<PlannerDecision> PlanAsync(
        CaseSnapshot snapshot,
        IReadOnlyList<ITool> validTools,
        CancellationToken ct = default)
    {
        var decision = snapshot.State switch
        {
            CaseState.DocumentReceived => Pick(
                next: "ClassifyDocument",
                reasoning: "A document was uploaded but its type is unknown. Classification must run before any extraction tool can be selected.",
                expectedOutcome: "Document type is identified with high confidence; case advances to Classified.",
                rejected: [("FlagForAttorneyReview", "No anomaly has surfaced yet; classification should run first.")],
                confidence: PlannerConfidence.High),

            CaseState.Classified => Pick(
                next: "ExtractBankStatement",
                reasoning: "The document was classified as a bank statement. Structured field extraction is the next step before any downstream computation can run.",
                expectedOutcome: "Bank statement fields extracted with per-field confidence; case advances to Extracted or flags on low confidence.",
                rejected: [("ExtractPayStub", "The classification said bank statement, not pay stub.")],
                confidence: PlannerConfidence.High),

            CaseState.Extracted => Pick(
                next: "ComputeMeansTest",
                reasoning: "Extraction is complete. Means test is the most legally consequential computation and should run first so its result is available to other analyses.",
                expectedOutcome: "Monthly gross income proxy and pass/fail computed; case advances to AnalysesPending.",
                rejected: [("CalculateDeadlines", "Deadlines can be computed after the means test; means test is the load-bearing analysis.")],
                confidence: PlannerConfidence.High),

            CaseState.AnalysesPending => Pick(
                next: "CalculateDeadlines",
                reasoning: "Means test is complete. Calculating deadlines per FRBP 9006 closes out the analysis phase before attorney review.",
                expectedOutcome: "Deadline schedule produced; case advances to Analyzed.",
                rejected: [("CheckArithmeticIntegrity", "Arithmetic check is supplementary; it does not block deadlines.")],
                confidence: PlannerConfidence.High),

            CaseState.Analyzed => Pick(
                next: "RequestAttorneyApproval",
                reasoning: "All analyses are complete. The mandatory attorney checkpoint must run before the case can move to Approved.",
                expectedOutcome: "An approval is queued; case advances to AttorneyReviewPending.",
                rejected: [("DraftClientEmail", "Drafting an email requires attorney approval first; it should not run before the checkpoint.")],
                confidence: PlannerConfidence.High),

            _ => Pick(
                next: "Done",
                reasoning: $"No productive action is available from state {snapshot.State}. The orchestrator should stop.",
                expectedOutcome: "Orchestrator stops gracefully.",
                rejected: [("FlagForAttorneyReview", "No anomaly to flag; the case is awaiting external input.")],
                confidence: PlannerConfidence.Medium),
        };

        return Task.FromResult(decision);
    }

    private static PlannerDecision Pick(
        string next,
        string reasoning,
        string expectedOutcome,
        (string Action, string ReasonRejected)[] rejected,
        PlannerConfidence confidence) =>
        new(
            NextAction: next,
            Reasoning: reasoning,
            ExpectedOutcome: expectedOutcome,
            AlternativesConsidered: rejected.Select(r => new PlannerAlternative(r.Action, r.ReasonRejected)).ToList(),
            EstimatedConfidence: confidence);
}
