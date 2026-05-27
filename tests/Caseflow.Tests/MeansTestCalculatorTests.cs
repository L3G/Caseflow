using Caseflow.Compute;
using Caseflow.Models;
using Xunit;

namespace Caseflow.Tests;

public sealed class MeansTestCalculatorTests
{
    [Fact]
    public void Passes_when_annualized_income_is_below_threshold()
    {
        var extraction = BuildExtraction(totalDeposits: 5_000m, depositsConfidence: 0.95);

        var result = MeansTestCalculator.Calculate(extraction);

        Assert.True(result.Passes);
        Assert.Equal(60_000m, result.AnnualizedIncomeProxy);
        Assert.Equal(MeansTestCalculator.MedianIncomeThreshold, result.MedianIncomeThreshold);
    }

    [Fact]
    public void Fails_when_annualized_income_is_at_or_above_threshold()
    {
        var extraction = BuildExtraction(totalDeposits: 8_000m, depositsConfidence: 0.95);

        var result = MeansTestCalculator.Calculate(extraction);

        Assert.False(result.Passes);
        Assert.Equal(96_000m, result.AnnualizedIncomeProxy);
    }

    [Fact]
    public void Emits_low_confidence_caveat_when_deposits_confidence_below_threshold()
    {
        var extraction = BuildExtraction(totalDeposits: 5_000m, depositsConfidence: 0.55);

        var result = MeansTestCalculator.Calculate(extraction);

        Assert.Contains(result.Caveats, c => c.Contains("0.55"));
        Assert.Contains(result.Caveats, c => c.Contains("attorney review"));
    }

    private static BankStatementExtraction BuildExtraction(decimal totalDeposits, double depositsConfidence) => new(
        BankName: new ExtractedField<string>("Test Bank", 0.95),
        AccountHolderName: new ExtractedField<string>("Test Person", 0.95),
        AccountNumberLast4: new ExtractedField<string>("1234", 0.95),
        StatementPeriodStart: new ExtractedField<DateOnly>(new DateOnly(2026, 4, 1), 0.95),
        StatementPeriodEnd: new ExtractedField<DateOnly>(new DateOnly(2026, 4, 30), 0.95),
        BeginningBalance: new ExtractedField<decimal>(1_000m, 0.95),
        EndingBalance: new ExtractedField<decimal>(1_500m, 0.95),
        TotalDeposits: new ExtractedField<decimal>(totalDeposits, depositsConfidence),
        TotalWithdrawals: new ExtractedField<decimal>(totalDeposits - 500m, 0.95),
        Transactions: new List<BankStatementTransaction>(),
        ReviewerNotes: null);
}
