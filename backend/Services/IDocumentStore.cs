namespace Caseflow.Services;

public interface IDocumentStore
{
    Task<StoredDocument> StoreAsync(string fileName, Stream content, CancellationToken ct = default);
    Task<Stream> OpenReadAsync(string storedPath, CancellationToken ct = default);
}

public sealed record StoredDocument(string Id, string StoredPath, long ByteLength);
