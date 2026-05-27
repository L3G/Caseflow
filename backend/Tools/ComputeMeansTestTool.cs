using System.Text.Json;
using System.Text.Json.Serialization;
using Caseflow.Agent;
using Caseflow.Compute;
using Caseflow.Models;

namespace Caseflow.Tools;

public sealed class ComputeMeansTestTool : ITool
{
    private static readonly JsonSerializerOptions JsonOpts = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        Converters = { new JsonStringEnumConverter(JsonNamingPolicy.CamelCase) },
    };

    public string Name => "ComputeMeansTest";

    public string Description =>
        "Compute the Chapter 7 means test from the latest bank statement extraction — " +
        "annualized income proxy compared against the median income threshold. Pure code, no LLM.";

    public ToolPolicy Policy => new(
        ToolPolicyDecision.AutoExecute,
        "Pure arithmetic; deterministic output, never wrong by hallucination.");

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
                Error: "No bank statement extraction available; means test cannot run.",
                NewState: null,
                Persist: null));
        }

        var extraction = JsonSerializer.Deserialize<BankStatementExtraction>(
            bankStatementRow.PayloadJson, JsonOpts)
            ?? throw new InvalidOperationException("Failed to deserialize bank statement extraction.");

        var meansTest = MeansTestCalculator.Calculate(extraction);
        var payloadJson = JsonSerializer.Serialize(meansTest, JsonOpts);

        var hasDeadlines = snapshot.HasAnalysis(AnalysisType.Deadlines);
        var newState = hasDeadlines ? CaseState.Analyzed : CaseState.AnalysesPending;

        return Task.FromResult(new ToolResult(
            Success: true,
            Confidence: 1.0,
            OutputSummary: meansTest.Passes
                ? $"Means test PASSES — ${meansTest.AnnualizedIncomeProxy:N0} annualized < ${meansTest.MedianIncomeThreshold:N0}."
                : $"Means test FAILS — ${meansTest.AnnualizedIncomeProxy:N0} annualized ≥ ${meansTest.MedianIncomeThreshold:N0}.",
            Error: null,
            NewState: newState,
            Persist: new ToolPersistenceHint(
                Kind: ToolPersistenceKind.Analysis,
                PayloadJson: payloadJson,
                AnalysisType: AnalysisType.MeansTest)));
    }
}
