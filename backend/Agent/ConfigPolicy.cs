using Caseflow.Models;
using Caseflow.Tools;

namespace Caseflow.Agent;

public sealed class ConfigPolicy : IPolicy
{
    public ToolPolicyDecision Evaluate(ITool tool, CaseSnapshot snapshot, PlannerDecision plan) =>
        tool.Policy.DefaultDecision;
}
