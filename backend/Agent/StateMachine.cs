using System.Collections.Immutable;
using Caseflow.Models;

namespace Caseflow.Agent;

public static class StateMachine
{
    public const string FlagForAttorneyReviewTool = "FlagForAttorneyReview";

    private static readonly ImmutableDictionary<CaseState, ImmutableArray<string>> ValidTools =
        new Dictionary<CaseState, ImmutableArray<string>>
        {
            [CaseState.New] = ImmutableArray<string>.Empty,
            [CaseState.DocumentReceived] = ImmutableArray.Create("ClassifyDocument"),
            [CaseState.Classified] = ImmutableArray.Create("ExtractBankStatement", "ExtractPayStub"),
            [CaseState.Extracted] = ImmutableArray.Create(
                "ComputeMeansTest", "CalculateDeadlines", "CheckArithmeticIntegrity",
                "ExtractBankStatement", "ExtractPayStub"),
            [CaseState.AnalysesPending] = ImmutableArray.Create(
                "ComputeMeansTest", "CalculateDeadlines", "CheckArithmeticIntegrity"),
            [CaseState.Analyzed] = ImmutableArray.Create(
                "DraftClientEmail", "RequestAttorneyApproval"),
            [CaseState.AttorneyReviewPending] = ImmutableArray<string>.Empty,
            [CaseState.Approved] = ImmutableArray<string>.Empty,
            [CaseState.Flagged] = ImmutableArray<string>.Empty,
        }.ToImmutableDictionary();

    public static ImmutableArray<string> ValidToolsFor(CaseState state)
    {
        var stateTools = ValidTools.GetValueOrDefault(state, ImmutableArray<string>.Empty);
        return stateTools.IsEmpty
            ? ImmutableArray<string>.Empty
            : stateTools.Add(FlagForAttorneyReviewTool);
    }

    public static bool IsTerminal(CaseState state) => state == CaseState.Approved;

    public static bool IsBlocked(CaseState state) =>
        state is CaseState.AttorneyReviewPending or CaseState.Flagged;

    public static bool IsValidTransition(CaseState from, string toolName) =>
        ValidToolsFor(from).Contains(toolName);
}
