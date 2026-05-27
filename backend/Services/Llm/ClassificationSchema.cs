namespace Caseflow.Services.Llm;

public static class ClassificationSchema
{
    public const string SchemaName = "document_classification";

    public const string Json = """
        {
          "type": "object",
          "properties": {
            "documentType": {
              "type": "string",
              "enum": ["unknown", "bankStatement", "payStub", "taxReturn", "identification", "courtNotice"]
            },
            "confidence": { "type": "number", "minimum": 0, "maximum": 1 },
            "reasoning": { "type": "string" }
          },
          "required": ["documentType", "confidence", "reasoning"],
          "additionalProperties": false
        }
        """;
}
