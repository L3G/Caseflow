namespace Caseflow.Models;

public sealed record ToolResult(
    bool Success,
    double Confidence,
    string? OutputSummary,
    string? Error,
    CaseState? NewState,
    ToolPersistenceHint? Persist
);

public sealed record ToolPolicy(
    ToolPolicyDecision DefaultDecision,
    string Reason
);

public enum ToolPolicyDecision
{
    AutoExecute,
    AskHuman,
    Forbid
}

public sealed record ToolPersistenceHint(
    ToolPersistenceKind Kind,
    string PayloadJson,
    string? DocumentId
);

public enum ToolPersistenceKind
{
    Extraction,
    Analysis,
    DocumentClassification
}
