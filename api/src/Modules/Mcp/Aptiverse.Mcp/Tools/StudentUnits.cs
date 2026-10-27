using Aptiverse.Academics.Contracts;

namespace Aptiverse.Mcp.Tools;

/// <summary>
/// Resolves a subject name from the model to the student's own study units. Only units the student is enrolled in can
/// match, so a name can never reach another student's data; an unknown name gets the student's own subject names back.
/// </summary>
internal static class StudentUnits
{
    public const int MaxListedSubjects = 20;

    /// <summary>The matching units, or an unknown_subject outcome. With no subject, every enrolled unit.</summary>
    public static async Task<(IReadOnlyList<StudyUnitContext> Units, ToolOutcome? Failure)> ResolveAsync(
        IStudyUnitLookup lookup,
        Guid userId,
        string? subject,
        CancellationToken cancellationToken)
    {
        var units = await lookup.GetForUserAsync(userId, cancellationToken);
        if (subject is null)
        {
            return (units, null);
        }

        var matched = units.Where(u => string.Equals(u.Name.Trim(), subject, StringComparison.OrdinalIgnoreCase)).ToList();
        if (matched.Count > 0)
        {
            return (matched, null);
        }

        var names = units.Select(u => u.Name).Distinct(StringComparer.OrdinalIgnoreCase).Take(MaxListedSubjects);
        var message = units.Count == 0
            ? "The student is not enrolled in any subject or course."
            : "No subject or course of the student has that name. Their subjects: " + string.Join("; ", names) + ".";
        return ([], ToolOutcome.Fail(ToolOutcomes.UnknownSubject, message));
    }
}
