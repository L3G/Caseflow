namespace Caseflow.Models;

public sealed class Extraction
{
    public long Id { get; init; }
    public required string CaseId { get; init; }
    public required string DocumentId { get; init; }
    public required ExtractionType ExtractionType { get; init; }
    public required string PayloadJson { get; set; }
    public required DateTime CreatedAt { get; init; }
    public DateTime? UpdatedAt { get; set; }
}

public enum ExtractionType
{
    BankStatement,
    PayStub
}

public sealed record ExtractedField<T>(T Value, double Confidence);

public sealed record BankStatementExtraction(
    ExtractedField<string> BankName,
    ExtractedField<string> AccountHolderName,
    ExtractedField<string> AccountNumberLast4,
    ExtractedField<DateOnly> StatementPeriodStart,
    ExtractedField<DateOnly> StatementPeriodEnd,
    ExtractedField<decimal> BeginningBalance,
    ExtractedField<decimal> EndingBalance,
    ExtractedField<decimal> TotalDeposits,
    ExtractedField<decimal> TotalWithdrawals,
    IReadOnlyList<BankStatementTransaction> Transactions,
    string? ReviewerNotes
)
{
    public double MinConfidence => new[]
    {
        BankName.Confidence,
        AccountHolderName.Confidence,
        AccountNumberLast4.Confidence,
        StatementPeriodStart.Confidence,
        StatementPeriodEnd.Confidence,
        BeginningBalance.Confidence,
        EndingBalance.Confidence,
        TotalDeposits.Confidence,
        TotalWithdrawals.Confidence
    }.Min();
}

public sealed record BankStatementTransaction(
    DateOnly Date,
    string Description,
    decimal Amount,
    TransactionDirection Direction
);

public enum TransactionDirection
{
    Deposit,
    Withdrawal
}
