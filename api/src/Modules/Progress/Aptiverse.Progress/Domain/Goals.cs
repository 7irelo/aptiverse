using Aptiverse.SharedKernel.Domain;

namespace Aptiverse.Progress.Domain;

/// <summary>
/// A goal verifiable from real work only (decision 20). No endpoint accepts a progress value: <see cref="CurrentValue"/>
/// changes only through <see cref="Recalculate"/>, fed by measurements over evidence produced after creation.
/// </summary>
internal sealed class Goal : Entity
{
    public const int TitleMinLength = 3;
    public const int TitleMaxLength = 120;
    public const int DescriptionMaxLength = 500;
    public const int CodeMaxLength = 32;
    public const int StatusMaxLength = 16;
    public const int IdempotencyKeyMaxLength = 64;
    public const decimal MinTarget = 1m;
    public const decimal MaxTarget = 100m;
    public const int MaxMilestones = 5;

    private Goal()
    {
    }

    public Guid UserId { get; private set; }

    public Guid StudyUnitId { get; private set; }

    public string Title { get; private set; } = string.Empty;

    public string? Description { get; private set; }

    public string CriteriaType { get; private set; } = string.Empty;

    /// <summary>Display form; only mastery goals have one, and null there means the whole unit.</summary>
    public string? Topic { get; private set; }

    /// <summary>Normalised topic, empty for the whole unit and for other types. Part of the duplicate key.</summary>
    public string TopicKey { get; private set; } = string.Empty;

    public Guid? AssessmentId { get; private set; }

    public decimal TargetValue { get; private set; }

    public decimal? BaselineValue { get; private set; }

    public DateTimeOffset BaselineCapturedAt { get; private set; }

    public decimal? CurrentValue { get; private set; }

    public string Status { get; private set; } = GoalStatuses.Active;

    public DateTimeOffset DueAt { get; private set; }

    public DateTimeOffset? AchievedAt { get; private set; }

    public DateTimeOffset? LockedAt { get; private set; }

    public int SortOrder { get; private set; }

    public string? IdempotencyKey { get; private set; }

    public bool IsOpen => Status is GoalStatuses.Active or GoalStatuses.AtRisk;

    public bool IsLocked => LockedAt is not null;

    public bool IsCount => CriteriaTypes.IsCount(CriteriaType);

    public static Goal Create(
        Guid userId,
        Guid studyUnitId,
        string title,
        string? description,
        string criteriaType,
        string? topic,
        Guid? assessmentId,
        decimal targetValue,
        decimal? baselineValue,
        DateTimeOffset dueAt,
        int sortOrder,
        string? idempotencyKey,
        DateTimeOffset now)
    {
        var cleanTopic = criteriaType == CriteriaTypes.MasteryThreshold && !string.IsNullOrWhiteSpace(topic) ? TopicKeys.Display(topic) : null;
        return new()
        {
            UserId = userId,
            StudyUnitId = studyUnitId,
            Title = Clean(title),
            Description = CleanOptional(description),
            CriteriaType = criteriaType,
            Topic = cleanTopic,
            TopicKey = cleanTopic is null ? TopicKeys.WholeUnit : TopicKeys.Key(cleanTopic),
            AssessmentId = assessmentId,
            TargetValue = targetValue,
            BaselineValue = baselineValue,
            BaselineCapturedAt = now,
            // Count goals start at 0; a mastery goal starts where the student is now; other thresholds have no
            // evidence since creation yet.
            CurrentValue = CriteriaTypes.IsCount(criteriaType) ? 0m : criteriaType == CriteriaTypes.MasteryThreshold ? baselineValue : null,
            Status = GoalStatuses.Active,
            DueAt = ToStoredPrecision(dueAt),
            SortOrder = sortOrder,
            IdempotencyKey = idempotencyKey,
        };
    }

    public void Rename(string title) => Title = Clean(title);

    public void Describe(string? description) => Description = CleanOptional(description);

    public void SetSortOrder(int sortOrder) => SortOrder = sortOrder;

    /// <summary>A new target is checked against a freshly measured baseline by the caller.</summary>
    public void Retarget(decimal targetValue, decimal? baselineValue, DateTimeOffset now)
    {
        TargetValue = targetValue;
        BaselineValue = baselineValue;
        BaselineCapturedAt = now;
    }

    public void Reschedule(DateTimeOffset dueAt) => DueAt = ToStoredPrecision(dueAt);

    /// <summary>Postgres keeps microseconds; trimming here keeps the scheduled expiry equal to the stored due date.</summary>
    public static DateTimeOffset ToStoredPrecision(DateTimeOffset value) => StoredTime.Of(value);

    public void Abandon() => Status = GoalStatuses.Abandoned;

    public bool Expire(DateTimeOffset now)
    {
        if (!IsOpen || now < DueAt)
        {
            return false;
        }

        Status = GoalStatuses.Expired;
        return true;
    }

