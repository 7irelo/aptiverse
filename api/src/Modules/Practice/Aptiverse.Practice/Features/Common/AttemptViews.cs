using Aptiverse.Practice.Domain;
using Aptiverse.Practice.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Practice.Features.Common;

/// <summary>
/// The runner's view of an attempt. While the attempt is active it carries the questions (never the answer index,
/// expected answer, memo or explanation) and the saved answers; once submitted it carries neither, and results come
/// from getPracticeAttemptResults. Every time is from the server clock, with serverNow so the client never trusts its own.
/// </summary>
/// <param name="AttemptId">The attempt.</param>
/// <param name="TestId">The test attempted.</param>
/// <param name="Status">"in_progress", "paused", "submitted", "grading" or "graded".</param>
/// <param name="Mode">"timed" or "untimed".</param>
/// <param name="StartedAt">Server start time.</param>
/// <param name="DeadlineAt">Server deadline of a timed attempt; it never moves.</param>
/// <param name="ServerNow">The server clock when this response was built.</param>
/// <param name="RemainingSeconds">Seconds left on a timed attempt, null for untimed.</param>
/// <param name="Paused">True while an untimed attempt is paused.</param>
/// <param name="PausedSecondsTotal">Paused time so far, excluded from time on task.</param>
/// <param name="FocusLossCount">Times the test lost focus.</param>
/// <param name="Questions">The questions, only while the attempt is active.</param>
/// <param name="Answers">The saved answers, only while the attempt is active.</param>
/// <param name="ResultsUrl">Where the results are, once submitted.</param>
internal sealed record AttemptState(
    Guid AttemptId,
    Guid TestId,
    string Status,
    string Mode,
    DateTimeOffset StartedAt,
    DateTimeOffset? DeadlineAt,
    DateTimeOffset ServerNow,
    int? RemainingSeconds,
    bool Paused,
    int PausedSecondsTotal,
    int FocusLossCount,
    IReadOnlyList<AttemptQuestion> Questions,
    IReadOnlyList<SavedAnswerView> Answers,
    string? ResultsUrl);

/// <param name="Id">The question.</param>
/// <param name="Position">1-based order, for announcing "question 3 of 10".</param>
/// <param name="Kind">"mcq", "short", "numeric", "long", "flashcard" or "essay".</param>
/// <param name="Stem">The question (LaTeX between dollar signs).</param>
/// <param name="Options">Multiple choice options in order (labelled A, B, C...); empty otherwise.</param>
/// <param name="Marks">Marks the question is worth.</param>
/// <param name="Topic">The topic it tests.</param>
/// <param name="Section">Paper section label, for example "Section A: short questions".</param>
/// <param name="FlashcardBack">The back of a flashcard (flashcards are self-rated and never scored); null otherwise.</param>
internal sealed record AttemptQuestion(
    Guid Id,
    int Position,
    string Kind,
    string Stem,
    IReadOnlyList<string> Options,
    int Marks,
    string Topic,
    string? Section,
    string? FlashcardBack);

internal sealed record SavedAnswerView(Guid QuestionId, int? SelectedIndex, string? TextAnswer, string? SelfRating, int Revision, DateTimeOffset SavedAt);

internal static class PracticeUrls
{
    public static string Results(Guid attemptId) => $"/practice/attempts/{attemptId}/results";

    public static string Attempt(Guid attemptId) => $"/practice/attempts/{attemptId}";

    public static string Status(Guid testId) => $"/practice/tests/{testId}/status";
}

internal sealed class AttemptViews(PracticeDbContext db)
{
    public async Task<AttemptState> BuildAsync(Attempt attempt, DateTimeOffset now, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(attempt);
        if (!attempt.IsActive)
        {
            return Build(attempt, now, [], []);
        }

        var questions = await db.Questions.AsNoTracking()
            .Where(q => q.TestId == attempt.TestId)
            .OrderBy(q => q.Position)
            .Select(q => new AttemptQuestion(
                q.Id,
                q.Position,
                q.Kind,
                q.Stem,
                q.Options,
                q.Marks,
                q.Topic,
                q.Section,
                q.Kind == QuestionKinds.Flashcard ? q.ExpectedAnswer : null))
            .ToListAsync(cancellationToken);

        var answers = await db.Answers.AsNoTracking()
            .Where(a => a.AttemptId == attempt.Id && a.UserId == attempt.UserId)
            .OrderBy(a => a.QuestionId)
            .Select(a => new SavedAnswerView(a.QuestionId, a.SelectedIndex, a.TextAnswer, a.SelfRating, a.Revision, a.SavedAt))
            .ToListAsync(cancellationToken);

        return Build(attempt, now, questions, answers);
    }

    private static AttemptState Build(
        Attempt attempt,
        DateTimeOffset now,
        IReadOnlyList<AttemptQuestion> questions,
        IReadOnlyList<SavedAnswerView> answers) => new(
            attempt.Id,
            attempt.TestId,
            attempt.Status,
            attempt.Mode,
            attempt.StartedAt,
            attempt.DeadlineAt,
            now,
            attempt.IsActive ? attempt.RemainingSeconds(now) : null,
            attempt.Status == AttemptStatuses.Paused,
            attempt.PausedSecondsTotal,
            attempt.FocusLossCount,
            questions,
            answers,
            attempt.IsActive ? null : PracticeUrls.Results(attempt.Id));
}
