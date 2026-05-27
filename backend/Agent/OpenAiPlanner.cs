using Caseflow.Models;
using Caseflow.Services.Llm;
using Caseflow.Tools;

namespace Caseflow.Agent;

public sealed class OpenAiPlanner(ILlmProvider llm) : IPlanner
{
    public async Task<PlannerDecision> PlanAsync(
        CaseSnapshot snapshot,
        IReadOnlyList<ITool> validTools,
        CancellationToken ct = default)
    {
        var validToolNames = validTools.Select(t => t.Name).ToList();
        var schema = PlannerSchema.BuildJsonSchema(validToolNames);
        var userMessage = PlannerPrompt.BuildUserMessage(snapshot, validTools);

        var request = new LlmCompletionRequest(
            Tier: LlmTier.Nano,
            SystemPrompt: PlannerPrompt.System,
            UserMessage: userMessage,
            SchemaName: PlannerSchema.SchemaName,
            JsonSchema: schema);

        return await llm.CompleteAsync<PlannerDecision>(request, ct);
    }
}