    /// <summary>
    /// Applies a measurement. Achieved goals lock and never move back, even if a mark is later removed (the
    /// evidence list still shows the change). Returns what changed so the caller writes evidence and events.
    /// </summary>
    public GoalChange Recalculate(GoalMeasurement measurement, IReadOnlyList<Milestone> milestones, DateTimeOffset evidenceAt, DateTimeOffset now)
    {
        ArgumentNullException.ThrowIfNull(measurement);
        ArgumentNullException.ThrowIfNull(milestones);
        if (!IsOpen)
        {
            return GoalChange.None;
        }

        var valueChanged = CurrentValue != measurement.Value;
        CurrentValue = measurement.Value;

        var reached = new List<Milestone>();
        foreach (var milestone in milestones.Where(m => m.ReachedAt is null).OrderBy(m => m.Position))
        {
            if (CurrentValue is { } value && value >= milestone.ThresholdValue)
            {
                milestone.MarkReached(evidenceAt);
                reached.Add(milestone);
            }
        }

        var achieved = GoalEvaluator.IsAchieved(CriteriaType, CurrentValue, TargetValue, measurement.EvidenceQuestions);
        if (achieved)
        {
            Status = GoalStatuses.Achieved;
            AchievedAt = evidenceAt;
            LockedAt = now;
        }
        else
        {
            Status = GoalEvaluator.IsAtRisk(GoalEvaluator.ProgressPercent(CurrentValue, TargetValue), DueAt, now)
                ? GoalStatuses.AtRisk
                : GoalStatuses.Active;
        }

        return new GoalChange(valueChanged, achieved, reached);
    }

    private static string Clean(string text) => string.Join(' ', text.Split((char[]?)null, StringSplitOptions.RemoveEmptyEntries));

    private static string? CleanOptional(string? text) =>
        string.IsNullOrWhiteSpace(text) ? null : text.Trim();
}

internal sealed record GoalMeasurement(decimal? Value, int? EvidenceQuestions);

internal sealed record GoalChange(bool ValueChanged, bool Achieved, IReadOnlyList<Milestone> Reached)
{
    public static readonly GoalChange None = new(false, false, []);
}

/// <summary>A step toward a goal, reached from the same evidence as the goal itself.</summary>
internal sealed class Milestone : Entity
{
    public const int MaxPosition = Goal.MaxMilestones;

    private Milestone()
    {
    }

    public Guid GoalId { get; private set; }

    public int Position { get; private set; }

    public string Title { get; private set; } = string.Empty;

    public decimal ThresholdValue { get; private set; }

    public DateTimeOffset? ReachedAt { get; private set; }

    public static Milestone Create(Guid goalId, int position, string title, decimal thresholdValue) => new()
    {
        GoalId = goalId,
        Position = position,
        Title = string.Join(' ', title.Split((char[]?)null, StringSplitOptions.RemoveEmptyEntries)),
        ThresholdValue = thresholdValue,
    };

    public void Rename(string title) => Title = string.Join(' ', title.Split((char[]?)null, StringSplitOptions.RemoveEmptyEntries));

    public void SetThreshold(decimal thresholdValue) => ThresholdValue = thresholdValue;

    public void MoveTo(int position) => Position = position;

    public void MarkReached(DateTimeOffset at) => ReachedAt ??= at;
}

/// <summary>Why a goal's value changed, pointing at the event that caused it. Append-only and replay-safe.</summary>
internal sealed class GoalEvidence : Entity
{
    public const int SourceMaxLength = 24;
    public const int SummaryMaxLength = 200;
    public const int LinkMaxLength = 200;

    private GoalEvidence()
    {
    }

    public Guid GoalId { get; private set; }

    public string SourceType { get; private set; } = string.Empty;

    public Guid SourceId { get; private set; }

    public decimal? ValueAfter { get; private set; }

    public string Summary { get; private set; } = string.Empty;

    public string? Link { get; private set; }

    public DateTimeOffset OccurredAt { get; private set; }

    public static GoalEvidence Create(Guid goalId, string sourceType, Guid sourceId, decimal? valueAfter, string summary, string? link, DateTimeOffset occurredAt)
    {
        ArgumentNullException.ThrowIfNull(summary);
        return new()
        {
            GoalId = goalId,
            SourceType = sourceType,
            SourceId = sourceId,
            ValueAfter = valueAfter,
            Summary = summary.Length <= SummaryMaxLength ? summary : summary[..SummaryMaxLength],
            Link = link,
            OccurredAt = occurredAt,
        };
    }
}

/// <summary>Pure goal rules, ported from the old GoalEvaluator with the v1 changes.</summary>
internal static class GoalEvaluator
{
    /// <summary>A mastery goal is never achieved on an early read (BE-PRG-22).</summary>
    public const int MasteryMinimumQuestions = 5;

    public static decimal? ProgressPercent(decimal? current, decimal target) =>
        current is { } value && target > 0
            ? Math.Round(Math.Clamp(value / target * 100m, 0m, 100m), 2, MidpointRounding.AwayFromZero)
            : null;

    public static bool IsAchieved(string criteriaType, decimal? current, decimal target, int? evidenceQuestions) =>
        current is { } value && value >= target
        && (criteriaType != CriteriaTypes.MasteryThreshold || (evidenceQuestions ?? 0) >= MasteryMinimumQuestions);

    /// <summary>
    /// Old IsAtRisk: past due, or within 7 days of due with progress below 100 - (daysLeft / 7 * 40). No evidence
    /// counts as no progress here; the API still shows it as null.
    /// </summary>
    public static bool IsAtRisk(decimal? progressPercent, DateTimeOffset dueAt, DateTimeOffset now)
    {
        if (now >= dueAt)
        {
            return true;
        }

        var daysLeft = (decimal)(dueAt - now).TotalDays;
        if (daysLeft > 7m)
        {
            return false;
        }

        return (progressPercent ?? 0m) < 100m - (daysLeft / 7m * 40m);
    }

    /// <summary>The smallest target the baseline rule accepts (decision 21).</summary>
    public static decimal MinimumTarget(decimal? baseline) =>
        baseline is { } b ? Math.Min(Goal.MaxTarget, Math.Floor(b) + 1m) : Goal.MinTarget;

    /// <summary>A target at or below a measured baseline is refused.</summary>
    public static bool IsAboveBaseline(decimal target, decimal? baseline) => baseline is not { } b || target > b;
}
