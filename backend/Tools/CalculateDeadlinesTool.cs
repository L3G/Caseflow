using System.Text.Json;
using System.Text.Json.Serialization;
using Caseflow.Agent;
using Caseflow.Compute;
using Caseflow.Models;

namespace Caseflow.Tools;

public sealed class CalculateDeadlinesTool : ITool
{
    private static readonly JsonSerializerOptions JsonOpts = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        Converters = { new JsonStringEnumConverter(JsonNamingPolicy.CamelCase) },
    };

    public string Name => "CalculateDeadlines";

    public string Description =>
        "Compute Chapter 7 filing deadlines per Fed. R. Bankr. P. 9006 — calendar-day arithmetic, " +
        "weekend and federal holiday adjustment. Petition date is the case creation date.";

    public ToolPolicy Policy => new(
        ToolPolicyDecision.AutoExecute,
        "Pure rule-engine computation; deterministic output with legal citations.");

    public Task<ToolResult> ExecuteAsync(
        CaseSnapshot snapshot,
        JsonElement input,
        CancellationToken ct = default)
    {
        var petitionDate = DateOnly.FromDateTime(snapshot.Case.CreatedAt);
        var schedule = DeadlineEngine.ComputeSchedule(petitionDate);

        var payloadJson = JsonSerializer.Serialize(schedule, JsonOpts);

        var hasMeansTest = snapshot.HasAnalysis(AnalysisType.MeansTest);
        var newState = hasMeansTest ? CaseState.Analyzed : CaseState.AnalysesPending;

        return Task.FromResult(new ToolResult(
            Success: true,
            Confidence: 1.0,
            OutputSummary: $"{schedule.Deadlines.Count} Chapter 7 deadlines computed from petition date {petitionDate:O}.",
            Error: null,
            NewState: newState,
            Persist: new ToolPersistenceHint(
                Kind: ToolPersistenceKind.Analysis,
                PayloadJson: payloadJson,
                AnalysisType: AnalysisType.Deadlines)));
    }
}
