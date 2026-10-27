using Aptiverse.SharedKernel.Domain;
using Aptiverse.SharedKernel.Results;

namespace Aptiverse.Academics.Domain;

/// <summary>
/// A test, task or exam in one of the student's enrolments, with its lifecycle and mark. Marks are whole numbers
/// (obtained out of total); the percent is computed here and stored so lists and weighting never recompute it.
/// UserId is denormalised from the enrolment so every ownership check is a single indexed filter.
/// </summary>
internal sealed class Assessment : Entity
{
    public const int TitleMaxLength = 160;
    public const int TitleMinLength = 2;
    public const int TypeMaxLength = 24;
    public const int StateMaxLength = 16;
    public const int NotesMaxLength = 2000;
    public const int MaxMark = 10_000;

    private Assessment()
    {
    }

    public Guid UserId { get; private set; }

    public Guid EnrolmentId { get; private set; }

    public string Title { get; private set; } = string.Empty;

    public string AssessmentType { get; private set; } = string.Empty;

    public decimal? WeightPercent { get; private set; }

    /// <summary>School term 1 to 4; high school units only.</summary>
    public short? Term { get; private set; }

    public DateTimeOffset DueAt { get; private set; }

    public string State { get; private set; } = AssessmentStates.Scheduled;

    public decimal? PredictedPercent { get; private set; }

    public int? MarkObtained { get; private set; }

    public int? MarkTotal { get; private set; }

    public decimal? Percent { get; private set; }

    public string? Notes { get; private set; }

    public DateTimeOffset? StartedAt { get; private set; }

    public DateTimeOffset? SubmittedAt { get; private set; }

    public DateTimeOffset? GradedAt { get; private set; }

    public bool IsGraded => State == AssessmentStates.Graded;

    public static Assessment Create(
        Enrolment enrolment,
        string title,
        string type,
        decimal? weightPercent,
        short? term,
        DateTimeOffset dueAt,
        decimal? predictedPercent,
        string? notes)
    {
        ArgumentNullException.ThrowIfNull(enrolment);
        return new()
        {
            UserId = enrolment.UserId,
            EnrolmentId = enrolment.Id,
            Title = Slugs.CleanText(title),
            AssessmentType = type,
            WeightPercent = weightPercent,
            Term = term,
            DueAt = dueAt.ToUniversalTime(),
            State = AssessmentStates.Scheduled,
            PredictedPercent = predictedPercent,
            Notes = CleanNotes(notes),
        };
    }

    public static decimal ComputePercent(int obtained, int total) =>
        Math.Round(obtained * 100m / total, 2, MidpointRounding.AwayFromZero);

    public bool IsOverdue(DateTimeOffset now) => State is AssessmentStates.Scheduled or AssessmentStates.InProgress && DueAt < now;

    public void Rename(string title) => Title = Slugs.CleanText(title);

    public void SetType(string type) => AssessmentType = type;

    public void SetWeight(decimal? weightPercent) => WeightPercent = weightPercent;

    public void SetTerm(short? term) => Term = term;

    public void SetPredicted(decimal? predictedPercent) => PredictedPercent = predictedPercent;

    public void SetNotes(string? notes) => Notes = CleanNotes(notes);

    /// <summary>Returns true when the due date actually moved.</summary>
    public bool Reschedule(DateTimeOffset dueAt)
    {
        var utc = dueAt.ToUniversalTime();
        if (utc == DueAt)
        {
            return false;
        }

        DueAt = utc;
        return true;
    }

    /// <summary>The actions valid from the current state, so the UI offers only those.</summary>
    public IReadOnlyList<string> AllowedActions() => State switch
    {
        AssessmentStates.Scheduled => [TransitionActions.Start, TransitionActions.Submit, TransitionActions.Mark],
        AssessmentStates.InProgress => [TransitionActions.Submit, TransitionActions.Reopen, TransitionActions.Mark],
        AssessmentStates.Submitted => [TransitionActions.Reopen, TransitionActions.Mark],
        AssessmentStates.Graded => [TransitionActions.RemoveMark, TransitionActions.Mark],
        _ => [],
    };

    /// <summary>
    /// Applies a lifecycle action. Asking for the state the assessment is already in succeeds unchanged (false);
    /// every pair not listed in the state machine is a conflict. Graded is reachable only through a mark.
    /// </summary>
    public Result<bool> Transition(string action, DateTimeOffset now)
    {
        switch (action, State)
        {
            case (TransitionActions.Start, AssessmentStates.InProgress):
            case (TransitionActions.Submit, AssessmentStates.Submitted):
            case (TransitionActions.RemoveMark, AssessmentStates.Submitted):
                return false;

            case (TransitionActions.Start, AssessmentStates.Scheduled):
                State = AssessmentStates.InProgress;
                StartedAt = now;
                return true;

            case (TransitionActions.Submit, AssessmentStates.Scheduled):
            case (TransitionActions.Submit, AssessmentStates.InProgress):
                State = AssessmentStates.Submitted;
                SubmittedAt = now;
                return true;

            case (TransitionActions.Reopen, AssessmentStates.InProgress):
                State = AssessmentStates.Scheduled;
                StartedAt = null;
                return true;

            case (TransitionActions.Reopen, AssessmentStates.Submitted):
                State = AssessmentStates.InProgress;
                StartedAt ??= now;
                SubmittedAt = null;
                return true;

            case (TransitionActions.RemoveMark, AssessmentStates.Graded):
                State = AssessmentStates.Submitted;
                MarkObtained = null;
                MarkTotal = null;
                Percent = null;
                GradedAt = null;
                return true;

            default:
                return InvalidTransition(action);
        }
    }

    /// <summary>Records or changes the mark and moves to graded. Returns false when the same mark was already recorded.</summary>
    public bool RecordMark(int obtained, int total, DateTimeOffset now)
    {
        if (obtained < 0 || total <= 0 || obtained > total || total > MaxMark)
        {
            throw new ArgumentOutOfRangeException(nameof(obtained), "The mark must be validated before it reaches the entity.");
        }

        if (IsGraded && MarkObtained == obtained && MarkTotal == total)
        {
            return false;
        }

        MarkObtained = obtained;
        MarkTotal = total;
        Percent = ComputePercent(obtained, total);
        State = AssessmentStates.Graded;
        SubmittedAt ??= now;
        GradedAt = now;
        return true;
    }

    private Error InvalidTransition(string action) => Error.Conflict(
        "academics.invalid_transition",
        $"An assessment that is {State.Replace('_', ' ')} cannot take the action {action}. Allowed actions: {string.Join(", ", AllowedActions())}.");

    private static string? CleanNotes(string? notes) => string.IsNullOrWhiteSpace(notes) ? null : notes.Trim();
}
