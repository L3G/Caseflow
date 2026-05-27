using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using System.Text.Json.Serialization;
using Caseflow.Agent;
using Caseflow.Data;
using Caseflow.Services;
using Caseflow.Tools;

var builder = WebApplication.CreateBuilder(args);

builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
    options.SerializerOptions.Converters.Add(
        new JsonStringEnumConverter(JsonNamingPolicy.CamelCase));
});

builder.Services.AddDbContext<AppDbContext>(options =>
{
    var connectionString = builder.Configuration.GetConnectionString("Caseflow")
        ?? throw new InvalidOperationException("ConnectionStrings:Caseflow is not configured.");
    options.UseSqlite(connectionString);
});

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy => policy
        .WithOrigins("http://localhost:5173")
        .AllowAnyHeader()
        .AllowAnyMethod());
});

builder.Services.AddScoped<IDocumentStore, DocumentStore>();
builder.Services.AddScoped<IAuditLog, AuditLog>();
builder.Services.AddScoped<ICaseStore, CaseStore>();

builder.Services.AddScoped<IPlanner, MockPlanner>();
builder.Services.AddScoped<IPolicy, ConfigPolicy>();
builder.Services.AddScoped<ToolRegistry>();

builder.Services.AddScoped<AgentOrchestrator>();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.EnsureCreated();
}

app.UseCors();
app.UseDefaultFiles();
app.UseStaticFiles();

app.MapGet("/api/cases", async (AppDbContext db) =>
    await db.Cases.OrderByDescending(c => c.CreatedAt).ToListAsync());

app.MapFallbackToFile("index.html");

app.Run();
