using System.Security.Cryptography;

namespace Caseflow.Services;

public sealed class DocumentStore : IDocumentStore
{
    private readonly string _documentsPath;

    public DocumentStore(IConfiguration config)
    {
        _documentsPath = config["Storage:DocumentsPath"]
            ?? throw new InvalidOperationException("Storage:DocumentsPath is not configured.");
        Directory.CreateDirectory(_documentsPath);
    }

    public async Task<StoredDocument> StoreAsync(
        string fileName,
        Stream content,
        CancellationToken ct = default)
    {
        using var ms = new MemoryStream();
        await content.CopyToAsync(ms, ct);
        var bytes = ms.ToArray();

        var hash = Convert.ToHexString(SHA256.HashData(bytes)).ToLowerInvariant();

        var ext = Path.GetExtension(fileName);
        if (string.IsNullOrEmpty(ext)) ext = ".bin";

        var storedPath = Path.Combine(_documentsPath, $"{hash}{ext}");

        if (!File.Exists(storedPath))
        {
            await File.WriteAllBytesAsync(storedPath, bytes, ct);
        }

        return new StoredDocument(hash, storedPath, bytes.Length);
    }

    public Task<Stream> OpenReadAsync(string storedPath, CancellationToken ct = default)
    {
        if (!File.Exists(storedPath))
        {
            throw new FileNotFoundException($"Document not found at {storedPath}");
        }
        return Task.FromResult<Stream>(File.OpenRead(storedPath));
    }
}
