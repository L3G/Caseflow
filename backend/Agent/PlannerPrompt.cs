using System.Text;
using Caseflow.Tools;

namespace Caseflow.Agent;

public static class PlannerPrompt
{
    public const string System = """
        You are the orchestrator for a Chapter 7 bankruptcy intake workflow. You are not a legal advisor — you do not give legal opinions. Your job is to pick the single next action that advances the case toward attorney review.

        Rules you must follow:

        1. Choose exactly ONE action from the list of valid tools provided in the user message.
        2. You MUST list at least one alternative you considered and the specific reason you rejected it.
        3. If anything about the case looks anomalous — mismatched numbers, missing required fields, low extraction confidence, signs of fraud — choose `FlagForAttorneyReview` and explain what triggered the flag.
        4. Choose `Done` ONLY if there is no productive action that advances the case from its current state. Being "blocked on a human" is not Done — the orchestrator handles that separately.
        5. Reasoning must be specific to this case. Do not produce generic boilerplate.

        Your output must conform to the provided JSON schema. Any deviation is a violation.
        """;

    public static string BuildUserMessage(CaseSnapshot snapshot, IReadOnlyList<ITool> validTools)
    {
        var sb = new StringBuilder();

        sb.AppendLine($"# Case {snapshot.CaseId}");
        sb.AppendLine($"State: {snapshot.State}");
        sb.AppendLine($"Workflow: {snapshot.Case.WorkflowTitle}");
        sb.AppendLine($"Client: {snapshot.Case.ClientName}");
        sb.AppendLine();

        sb.AppendLine("## Documents");
        if (snapshot.Documents.Count == 0)
        {
            sb.AppendLine("(none)");
        }
        else
        {
            foreach (var doc in snapshot.Documents)
            {
                var docType = doc.DocumentType?.ToString() ?? "Unknown";
                sb.AppendLine($"- {doc.FileName} (type: {docType}, uploaded {doc.UploadedAt:O})");
            }
        }
        sb.AppendLine();

        sb.AppendLine("## Existing extractions");
        if (snapshot.Extractions.Count == 0)
        {
            sb.AppendLine("(none)");
        }
        else
        {
            foreach (var ex in snapshot.Extractions)
            {
                sb.AppendLine($"- {ex.ExtractionType} extracted at {ex.CreatedAt:O}");
            }
        }
        sb.AppendLine();

        sb.AppendLine("## Existing analyses");
        if (snapshot.Analyses.Count == 0)
        {
            sb.AppendLine("(none)");
        }
        else
        {
            foreach (var an in snapshot.Analyses)
            {
                sb.AppendLine($"- {an.AnalysisType} analyzed at {an.CreatedAt:O}");
            }
        }
        sb.AppendLine();

        sb.AppendLine("## Recent events (latest first)");
        if (snapshot.RecentEvents.Count == 0)
        {
            sb.AppendLine("(none)");
        }
        else
        {
            foreach (var ev in snapshot.RecentEvents)
            {
                sb.AppendLine($"- [{ev.At:O}] {ev.EventType} by {ev.Actor}");
            }
        }
        sb.AppendLine();

        sb.AppendLine("## Valid actions from the current state");
        foreach (var tool in validTools)
        {
            sb.AppendLine($"- `{tool.Name}` — {tool.Description}");
        }
        sb.AppendLine("- `Done` — choose this only if no productive action is available");
        sb.AppendLine();

        sb.AppendLine("Pick the single best next action. Return JSON conforming to the schema.");

        return sb.ToString();
    }
}
