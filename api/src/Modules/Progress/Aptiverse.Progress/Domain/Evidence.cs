using Aptiverse.SharedKernel.Domain;

namespace Aptiverse.Progress.Domain;

/// <summary>
/// A graded practice attempt as Progress saw it in PracticeAttemptGraded. Goals and time on task are measured from
/// these rows, so Progress never reads Practice's tables.
/// </summary>
internal sealed class PracticeResult : Entity
{
    private PracticeResult()
    {
    }

    public Guid UserId { get; private set; }

    public Guid StudyUnitId { get; private set; }

    public Guid AttemptId { get; private set; }

    public Guid TestId { get; private set; }

    /// <summary>Percent of the marked part. Used for score goals only when the attempt is fully graded.</summary>
    public decimal ScorePercent { get; private set; }

    public bool PartiallyGraded { get; private set; }

    public int SecondsOnTask { get; private set; }

    public DateTimeOffset SubmittedAt { get; private set; }

    public DateTimeOffset GradedAt { get; private set; }

    public static PracticeResult Create(
        Guid userId,
        Guid studyUnitId,
        Guid attemptId,
        Guid testId,
        decimal scorePercent,
        bool partiallyGraded,
        int secondsOnTask,
        DateTimeOffset submittedAt,
        DateTimeOffset gradedAt) => new()
        {
            UserId = userId,
            StudyUnitId = studyUnitId,
            AttemptId = attemptId,
            TestId = testId,
            ScorePercent = Math.Round(Math.Clamp(scorePercent, 0m, 100m), 2, MidpointRounding.AwayFromZero),
            PartiallyGraded = partiallyGraded,
            SecondsOnTask = Math.Max(0, secondsOnTask),
            SubmittedAt = StoredTime.Of(submittedAt),
            GradedAt = StoredTime.Of(gradedAt),
        };
}

/// <summary>
/// One assessment's submission and latest mark, folded from the Academics events. Mark events are applied only
/// when newer than the last one applied, so a redelivered or late event never overwrites a newer mark.
/// </summary>
internal sealed class AssessmentRecord : Entity
{
    private AssessmentRecord()
    {
    }

    public Guid UserId { get; private set; }

    public Guid StudyUnitId { get; private set; }

    public Guid AssessmentId { get; private set; }

    public DateTimeOffset? SubmittedAt { get; private set; }

    public decimal? MarkPercent { get; private set; }

    public DateTimeOffset? MarkRecordedAt { get; private set; }

    public DateTimeOffset? LastMarkEventAt { get; private set; }

    /// <summary>The assessment was deleted in Academics; it no longer counts anywhere.</summary>
    public DateTimeOffset? WithdrawnAt { get; private set; }

    public bool HasMark => MarkPercent is not null && WithdrawnAt is null;

    public static AssessmentRecord Create(Guid userId, Guid studyUnitId, Guid assessmentId) => new()
    {
        UserId = userId,
        StudyUnitId = studyUnitId,
        AssessmentId = assessmentId,
    };

    public bool ApplySubmitted(DateTimeOffset occurredAt)
    {
        occurredAt = StoredTime.Of(occurredAt);
        if (WithdrawnAt is not null || (SubmittedAt is { } at && at <= occurredAt))
        {
            return false;
        }

        SubmittedAt = occurredAt;
        return true;
    }

    /// <summary>A mark counts as done work even when the student never pressed submit.</summary>
    public bool ApplyGraded(decimal percent, DateTimeOffset occurredAt)
    {
        occurredAt = StoredTime.Of(occurredAt);
        if (WithdrawnAt is not null || (LastMarkEventAt is { } last && last >= occurredAt))
        {
            return false;
        }

        MarkPercent = Math.Round(Math.Clamp(percent, 0m, 100m), 2, MidpointRounding.AwayFromZero);
        MarkRecordedAt = occurredAt;
        LastMarkEventAt = occurredAt;
        ApplySubmitted(occurredAt);
        return true;
    }

    public bool ApplyMarkRemoved(DateTimeOffset occurredAt)
    {
        occurredAt = StoredTime.Of(occurredAt);
        if (WithdrawnAt is not null || (LastMarkEventAt is { } last && last >= occurredAt))
        {
            return false;
        }

        MarkPercent = null;
        MarkRecordedAt = null;
        LastMarkEventAt = occurredAt;
        return true;
    }

    public bool ApplyDeleted(DateTimeOffset occurredAt)
    {
        if (WithdrawnAt is not null)
        {
            return false;
        }

        WithdrawnAt = StoredTime.Of(occurredAt);
        MarkPercent = null;
        MarkRecordedAt = null;
        return true;
    }
}

/// <summary>A dated line in the student's journey. Append-only; the source key makes replays harmless.</summary>
internal sealed class JourneyEvent : Entity
{
    public const int KindMaxLength = 32;
    public const int TitleMaxLength = 160;
    public const int LinkMaxLength = 200;
    public const int SourceMaxLength = 24;

    private JourneyEvent()
    {
    }

    public Guid UserId { get; private set; }

    public string Kind { get; private set; } = string.Empty;

    public string Title { get; private set; } = string.Empty;

    public string? Link { get; private set; }

    public string SourceType { get; private set; } = string.Empty;

    public Guid SourceId { get; private set; }

    public DateTimeOffset OccurredAt { get; private set; }

    public static JourneyEvent Create(Guid userId, string kind, string title, string? link, string sourceType, Guid sourceId, DateTimeOffset occurredAt)
    {
        ArgumentNullException.ThrowIfNull(title);
        return new()
        {
            UserId = userId,
            Kind = kind,
            Title = title.Length <= TitleMaxLength ? title : title[..TitleMaxLength],
            Link = link,
            SourceType = sourceType,
            SourceId = sourceId,
            OccurredAt = occurredAt,
        };
    }
}
