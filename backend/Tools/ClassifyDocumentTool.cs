using System.Text.Json;
using System.Text.Json.Serialization;
using Caseflow.Agent;
using Caseflow.Models;
using Caseflow.Services.Llm;

namespace Caseflow.Tools;

public sealed class ClassifyDocumentTool(ILlmProvider llm) : ITool
{
    private static readonly JsonSerializerOptions JsonOpts = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        Converters = { new JsonStringEnumConverter(JsonNamingPolicy.CamelCase) },
    };

    private const double LowConfidenceThreshold = 0.70;

    public string Name => "ClassifyDocument";

    public string Description =>
        "Look at the uploaded document and identify its type (bank statement, pay stub, tax return, etc.). " +
        "Uses gpt-5.4-nano. Low confidence (<0.70) flags the case for attorney review.";

    public ToolPolicy Policy => new(
        ToolPolicyDecision.AutoExecute,
        "Misclassification routes to the wrong tool, not to a court filing — safe to auto-run.");

    public async Task<ToolResult> ExecuteAsync(
        CaseSnapshot snapshot,
        JsonElement input,
        CancellationToken ct = default)
    {
        var doc = snapshot.Documents.FirstOrDefault();
        if (doc is null)
        {
            return new ToolResult(
                Success: false,
                Confidence: 0,
                OutputSummary: null,
                Error: "No documents on case; cannot classify.",
                NewState: null,
                Persist: null);
        }

        var request = new LlmCompletionRequest(
            Tier: LlmTier.Nano,
            SystemPrompt: LlmPrompts.ClassifyDocumentSystem,
            UserMessage: $"Classify the document at the attached path: {doc.FileName}.",
            SchemaName: ClassificationSchema.SchemaName,
            JsonSchema: ClassificationSchema.Json,
            DocumentPath: doc.StoredPath);

        var classification = await llm.CompleteAsync<ClassificationResult>(request, ct);

        var lowConfidence = classification.Confidence < LowConfidenceThreshold;
        var newState = lowConfidence ? CaseState.Flagged : CaseState.Classified;

        return new ToolResult(
            Success: true,
            Confidence: classification.Confidence,
            OutputSummary: lowConfidence
                ? $"Low-confidence classification ({classification.Confidence:F2}) — case flagged for attorney review."
                : $"Classified as {classification.DocumentType} (confidence {classification.Confidence:F2}).",
            Error: null,
            NewState: newState,
            Persist: new ToolPersistenceHint(
                Kind: ToolPersistenceKind.DocumentClassification,
                PayloadJson: JsonSerializer.Serialize(classification, JsonOpts),
                DocumentId: doc.Id,
                DocumentType: classification.DocumentType));
    }
}
