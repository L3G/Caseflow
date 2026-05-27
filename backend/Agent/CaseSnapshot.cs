using Caseflow.Models;

namespace Caseflow.Agent;

public sealed record CaseSnapshot(
    Case Case,
    IReadOnlyList<CaseDocument> Documents,
    IReadOnlyList<Extraction> Extractions,
    IReadOnlyList<Analysis> Analyses,
    IReadOnlyList<CaseEvent> RecentEvents,
    IReadOnlyList<PendingApproval> UnresolvedApprovals)
{
    public CaseState State => Case.State;
    public string CaseId => Case.Id;

    public bool HasExtraction(ExtractionType type) =>
        Extractions.Any(e => e.ExtractionType == type);

    public bool HasAnalysis(AnalysisType type) =>
        Analyses.Any(a => a.AnalysisType == type);

    public Extraction? LatestExtraction(ExtractionType type) =>
        Extractions.Where(e => e.ExtractionType == type).MaxBy(e => e.CreatedAt);

    public Analysis? LatestAnalysis(AnalysisType type) =>
        Analyses.Where(a => a.AnalysisType == type).MaxBy(a => a.CreatedAt);
}
