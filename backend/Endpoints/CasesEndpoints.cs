using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Caseflow.Agent;
using Caseflow.Data;
using Caseflow.Models;
using Caseflow.Services;

namespace Caseflow.Endpoints;

public static class CasesEndpoints
{
    private static readonly JsonSerializerOptions JsonOpts = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        Converters = { new JsonStringEnumConverter(JsonNamingPolicy.CamelCase) },
    };

    public static void MapCasesEndpoints(this WebApplication app)
    {
        var cases = app.MapGroup("/api/cases");

        cases.MapGet("", async (ICaseStore store, CancellationToken ct) =>
            await store.ListAsync(ct));

        cases.MapGet("{id}", async (string id, ICaseStore store, CancellationToken ct) =>
        {
            var c = await store.GetByIdAsync(id, ct);
            return c is null
                ? Results.NotFound(new { error = $"Case {id} not found." })
                : Results.Ok(c);
        });

        cases.MapPost("", async (
            [FromForm] string clientName,
            IFormFile document,
            IDocumentStore docs,
            ICaseStore store,
            CancellationToken ct) =>
        {
            if (string.IsNullOrWhiteSpace(clientName))
                return Results.BadRequest(new { error = "clientName is required." });
            if (document.Length == 0)
                return Results.BadRequest(new { error = "document file is empty." });

            using var stream = document.OpenReadStream();
            var stored = await docs.StoreAsync(document.FileName, stream, ct);
            var caseEntity = await store.CreateAsync(
                clientName: clientName,
                documentId: stored.Id,
                fileName: document.FileName,
                storedPath: stored.StoredPath,
                ct: ct);

            return Results.Created($"/api/cases/{caseEntity.Id}", caseEntity);
        }).DisableAntiforgery();

        cases.MapPost("{id}/run", async (
            string id,
            AgentOrchestrator orchestrator,
            ICaseStore store,
            CancellationToken ct) =>
        {
            var exists = await store.GetByIdAsync(id, ct);
            if (exists is null)
                return Results.NotFound(new { error = $"Case {id} not found." });

            var result = await orchestrator.RunUntilCheckpointAsync(id, ct);
            return Results.Ok(result);
        });

        cases.MapGet("{id}/events", async (
            string id,
            IAuditLog audit,
            CancellationToken ct) =>
        {
            var events = await audit.GetByCaseAsync(id, limit: null, ct);
            return events;
        });

        cases.MapGet("{id}/extraction", async (
            string id,
            AppDbContext db,
            CancellationToken ct) =>
        {
            var extraction = await db.Extractions
                .Where(e => e.CaseId == id && e.ExtractionType == ExtractionType.BankStatement)
                .OrderByDescending(e => e.CreatedAt)
                .FirstOrDefaultAsync(ct);
            if (extraction is null)
                return Results.NoContent();

            var payload = JsonSerializer.Deserialize<BankStatementExtraction>(extraction.PayloadJson, JsonOpts);
            return Results.Ok(payload);
        });

        cases.MapGet("{id}/analyses", async (
            string id,
            AppDbContext db,
            CancellationToken ct) =>
        {
            var rows = await db.Analyses.Where(a => a.CaseId == id).ToListAsync(ct);

            MeansTestResult? meansTest = null;
            DeadlineSchedule? deadlines = null;
            ArithmeticCheckResult? arithCheck = null;

            foreach (var row in rows)
            {
                switch (row.AnalysisType)
                {
                    case AnalysisType.MeansTest:
                        meansTest = JsonSerializer.Deserialize<MeansTestResult>(row.PayloadJson, JsonOpts);
                        break;
                    case AnalysisType.Deadlines:
                        deadlines = JsonSerializer.Deserialize<DeadlineSchedule>(row.PayloadJson, JsonOpts);
                        break;
                    case AnalysisType.ArithmeticIntegrity:
                        arithCheck = JsonSerializer.Deserialize<ArithmeticCheckResult>(row.PayloadJson, JsonOpts);
                        break;
                }
            }

            return Results.Ok(new AnalysesBag(meansTest, deadlines, arithCheck));
        });

        cases.MapGet("{id}/approvals", async (
            string id,
            AppDbContext db,
            CancellationToken ct) =>
        {
            return await db.PendingApprovals
                .Where(a => a.CaseId == id)
                .OrderByDescending(a => a.RequestedAt)
                .ToListAsync(ct);
        });
    }
}

public sealed record AnalysesBag(
    MeansTestResult? MeansTest,
    DeadlineSchedule? Deadlines,
    ArithmeticCheckResult? ArithCheck);
