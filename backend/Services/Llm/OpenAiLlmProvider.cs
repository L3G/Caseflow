using System.Text.Json;
using System.Text.Json.Serialization;
using OpenAI.Chat;
using Caseflow.Models;

namespace Caseflow.Services.Llm;

public sealed class OpenAiLlmProvider : ILlmProvider
{
    private static readonly JsonSerializerOptions JsonOpts = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        Converters = { new JsonStringEnumConverter(JsonNamingPolicy.CamelCase) },
    };

    private readonly string _apiKey;
    private readonly string _nanoModel;
    private readonly string _miniModel;

    public OpenAiLlmProvider(IConfiguration config)
    {
        _apiKey = config["Llm:ApiKey"]
            ?? throw new InvalidOperationException(
                "Llm:ApiKey is not configured. Set OPENAI_API_KEY environment variable.");
        if (string.IsNullOrWhiteSpace(_apiKey))
        {
            throw new InvalidOperationException(
                "Llm:ApiKey is empty. Set OPENAI_API_KEY environment variable.");
        }
        _nanoModel = config["Llm:Model:Nano"] ?? "gpt-5.4-nano";
        _miniModel = config["Llm:Model:Mini"] ?? "gpt-5.4-mini";
    }

    public async Task<T> CompleteAsync<T>(LlmCompletionRequest request, CancellationToken ct = default)
    {
        var modelId = request.Tier switch
        {
            LlmTier.Nano => _nanoModel,
            LlmTier.Mini => _miniModel,
            _ => throw new InvalidOperationException($"Unknown LLM tier: {request.Tier}"),
        };

        var chat = new ChatClient(model: modelId, apiKey: _apiKey);

        var messages = new List<ChatMessage>
        {
            new SystemChatMessage(request.SystemPrompt),
            new UserChatMessage(request.UserMessage),
        };

        var options = new ChatCompletionOptions
        {
            ResponseFormat = ChatResponseFormat.CreateJsonSchemaFormat(
                jsonSchemaFormatName: request.SchemaName,
                jsonSchema: BinaryData.FromString(request.JsonSchema),
                jsonSchemaIsStrict: true),
        };

        var completion = await chat.CompleteChatAsync(messages, options, ct);
        var json = completion.Value.Content[0].Text;

        var parsed = JsonSerializer.Deserialize<T>(json, JsonOpts);
        if (parsed is null)
        {
            throw new InvalidOperationException(
                $"OpenAI returned a JSON payload that failed to deserialize to {typeof(T).Name}. Raw: {json}");
        }
        return parsed;
    }
}
