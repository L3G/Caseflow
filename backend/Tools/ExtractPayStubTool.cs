using System.Text.Json;
using Caseflow.Agent;
using Caseflow.Models;

namespace Caseflow.Tools;

public sealed class ExtractPayStubTool : ITool
{
    public string Name => "ExtractPayStub";

    public string Description =>
        "Extract structured fields from a pay stub. Not implemented in the prototype — bank statement " +
        "extraction is the only supported perception path. Returns failure.";

    public ToolPolicy Policy => new(
        ToolPolicyDecision.AutoExecute,
        "Stub returns failure with no side effects.");

    public Task<ToolResult> ExecuteAsync(
        CaseSnapshot snapshot,
        JsonElement input,
        CancellationToken ct = default)
    {
        var result = new ToolResult(
            Success: false,
            Confidence: 0.0,
            OutputSummary: null,
            Error: "ExtractPayStub is out of scope for this prototype. " +
                   "Use ExtractBankStatement for the bank statement perception path.",
            NewState: null,
            Persist: null);
        return Task.FromResult(result);
    }
}
