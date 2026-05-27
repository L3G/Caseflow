namespace Caseflow.Models;

public enum CaseState
{
    New,
    DocumentReceived,
    Classified,
    Extracted,
    AnalysesPending,
    Analyzed,
    AttorneyReviewPending,
    Approved,
    Flagged
}
