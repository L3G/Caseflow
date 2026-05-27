namespace Caseflow.Models;

public sealed class Analysis
{
    public long Id { get; init; }
    public required string CaseId { get; init; }
    public required AnalysisType AnalysisType { get; init; }
    public required string PayloadJson { get; set; }
    public required DateTime CreatedAt { get; init; }
    public DateTime? UpdatedAt { get; set; }
}

public enum AnalysisType
{
    MeansTest,
    Deadlines,
    ArithmeticIntegrity
}

public sealed record MeansTestResult(
    decimal MonthlyGrossIncomeProxy,
    decimal AnnualizedIncomeProxy,
    decimal MedianIncomeThreshold,
    bool Passes,
    string Methodology,
    IReadOnlyList<string> Caveats
);

public sealed record DeadlineSchedule(
    DateOnly PetitionDate,
    IReadOnlyList<Deadline> Deadlines
);

public sealed record Deadline(
    string Name,
    string LegalCitation,
    int DaysFromPetition,
    DateOnly DueDate,
    bool AdjustedForBusinessDay
);

public sealed record ArithmeticCheckResult(
    bool BalanceReconciles,
    decimal ExpectedEndingBalance,
    decimal ActualEndingBalance,
    decimal Discrepancy,
    IReadOnlyList<string> Notes
);
