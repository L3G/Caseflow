using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using System.Text.Json.Serialization;
using Caseflow.Agent;
using Caseflow.Data;
using Caseflow.Endpoints;
using Caseflow.Services;
using Caseflow.Services.Llm;
using Caseflow.Tools;

var builder = WebApplication.CreateBuilder(args);

// Bridge user-friendly env var names from DESIGN §11 into ASP.NET Core config.
// Lets the user `export OPENAI_API_KEY=sk-...` instead of `Llm__ApiKey=...`.
var openAiKey = Environment.GetEnvironmentVariable("OPENAI_API_KEY");
if (!string.IsNullOrWhiteSpace(openAiKey))
{
    builder.Configuration["Llm:ApiKey"] = openAiKey;
}
var llmProvider = Environment.GetEnvironmentVariable("LLM_PROVIDER");
if (!string.IsNullOrWhiteSpace(llmProvider))
{
    builder.Configuration["Llm:Provider"] = llmProvider;
}

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

// LLM stack: register Mock as the default, then override with OpenAI if configured.
// Last-registered wins for singular IPlanner / ILlmProvider resolution per .NET DI contract.
builder.Services.AddScoped<IPlanner, MockPlanner>();
builder.Services.AddScoped<ILlmProvider, MockLlmProvider>();
if (string.Equals(builder.Configuration["Llm:Provider"], "OpenAI", StringComparison.OrdinalIgnoreCase))
{
    builder.Services.AddScoped<IPlanner, OpenAiPlanner>();
    builder.Services.AddScoped<ILlmProvider, OpenAiLlmProvider>();
}

builder.Services.AddScoped<IPolicy, ConfigPolicy>();
builder.Services.AddScoped<ToolRegistry>();

builder.Services.AddScoped<AgentOrchestrator>();

builder.Services.AddScoped<ITool, FlagForAttorneyReviewTool>();
builder.Services.AddScoped<ITool, RequestAttorneyApprovalTool>();
builder.Services.AddScoped<ITool, ExtractPayStubTool>();
builder.Services.AddScoped<ITool, ComputeMeansTestTool>();
builder.Services.AddScoped<ITool, CalculateDeadlinesTool>();
builder.Services.AddScoped<ITool, CheckArithmeticIntegrityTool>();

builder.Services.AddScoped<ITool, ClassifyDocumentTool>();
builder.Services.AddScoped<ITool, ExtractBankStatementTool>();
builder.Services.AddScoped<ITool, DraftClientEmailTool>();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.EnsureCreated();
}

app.UseCors();
app.UseDefaultFiles();
app.UseStaticFiles();

app.MapCasesEndpoints();
app.MapApprovalsEndpoints();

app.MapFallbackToFile("index.html");

app.Run();
