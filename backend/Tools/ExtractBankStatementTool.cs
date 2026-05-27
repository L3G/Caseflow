using System.Text.Json;
using System.Text.Json.Serialization;
using Caseflow.Agent;
using Caseflow.Models;
using Caseflow.Services.Llm;

namespace Caseflow.Tools;

public sealed class ExtractBankStatementTool(ILlmProvider llm, IConfiguration config) : ITool
{
    private static readonly JsonSerializerOptions JsonOpts = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        Converters = { new JsonStringEnumConverter(JsonNamingPolicy.CamelCase) },
    };

    private readonly double _confidenceThreshold =
        config.GetValue("Llm:ConfidenceThreshold", 0.70);

    public string Name => "ExtractBankStatement";

    public string Description =>
        "Extract structured fields from a bank statement — bank name, account holder, period, balances, " +
        "deposits, withdrawals, and transactions. Per-field confidence. Uses gpt-5.4-mini for vision quality.";

    public ToolPolicy Policy => new(
        ToolPolicyDecision.AutoExecute,
        "Extraction is perception, not judgment; low-confidence results flag the case automatically.");

    public async Task<ToolResult> ExecuteAsync(
        CaseSnapshot snapshot,
        JsonElement input,
        CancellationToken ct = default)
    {
        var doc = snapshot.Documents.FirstOrDefault(d => d.DocumentType == DocumentType.BankStatement);
        if (doc is null)
        {
            return new ToolResult(
                Success: false,
                Confidence: 0,
                OutputSummary: null,
                Error: "No bank-statement document available; classification must run first.",
                NewState: null,
                Persist: null);
        }

        var request = new LlmCompletionRequest(
            Tier: LlmTier.Mini,
            SystemPrompt: LlmPrompts.ExtractBankStatementSystem,
            UserMessage: $"Extract the structured fields from the bank statement at the attached path: {doc.FileName}.",
            SchemaName: BankStatementSchema.SchemaName,
            JsonSchema: BankStatementSchema.Json,
            DocumentPath: doc.StoredPath);

        var extraction = await llm.CompleteAsync<BankStatementExtraction>(request, ct);

        var minConf = extraction.MinConfidence;
        var lowConfidence = minConf < _confidenceThreshold;
        var newState = lowConfidence ? CaseState.Flagged : CaseState.Extracted;

        return new ToolResult(
            Success: true,
            Confidence: minConf,
            OutputSummary: lowConfidence
                ? $"Extraction low-confidence (min field {minConf:F2}) — case flagged for attorney review."
                : $"Bank statement extracted: {extraction.Transactions.Count} transactions, min field confidence {minConf:F2}.",
            Error: null,
            NewState: newState,
            Persist: new ToolPersistenceHint(
                Kind: ToolPersistenceKind.Extraction,
                PayloadJson: JsonSerializer.Serialize(extraction, JsonOpts),
                DocumentId: doc.Id,
                ExtractionType: ExtractionType.BankStatement));
    }
}
