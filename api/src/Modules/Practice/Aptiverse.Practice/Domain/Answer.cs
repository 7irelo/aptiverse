using Aptiverse.SharedKernel.Domain;

namespace Aptiverse.Practice.Domain;

/// <summary>
/// The student's saved answer to one question. Each save bumps the revision, so a stale autosave from another tab
/// is refused instead of silently overwriting newer work. UserId is denormalised for erasure.
/// </summary>
internal sealed class Answer : Entity
{
    public const int TextMaxLength = 5000;
    public const int FeedbackMaxLength = 2000;
    public const int GradedByMaxLength = 8;
    public const int SelfRatingMaxLength = 12;

    private Answer()
    {
    }

    public Guid AttemptId { get; private set; }

    public Guid QuestionId { get; private set; }

    public Guid UserId { get; private set; }

    public int? SelectedIndex { get; private set; }

    public string? TextAnswer { get; private set; }

    public string? SelfRating { get; private set; }

    public int Revision { get; private set; }

    public DateTimeOffset SavedAt { get; private set; }

    public bool? IsCorrect { get; private set; }

    public int? AwardedMarks { get; private set; }

    public string? Feedback { get; private set; }

    public string? GradedBy { get; private set; }

    public bool NeedsReview { get; private set; }

    public static Answer Create(Attempt attempt, Guid questionId)
    {
        ArgumentNullException.ThrowIfNull(attempt);
        return new()
        {
            AttemptId = attempt.Id,
            QuestionId = questionId,
            UserId = attempt.UserId,
        };
    }

    /// <summary>True when the stored value already equals this one (a replayed save).</summary>
    public bool Holds(int? selectedIndex, string? textAnswer, string? selfRating) =>
        SelectedIndex == selectedIndex && TextAnswer == textAnswer && SelfRating == selfRating;

    public void Save(int? selectedIndex, string? textAnswer, string? selfRating, DateTimeOffset now)
    {
        SelectedIndex = selectedIndex;
        TextAnswer = textAnswer;
        SelfRating = selfRating;
        Revision++;
        SavedAt = now;
    }

    public void MarkAuto(bool correct, int awarded, string feedback)
    {
        IsCorrect = correct;
        AwardedMarks = awarded;
        Feedback = feedback;
        GradedBy = Domain.GradedBy.Auto;
        NeedsReview = false;
    }

    public void MarkPending() => GradedBy = Domain.GradedBy.Pending;

    public void MarkByAi(int awarded, int marks, string feedback, bool needsReview)
    {
        ArgumentNullException.ThrowIfNull(feedback);
        AwardedMarks = Math.Clamp(awarded, 0, marks);
        IsCorrect = AwardedMarks == marks;
        var trimmed = feedback.Trim();
        Feedback = trimmed.Length == 0 ? null : trimmed.Length <= FeedbackMaxLength ? trimmed : trimmed[..FeedbackMaxLength];
        GradedBy = Domain.GradedBy.Ai;
        NeedsReview = needsReview;
    }
}
