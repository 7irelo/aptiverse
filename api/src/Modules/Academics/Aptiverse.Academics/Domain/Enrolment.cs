using Aptiverse.SharedKernel.Domain;

namespace Aptiverse.Academics.Domain;

/// <summary>A student's membership of a study unit. Everything personal about a unit hangs off the enrolment.</summary>
internal sealed class Enrolment : Entity
{
    public const int StatusMaxLength = 16;
    public const int TeacherNameMaxLength = 120;
    public const int DurationMaxLength = 16;
    public const int ColourTokenMaxLength = 24;
    public const short MaxDisplayOrder = 99;

    private Enrolment()
    {
    }

    public Guid UserId { get; private set; }

    public Guid StudyUnitId { get; private set; }

    public string Status { get; private set; } = EnrolmentStatuses.Active;

    /// <summary>Teacher (high school) or lecturer (tertiary).</summary>
    public string? TeacherName { get; private set; }

    public DateOnly StartedOn { get; private set; }

    /// <summary>Tertiary only: "semester" or "full_year".</summary>
    public string? Duration { get; private set; }

    /// <summary>Started on plus 6 months (semester) or 12 months (full year). An explicit completion always wins.</summary>
    public DateOnly? ExpectedEndOn { get; private set; }

    public DateTimeOffset? CompletedAt { get; private set; }

    public short DisplayOrder { get; private set; }

    public string? ColourToken { get; private set; }

    public static Enrolment Create(Guid userId, StudyUnit unit, string? teacherName, DateOnly startedOn, string? duration, short displayOrder)
    {
        ArgumentNullException.ThrowIfNull(unit);
        var enrolment = new Enrolment
        {
            UserId = userId,
            StudyUnitId = unit.Id,
            Status = EnrolmentStatuses.Active,
            TeacherName = Clean(teacherName),
            StartedOn = startedOn,
            DisplayOrder = Math.Clamp(displayOrder, (short)0, MaxDisplayOrder),
        };
        enrolment.SetSchedule(startedOn, unit.Kind == StudyUnitKinds.TertiaryCourse ? duration : null);
        return enrolment;
    }

    public bool IsFinished(DateOnly today) => CompletedAt is not null || (ExpectedEndOn is { } end && end < today);

    public void SetTeacherName(string? teacherName) => TeacherName = Clean(teacherName);

    public void SetSchedule(DateOnly startedOn, string? duration)
    {
        StartedOn = startedOn;
        Duration = duration;
        ExpectedEndOn = duration switch
        {
            Durations.Semester => startedOn.AddMonths(6),
            Durations.FullYear => startedOn.AddMonths(12),
            _ => null,
        };
    }

    public void SetColourToken(string colourToken) => ColourToken = colourToken;

    public void SetDisplayOrder(short displayOrder) => DisplayOrder = Math.Clamp(displayOrder, (short)0, MaxDisplayOrder);

    public void Complete(DateTimeOffset now)
    {
        CompletedAt ??= now;
        Status = EnrolmentStatuses.Completed;
    }

    public void Reopen()
    {
        CompletedAt = null;
        Status = EnrolmentStatuses.Active;
    }

    private static string? Clean(string? text) => string.IsNullOrWhiteSpace(text) ? null : Slugs.CleanText(text);
}
