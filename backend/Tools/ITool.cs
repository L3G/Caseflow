using System.Text.Json;
using Caseflow.Agent;
using Caseflow.Models;

namespace Caseflow.Tools;

public interface ITool
{
    string Name { get; }
    string Description { get; }
    ToolPolicy Policy { get; }

    Task<ToolResult> ExecuteAsync(
        CaseSnapshot snapshot,
        JsonElement input,
        CancellationToken ct = default);
}
