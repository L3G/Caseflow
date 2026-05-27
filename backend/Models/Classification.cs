namespace Caseflow.Models;

public enum DocumentType
{
    Unknown,
    BankStatement,
    PayStub,
    TaxReturn,
    Identification,
    CourtNotice
}

public sealed record ClassificationResult(
    DocumentType DocumentType,
    double Confidence,
    string Reasoning
);
