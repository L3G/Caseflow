namespace Caseflow.Agent;

public static class PlannerSchema
{
    public const string SchemaName = "planner_decision";

    public static string BuildJsonSchema(IReadOnlyList<string> validToolNames)
    {
        var allOptions = validToolNames.Append("Done").Select(n => $"\"{n}\"");
        var enumLiteral = string.Join(",", allOptions);

        return $$"""
        {
          "type": "object",
          "properties": {
            "nextAction": { "type": "string", "enum": [{{enumLiteral}}] },
            "reasoning": { "type": "string" },
            "expectedOutcome": { "type": "string" },
            "alternativesConsidered": {
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "action": { "type": "string" },
                  "reasonRejected": { "type": "string" }
                },
                "required": ["action", "reasonRejected"],
                "additionalProperties": false
              }
            },
            "estimatedConfidence": { "type": "string", "enum": ["high", "medium", "low"] }
          },
          "required": ["nextAction", "reasoning", "expectedOutcome", "alternativesConsidered", "estimatedConfidence"],
          "additionalProperties": false
        }
        """;
    }
}
