using Caseflow.Models;

namespace Caseflow.Services.Llm;

public sealed class MockLlmProvider : ILlmProvider
{
    public Task<T> CompleteAsync<T>(LlmCompletionRequest request, CancellationToken ct = default)
    {
        object fixture = typeof(T) switch
        {
            var t when t == typeof(ClassificationResult)    => BuildClassification(),
            var t when t == typeof(BankStatementExtraction) => BuildBankStatement(),
            var t when t == typeof(EmailDraft)              => BuildEmailDraft(),
            _ => throw new InvalidOperationException(
                $"MockLlmProvider has no fixture for {typeof(T).Name}. Add a fixture branch or use OpenAiLlmProvider."),
        };

        return Task.FromResult((T)fixture);
    }

    private static ClassificationResult BuildClassification() => new(
        DocumentType: DocumentType.BankStatement,
        Confidence: 0.95,
        Reasoning: "Mock provider returns BankStatement deterministically — header layout, balance fields, and dated transaction rows are characteristic of a bank statement.");

    private static BankStatementExtraction BuildBankStatement()
    {
        var transactions = new List<BankStatementTransaction>
        {
            new(new DateOnly(2026, 4, 3),  "Direct Deposit — Acme Payroll",  2_500.00m, TransactionDirection.Deposit),
            new(new DateOnly(2026, 4, 5),  "Rent — Apartment 2B",            1_650.00m, TransactionDirection.Withdrawal),
            new(new DateOnly(2026, 4, 12), "Grocery — Trader Joe's",           145.00m, TransactionDirection.Withdrawal),
            new(new DateOnly(2026, 4, 17), "Direct Deposit — Acme Payroll",  2_500.00m, TransactionDirection.Deposit),
            new(new DateOnly(2026, 4, 22), "Utilities — City Power",           185.00m, TransactionDirection.Withdrawal),
            new(new DateOnly(2026, 4, 28), "Auto Loan — Wells Fargo",          420.00m, TransactionDirection.Withdrawal),
        };

        // Reconciles: 1,200 + 5,000 - 2,400 = 3,800
        // Means test: 5,000 * 12 = 60,000 < 76,000 threshold -> PASSES
        return new BankStatementExtraction(
            BankName:             new ExtractedField<string>("First National Bank",       0.97),
            AccountHolderName:    new ExtractedField<string>("Jordan A. Park",            0.96),
            AccountNumberLast4:   new ExtractedField<string>("4729",                      0.99),
            StatementPeriodStart: new ExtractedField<DateOnly>(new DateOnly(2026, 4, 1),  0.98),
            StatementPeriodEnd:   new ExtractedField<DateOnly>(new DateOnly(2026, 4, 30), 0.98),
            BeginningBalance:     new ExtractedField<decimal>(1_200.00m,                  0.96),
            EndingBalance:        new ExtractedField<decimal>(3_800.00m,                  0.96),
            TotalDeposits:        new ExtractedField<decimal>(5_000.00m,                  0.97),
            TotalWithdrawals:     new ExtractedField<decimal>(2_400.00m,                  0.97),
            Transactions:         transactions,
            ReviewerNotes:        null);
    }

    private static EmailDraft BuildEmailDraft() => new(
        Subject: "Update on your Chapter 7 case",
        Body: """
            Hello,

            We have made progress on your bankruptcy case this week. Our team has reviewed the bank statement you uploaded, completed the means test calculation, and computed the filing deadlines that apply to your matter.

            Next, we will prepare the schedules and the Section 341 meeting of creditors will be scheduled. You will receive a separate notice from the court with the exact date and time.

            Reach out with any questions in the meantime.

            — Your case team
            """);
}
