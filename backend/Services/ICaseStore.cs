using Caseflow.Agent;
using Caseflow.Models;

namespace Caseflow.Services;

public interface ICaseStore
{
    Task<Case> CreateAsync(
        string clientName,
        string documentId,
        string fileName,
        string storedPath,
        CancellationToken ct = default);

    Task<Case?> GetByIdAsync(string caseId, CancellationToken ct = default);

    Task<IReadOnlyList<Case>> ListAsync(CancellationToken ct = default);

    Task<CaseSnapshot?> GetSnapshotAsync(
        string caseId,
        int recentEventCount = 10,
        CancellationToken ct = default);

    Task ApplyToolResultAsync(
        string caseId,
        string toolName,
        ToolResult result,
        CancellationToken ct = default);
}
