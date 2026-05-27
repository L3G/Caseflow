using Caseflow.Models;

namespace Caseflow.Compute;

public static class DeadlineEngine
{
    private static readonly DeadlineDefinition[] ChapterSevenDeadlines =
    [
        new DeadlineDefinition(
            "Schedules of Assets and Liabilities",
            "Fed. R. Bankr. P. 1007(c)",
            14),
        new DeadlineDefinition(
            "Statement of Financial Affairs",
            "Fed. R. Bankr. P. 1007(c)",
            14),
        new DeadlineDefinition(
            "Means Test Calculation (Form 122A)",
            "11 U.S.C. § 707(b)(2); Fed. R. Bankr. P. 1007(b)(4)",
            14),
        new DeadlineDefinition(
            "Section 341 Meeting of Creditors",
            "11 U.S.C. § 341; Fed. R. Bankr. P. 2003(a)",
            21),
        new DeadlineDefinition(
            "Objections to Discharge",
            "Fed. R. Bankr. P. 4004(a) — 60 days after § 341 meeting",
            81),
    ];

    public static DeadlineSchedule ComputeSchedule(DateOnly petitionDate)
    {
        var deadlines = ChapterSevenDeadlines
            .Select(def =>
            {
                var rawDate = petitionDate.AddDays(def.DaysFromPetition);
                var adjusted = FederalHolidayCalendar.AdjustToBusinessDay(rawDate);
                return new Deadline(
                    Name: def.Name,
                    LegalCitation: def.LegalCitation,
                    DaysFromPetition: def.DaysFromPetition,
                    DueDate: adjusted,
                    AdjustedForBusinessDay: adjusted != rawDate);
            })
            .ToList();

        return new DeadlineSchedule(petitionDate, deadlines);
    }

    private sealed record DeadlineDefinition(string Name, string LegalCitation, int DaysFromPetition);
}
