namespace Caseflow.Compute;

public static class FederalHolidayCalendar
{
    private static readonly HashSet<DateOnly> Holidays2026 = new()
    {
        new DateOnly(2026, 1, 1),
        new DateOnly(2026, 1, 19),
        new DateOnly(2026, 2, 16),
        new DateOnly(2026, 5, 25),
        new DateOnly(2026, 6, 19),
        new DateOnly(2026, 7, 3),
        new DateOnly(2026, 9, 7),
        new DateOnly(2026, 10, 12),
        new DateOnly(2026, 11, 11),
        new DateOnly(2026, 11, 26),
        new DateOnly(2026, 12, 25),
    };

    public static bool IsFederalHoliday(DateOnly date) =>
        Holidays2026.Contains(date);

    public static bool IsBusinessDay(DateOnly date) =>
        date.DayOfWeek is not (DayOfWeek.Saturday or DayOfWeek.Sunday)
        && !IsFederalHoliday(date);

    public static DateOnly NextBusinessDay(DateOnly date)
    {
        var next = date.AddDays(1);
        while (!IsBusinessDay(next))
        {
            next = next.AddDays(1);
        }
        return next;
    }

    public static DateOnly AdjustToBusinessDay(DateOnly date) =>
        IsBusinessDay(date) ? date : NextBusinessDay(date);
}
