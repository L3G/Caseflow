namespace Caseflow.Services.Llm;

public static class BankStatementSchema
{
    public const string SchemaName = "bank_statement_extraction";

    public const string Json = """
        {
          "type": "object",
          "properties": {
            "bankName":             { "$ref": "#/$defs/stringField" },
            "accountHolderName":    { "$ref": "#/$defs/stringField" },
            "accountNumberLast4":   { "$ref": "#/$defs/stringField" },
            "statementPeriodStart": { "$ref": "#/$defs/dateField" },
            "statementPeriodEnd":   { "$ref": "#/$defs/dateField" },
            "beginningBalance":     { "$ref": "#/$defs/decimalField" },
            "endingBalance":        { "$ref": "#/$defs/decimalField" },
            "totalDeposits":        { "$ref": "#/$defs/decimalField" },
            "totalWithdrawals":     { "$ref": "#/$defs/decimalField" },
            "transactions": {
              "type": "array",
              "items": { "$ref": "#/$defs/transaction" }
            },
            "reviewerNotes": { "type": ["string", "null"] }
          },
          "required": [
            "bankName", "accountHolderName", "accountNumberLast4",
            "statementPeriodStart", "statementPeriodEnd",
            "beginningBalance", "endingBalance", "totalDeposits", "totalWithdrawals",
            "transactions", "reviewerNotes"
          ],
          "additionalProperties": false,
          "$defs": {
            "stringField": {
              "type": "object",
              "properties": {
                "value": { "type": "string" },
                "confidence": { "type": "number", "minimum": 0, "maximum": 1 }
              },
              "required": ["value", "confidence"],
              "additionalProperties": false
            },
            "dateField": {
              "type": "object",
              "properties": {
                "value": { "type": "string", "format": "date" },
                "confidence": { "type": "number", "minimum": 0, "maximum": 1 }
              },
              "required": ["value", "confidence"],
              "additionalProperties": false
            },
            "decimalField": {
              "type": "object",
              "properties": {
                "value": { "type": "number" },
                "confidence": { "type": "number", "minimum": 0, "maximum": 1 }
              },
              "required": ["value", "confidence"],
              "additionalProperties": false
            },
            "transaction": {
              "type": "object",
              "properties": {
                "date":        { "type": "string", "format": "date" },
                "description": { "type": "string" },
                "amount":      { "type": "number" },
                "direction":   { "type": "string", "enum": ["deposit", "withdrawal"] }
              },
              "required": ["date", "description", "amount", "direction"],
              "additionalProperties": false
            }
          }
        }
        """;
}
