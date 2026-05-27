using Caseflow.Models;
using Caseflow.Tools;

namespace Caseflow.Agent;

public interface IPlanner
{
    Task<PlannerDecision> PlanAsync(
        CaseSnapshot snapshot,
        IReadOnlyList<ITool> validTools,
        CancellationToken ct = default);
}
