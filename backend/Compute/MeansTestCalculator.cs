using Caseflow.Models;

namespace Caseflow.Compute;

public static class MeansTestCalculator
{
    public const decimal MedianIncomeThreshold = 76_000m;
    public const double LowConfidenceThreshold = 0.70;

    public static MeansTestResult Calculate(BankStatementExtraction extraction)
    {
        var monthlyProxy = extraction.TotalDeposits.Value;
        var annualized = monthlyProxy * 12m;
        var passes = annualized < MedianIncomeThreshold;

        var caveats = new List<string>
        {
            "Monthly gross income proxy = bank statement total deposits. " +
                "Production should use pay-stub extractions across a 6-month look-back per 11 U.S.C. § 707(b)(2).",
            "Annualized = monthly × 12. Production should use the 6-month average × 2 per 11 U.S.C. § 707(b)(2)(C).",
            $"Median income threshold ${MedianIncomeThreshold:N0} is a single national-average single-filer value. " +
                "Production should lookup by state + household size from the DOJ table.",
        };

        if (extraction.TotalDeposits.Confidence < LowConfidenceThreshold)
        {
            caveats.Add(
                $"Total deposits confidence is {extraction.TotalDeposits.Confidence:F2} — below the {LowConfidenceThreshold:F2} threshold. " +
                "Recommend attorney review of the extracted value before relying on this result.");
        }

        return new MeansTestResult(
            MonthlyGrossIncomeProxy: monthlyProxy,
            AnnualizedIncomeProxy: annualized,
            MedianIncomeThreshold: MedianIncomeThreshold,
            Passes: passes,
            Methodology:
                "Bank-statement total deposits used as monthly gross income proxy. " +
                "Annualized as proxy × 12. Compared against a single-value national median threshold.",
            Caveats: caveats);
    }
}
