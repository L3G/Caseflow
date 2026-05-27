using Caseflow.Models;

namespace Caseflow.Services.Llm;

public interface ILlmProvider
{
    Task<T> CompleteAsync<T>(LlmCompletionRequest request, CancellationToken ct = default);
}

public sealed record LlmCompletionRequest(
    LlmTier Tier,
    string SystemPrompt,
    string UserMessage,
    string SchemaName,
    string JsonSchema,
    string? DocumentPath = null);
