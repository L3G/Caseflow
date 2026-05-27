namespace Caseflow.Models;

public sealed class CaseDocument
{
    public required string Id { get; init; }
    public required string CaseId { get; init; }
    public required string FileName { get; init; }
    public required string StoredPath { get; init; }
    public DocumentType? DocumentType { get; set; }
    public required DateTime UploadedAt { get; init; }
}
