using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;
using Caseflow.Agent;
using Caseflow.Data;
using Caseflow.Models;

namespace Caseflow.Services;

public sealed class CaseStore(AppDbContext db) : ICaseStore
{
    private static readonly JsonSerializerOptions JsonOpts = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        Converters = { new JsonStringEnumConverter(JsonNamingPolicy.CamelCase) },
    };

    public async Task<Case> CreateAsync(
        string clientName,
        string documentId,
        string fileName,
        string storedPath,
        CancellationToken ct = default)
    {
        var existing = await db.Cases.FirstOrDefaultAsync(c => c.Id == documentId, ct);
        if (existing is not null) return existing;

        var now = DateTime.UtcNow;
        var newCase = new Case
        {
            Id = documentId,
            ClientName = clientName,
            WorkflowTitle = "Chapter 7 Intake",
            Assignee = string.Empty,
            State = CaseState.DocumentReceived,
            CreatedAt = now,
            UpdatedAt = now,
        };
        var doc = new CaseDocument
        {
            Id = documentId,
            CaseId = documentId,
            FileName = fileName,
            StoredPath = storedPath,
            DocumentType = null,
            UploadedAt = now,
        };

        db.Cases.Add(newCase);
        db.CaseDocuments.Add(doc);
        db.CaseEvents.Add(new CaseEvent
        {
            CaseId = newCase.Id,
            EventType = CaseEventType.CaseCreated,
            Actor = CaseEventActor.System,
            PayloadJson = JsonSerializer.Serialize(
                new { clientName, workflowTitle = "Chapter 7 Intake" }, JsonOpts),
            At = now,
        });
        db.CaseEvents.Add(new CaseEvent
        {
            CaseId = newCase.Id,
            EventType = CaseEventType.DocumentUploaded,
            Actor = CaseEventActor.System,
            PayloadJson = JsonSerializer.Serialize(
                new { fileName, documentId, storedPath }, JsonOpts),
            At = now,
        });

        await db.SaveChangesAsync(ct);
        return newCase;
    }

    public Task<Case?> GetByIdAsync(string caseId, CancellationToken ct = default) =>
        db.Cases.FirstOrDefaultAsync(c => c.Id == caseId, ct);

    public async Task<IReadOnlyList<Case>> ListAsync(CancellationToken ct = default) =>
        await db.Cases.OrderByDescending(c => c.CreatedAt).ToListAsync(ct);

    public async Task<CaseSnapshot?> GetSnapshotAsync(
        string caseId,
        int recentEventCount = 10,
        CancellationToken ct = default)
    {
        var caseEntity = await db.Cases.FirstOrDefaultAsync(c => c.Id == caseId, ct);
        if (caseEntity is null) return null;

        var documents = await db.CaseDocuments
            .Where(d => d.CaseId == caseId)
            .OrderBy(d => d.UploadedAt)
            .ToListAsync(ct);
        var extractions = await db.Extractions
            .Where(e => e.CaseId == caseId)
            .OrderBy(e => e.CreatedAt)
            .ToListAsync(ct);
        var analyses = await db.Analyses
            .Where(a => a.CaseId == caseId)
            .OrderBy(a => a.CreatedAt)
            .ToListAsync(ct);
        var recentEvents = await db.CaseEvents
            .Where(e => e.CaseId == caseId)
            .OrderByDescending(e => e.At)
            .Take(recentEventCount)
            .ToListAsync(ct);
        var approvals = await db.PendingApprovals
            .Where(a => a.CaseId == caseId && a.ResolvedAt == null)
            .OrderBy(a => a.RequestedAt)
            .ToListAsync(ct);

        return new CaseSnapshot(caseEntity, documents, extractions, analyses, recentEvents, approvals);
    }

    public async Task ApplyToolResultAsync(
        string caseId,
        string toolName,
        ToolResult result,
        CancellationToken ct = default)
    {
        if (!result.Success)
        {
            throw new InvalidOperationException(
                "ApplyToolResultAsync called with a failed ToolResult — callers must check Success first.");
        }

        var caseEntity = await db.Cases.FirstOrDefaultAsync(c => c.Id == caseId, ct)
            ?? throw new InvalidOperationException($"Case {caseId} not found.");

        var now = DateTime.UtcNow;
        var oldState = caseEntity.State;

        if (result.Persist is { } hint)
        {
            switch (hint.Kind)
            {
                case ToolPersistenceKind.Extraction:
                    await UpsertExtractionAsync(caseId, hint, now, ct);
                    break;
                case ToolPersistenceKind.Analysis:
                    await UpsertAnalysisAsync(caseId, hint, now, ct);
                    break;
                case ToolPersistenceKind.DocumentClassification:
                    await UpdateDocumentClassificationAsync(caseId, hint, ct);
                    break;
            }
        }

        if (result.NewState is { } newState && newState != oldState)
        {
            caseEntity.State = newState;
            caseEntity.UpdatedAt = now;
            db.CaseEvents.Add(new CaseEvent
            {
                CaseId = caseId,
                EventType = CaseEventType.StateTransitioned,
                Actor = CaseEventActor.Agent,
                PayloadJson = JsonSerializer.Serialize(
                    new { from = oldState, to = newState, toolName }, JsonOpts),
                At = now,
            });
        }

        db.CaseEvents.Add(new CaseEvent
        {
            CaseId = caseId,
            EventType = CaseEventType.ToolSucceeded,
            Actor = CaseEventActor.Agent,
            PayloadJson = JsonSerializer.Serialize(
                new { toolName, confidence = result.Confidence, summary = result.OutputSummary }, JsonOpts),
            At = now,
        });

        await db.SaveChangesAsync(ct);
    }

    private async Task UpsertExtractionAsync(
        string caseId,
        ToolPersistenceHint hint,
        DateTime now,
        CancellationToken ct)
    {
        var type = hint.ExtractionType
            ?? throw new InvalidOperationException("Extraction hint missing ExtractionType.");
        var documentId = hint.DocumentId
            ?? throw new InvalidOperationException("Extraction hint missing DocumentId.");

        var existing = await db.Extractions.FirstOrDefaultAsync(
            e => e.CaseId == caseId && e.ExtractionType == type && e.DocumentId == documentId, ct);

        if (existing is not null)
        {
            existing.PayloadJson = hint.PayloadJson;
            existing.UpdatedAt = now;
        }
        else
        {
            db.Extractions.Add(new Extraction
            {
                CaseId = caseId,
                DocumentId = documentId,
                ExtractionType = type,
                PayloadJson = hint.PayloadJson,
                CreatedAt = now,
            });
        }
    }

    private async Task UpsertAnalysisAsync(
        string caseId,
        ToolPersistenceHint hint,
        DateTime now,
        CancellationToken ct)
    {
        var type = hint.AnalysisType
            ?? throw new InvalidOperationException("Analysis hint missing AnalysisType.");

        var existing = await db.Analyses.FirstOrDefaultAsync(
            a => a.CaseId == caseId && a.AnalysisType == type, ct);

        if (existing is not null)
        {
            existing.PayloadJson = hint.PayloadJson;
            existing.UpdatedAt = now;
        }
        else
        {
            db.Analyses.Add(new Analysis
            {
                CaseId = caseId,
                AnalysisType = type,
                PayloadJson = hint.PayloadJson,
                CreatedAt = now,
            });
        }
    }

    private async Task UpdateDocumentClassificationAsync(
        string caseId,
        ToolPersistenceHint hint,
        CancellationToken ct)
    {
        var documentId = hint.DocumentId
            ?? throw new InvalidOperationException("Classification hint missing DocumentId.");
        var classifiedAs = hint.DocumentType
            ?? throw new InvalidOperationException("Classification hint missing DocumentType.");

        var doc = await db.CaseDocuments.FirstOrDefaultAsync(
            d => d.Id == documentId && d.CaseId == caseId, ct);
        if (doc is not null)
        {
            doc.DocumentType = classifiedAs;
        }
    }
}
