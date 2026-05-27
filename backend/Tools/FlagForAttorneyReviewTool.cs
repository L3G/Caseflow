using System.Text.Json;
using Caseflow.Agent;
using Caseflow.Models;

namespace Caseflow.Tools;

public sealed class FlagForAttorneyReviewTool : ITool
{
    public string Name => "FlagForAttorneyReview";

    public string Description =>
        "Flag the case for attorney review when something looks anomalous — mismatched numbers, " +
        "missing required fields, signs of fraud, or any condition that requires a human decision. " +
        "The agent stops; a human takes over. This is the abort lever, always safe to call.";

    public ToolPolicy Policy => new(
        ToolPolicyDecision.AutoExecute,
        "Always safe: flagging never advances the case; it routes to a human.");

    public Task<ToolResult> ExecuteAsync(
        CaseSnapshot snapshot,
        JsonElement input,
        CancellationToken ct = default)
    {
        var result = new ToolResult(
            Success: true,
            Confidence: 1.0,
            OutputSummary: $"Case flagged for attorney review from state {snapshot.State}.",
            Error: null,
            NewState: CaseState.Flagged,
            Persist: null);
        return Task.FromResult(result);
    }
}
