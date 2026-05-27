using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;
using Caseflow.Data;
using Caseflow.Models;

namespace Caseflow.Services;

public sealed class AuditLog(AppDbContext db) : IAuditLog
{
    private static readonly JsonSerializerOptions JsonOpts = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        Converters = { new JsonStringEnumConverter(JsonNamingPolicy.CamelCase) },
    };

    public async Task AppendAsync(
        string caseId,
        CaseEventType eventType,
        CaseEventActor actor,
        object payload,
        CancellationToken ct = default)
    {
        db.CaseEvents.Add(new CaseEvent
        {
            CaseId = caseId,
            EventType = eventType,
            Actor = actor,
            PayloadJson = JsonSerializer.Serialize(payload, JsonOpts),
            At = DateTime.UtcNow,
        });
        await db.SaveChangesAsync(ct);
    }

    public async Task<IReadOnlyList<CaseEvent>> GetByCaseAsync(
        string caseId,
        int? limit = null,
        CancellationToken ct = default)
    {
        IQueryable<CaseEvent> query = db.CaseEvents
            .Where(e => e.CaseId == caseId)
            .OrderByDescending(e => e.At);
        if (limit.HasValue) query = query.Take(limit.Value);
        return await query.ToListAsync(ct);
    }
}
