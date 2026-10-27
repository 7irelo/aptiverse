using Aptiverse.SharedKernel.Domain;
using Aptiverse.SharedKernel.Results;

namespace Aptiverse.Practice.Domain;

/// <summary>
/// The one attempt a student gets at a test. Every time on it comes from the server clock: the deadline of a timed
/// attempt is fixed at start (timed attempts never pause, decision 17), and untimed attempts track paused time so it
/// is excluded from time on task.
/// </summary>
internal sealed class Attempt : Entity
{
    public const int StatusMaxLength = 20;
    public const int CodeMaxLength = 16;

    private Attempt()
    {
    }

    public Guid TestId { get; private set; }

    public Guid UserId { get; private set; }

    /// <summary>Denormalised from the test for the graded event and the weakest topic query.</summary>
    public Guid StudyUnitId { get; private set; }

    public string Mode { get; private set; } = PracticeModes.Untimed;

    public string Status { get; private set; } = AttemptStatuses.InProgress;

    public DateTimeOffset StartedAt { get; private set; }

    public DateTimeOffset? DeadlineAt { get; private set; }

    public DateTimeOffset? PausedAt { get; private set; }

    public int PauseCount { get; private set; }

    public int PausedSecondsTotal { get; private set; }

    public DateTimeOffset? SubmittedAt { get; private set; }

    public string? SubmitSource { get; private set; }

    public int FocusLossCount { get; private set; }

    public DateTimeOffset? LastFocusLossAt { get; private set; }

    /// <summary>Start, saves and resumes; an untimed attempt idle for long enough stops blocking the tutor.</summary>
    public DateTimeOffset LastActivityAt { get; private set; }

    /// <summary>Marks awarded on the marked part; null until graded.</summary>
    public int? ScoreMarks { get; private set; }

    public int MaxMarks { get; private set; }

    /// <summary>Marks available on the marked part (excludes answers not marked yet); null until graded.</summary>
    public int? MarkedMarks { get; private set; }

    /// <summary>Percent of the marked part; null until graded.</summary>
    public decimal? ScorePercent { get; private set; }

    public bool PartiallyGraded { get; private set; }

    /// <summary>Calls made to the written grader for this attempt.</summary>
    public int GradingAttempts { get; private set; }

    public DateTimeOffset? GradedAt { get; private set; }

    public bool IsTimed => Mode == PracticeModes.Timed;

    public bool IsActive => AttemptStatuses.IsActive(Status);

    public static Attempt Start(PracticeTest test, DateTimeOffset now)
    {
        ArgumentNullException.ThrowIfNull(test);

        // Postgres keeps microseconds; truncating here means the deadline in a scheduled message equals the stored one.
        now = new DateTimeOffset(now.UtcTicks - (now.UtcTicks % 10), TimeSpan.Zero);
        return new()
        {
            TestId = test.Id,
            UserId = test.UserId,
            StudyUnitId = test.StudyUnitId,
            Mode = test.Mode,
            Status = AttemptStatuses.InProgress,
            StartedAt = now,
            DeadlineAt = test.IsTimed && test.DurationMinutes is { } minutes ? now.AddMinutes(minutes) : null,
            LastActivityAt = now,
            MaxMarks = test.IsScored ? test.TotalMarks : 0,
        };
    }

    /// <summary>Whole seconds left on a timed attempt, never negative; null for untimed attempts.</summary>
    public int? RemainingSeconds(DateTimeOffset now) => DeadlineAt is { } deadline
        ? (int)Math.Max(0, Math.Ceiling((deadline - now).TotalSeconds))
        : null;

    /// <summary>True once a timed attempt is past its deadline plus the network grace; saves and submits stop then.</summary>
    public bool IsPastGrace(DateTimeOffset now, TimeSpan grace) => DeadlineAt is { } deadline && now > deadline + grace;

    public void Touch(DateTimeOffset now) => LastActivityAt = now;

    /// <summary>True when <paramref name="deadline"/> is this attempt's deadline, to within a millisecond of storage rounding.</summary>
    public bool HasDeadline(DateTimeOffset? deadline) =>
        DeadlineAt is { } own && deadline is { } other && Math.Abs((own - other).Ticks) < TimeSpan.TicksPerMillisecond;

    public Result Pause(DateTimeOffset now)
    {
        if (!IsActive)
        {
            return PracticeErrors.AttemptNotActive;
        }

        if (IsTimed)
        {
            return PracticeErrors.PauseNotAllowed;
        }

        if (Status == AttemptStatuses.InProgress)
        {
            Status = AttemptStatuses.Paused;
            PausedAt = now;
            PauseCount++;
        }

        return Result.Success();
    }

    public Result Resume(DateTimeOffset now)
    {
        if (!IsActive)
        {
            return PracticeErrors.AttemptNotActive;
        }

        if (Status == AttemptStatuses.Paused)
        {
            ClosePause(now);
            Status = AttemptStatuses.InProgress;
            LastActivityAt = now;
        }

        return Result.Success();
    }

    /// <summary>Moves an active attempt to submitted. A paused attempt's open pause is closed first.</summary>
    public void Submit(DateTimeOffset now, string source)
    {
        if (!IsActive)
        {
            throw new InvalidOperationException("Only an active attempt can be submitted.");
        }

        ClosePause(now);
        Status = AttemptStatuses.Submitted;
        SubmittedAt = now;
        SubmitSource = source;
    }

    public void StartGrading() => Status = AttemptStatuses.Grading;

    public int RecordGradingAttempt() => ++GradingAttempts;

    /// <summary>Final grade of a scored attempt over its marked part.</summary>
    public void Grade(int awarded, int markedAvailable, bool partial, DateTimeOffset now)
    {
        ScoreMarks = awarded;
        MarkedMarks = markedAvailable;
        ScorePercent = Marking.Percent(awarded, markedAvailable);
        PartiallyGraded = partial;
        Status = AttemptStatuses.Graded;
        GradedAt = now;
    }

    /// <summary>Flashcards are self-rated: the attempt completes with no score.</summary>
    public void CompleteUnscored(DateTimeOffset now)
    {
        Status = AttemptStatuses.Graded;
        GradedAt = now;
    }

    private void ClosePause(DateTimeOffset now)
    {
        if (PausedAt is { } pausedAt)
        {
            var seconds = (long)Math.Max(0, Math.Floor((now - pausedAt).TotalSeconds));
            PausedSecondsTotal = (int)Math.Min(int.MaxValue, PausedSecondsTotal + seconds);
            PausedAt = null;
        }
    }
}
