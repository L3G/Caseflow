namespace Caseflow.Tools;

public sealed class ToolRegistry
{
    private readonly Dictionary<string, ITool> _byName;

    public ToolRegistry(IEnumerable<ITool> tools)
    {
        _byName = tools.ToDictionary(t => t.Name, StringComparer.Ordinal);
    }

    public ITool? GetByName(string name) =>
        _byName.GetValueOrDefault(name);

    public IReadOnlyList<ITool> All() => _byName.Values.ToList();
}
