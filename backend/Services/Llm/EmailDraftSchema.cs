namespace Caseflow.Services.Llm;

public static class EmailDraftSchema
{
    public const string SchemaName = "client_email_draft";

    public const string Json = """
        {
          "type": "object",
          "properties": {
            "subject": { "type": "string" },
            "body": { "type": "string" }
          },
          "required": ["subject", "body"],
          "additionalProperties": false
        }
        """;
}
