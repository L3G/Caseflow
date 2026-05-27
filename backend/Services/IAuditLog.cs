using Caseflow.Models;

namespace Caseflow.Services;

public interface IAuditLog
{
    Task AppendAsync(
        string caseId,
        CaseEventType eventType,
        CaseEventActor actor,
        object payload,
        CancellationToken ct = default);

    Task<IReadOnlyList<CaseEvent>> GetByCaseAsync(
        string caseId,
        int? limit = null,
        CancellationToken ct = default);
}
