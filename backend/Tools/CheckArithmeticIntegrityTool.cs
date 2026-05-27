using System.Text.Json;
using System.Text.Json.Serialization;
using Caseflow.Agent;
using Caseflow.Models;

namespace Caseflow.Tools;

public sealed class CheckArithmeticIntegrityTool : ITool
{
    private static readonly JsonSerializerOptions JsonOpts = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        Converters = { new JsonStringEnumConverter(JsonNamingPolicy.CamelCase) },
    };

    private const decimal ReconciliationTolerance = 0.01m;

    public string Name => "CheckArithmeticIntegrity";

    public string Description =>
        "Verify the bank statement reconciles — beginning balance + total deposits − total withdrawals = " +
        "ending balance (within $0.01). Flags the case on reconciliation failure.";

    public ToolPolicy Policy => new(
        ToolPolicyDecision.AutoExecute,
        "Pure code; reconciliation is arithmetic, never judgment.");

    public Task<ToolResult> ExecuteAsync(
        CaseSnapshot snapshot,
        JsonElement input,
        CancellationToken ct = default)
    {
        var bankStatementRow = snapshot.LatestExtraction(ExtractionType.BankStatement);
        if (bankStatementRow is null)
        {
            return Task.FromResult(new ToolResult(
                Success: false,
                Confidence: 0,
                OutputSummary: null,
                Error: "No bank statement extraction available for arithmetic check.",
                NewState: null,
                Persist: null));
        }

        var extraction = JsonSerializer.Deserialize<BankStatementExtraction>(
            bankStatementRow.PayloadJson, JsonOpts)
            ?? throw new InvalidOperationException("Failed to deserialize bank statement extraction.");

        var expected = extraction.BeginningBalance.Value
            + extraction.TotalDeposits.Value
            - extraction.TotalWithdrawals.Value;
        var actual = extraction.EndingBalance.Value;
        var discrepancy = Math.Abs(expected - actual);
        var reconciles = discrepancy <= ReconciliationTolerance;

        var notes = new List<string>
        {
            reconciles
                ? $"Reconciliation passed within ${ReconciliationTolerance} tolerance."
                : $"Reconciliation FAILED: expected {expected:C}, actual {actual:C}, discrepancy {discrepancy:C}.",
        };

        var arithCheck = new ArithmeticCheckResult(
            BalanceReconciles: reconciles,
            ExpectedEndingBalance: expected,
            ActualEndingBalance: actual,
            Discrepancy: discrepancy,
            Notes: notes);

        var payloadJson = JsonSerializer.Serialize(arithCheck, JsonOpts);

        return Task.FromResult(new ToolResult(
            Success: true,
            Confidence: 1.0,
            OutputSummary: reconciles
                ? "Bank statement arithmetic reconciles."
                : $"Reconciliation FAILED — discrepancy {discrepancy:C}; flagging for attorney review.",
            Error: null,
            NewState: reconciles ? null : CaseState.Flagged,
            Persist: new ToolPersistenceHint(
                Kind: ToolPersistenceKind.Analysis,
                PayloadJson: payloadJson,
                AnalysisType: AnalysisType.ArithmeticIntegrity)));
    }
}
