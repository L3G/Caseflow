using Caseflow.Models;
using Caseflow.Tools;

namespace Caseflow.Agent;

public interface IPolicy
{
    ToolPolicyDecision Evaluate(ITool tool, CaseSnapshot snapshot, PlannerDecision plan);
}
