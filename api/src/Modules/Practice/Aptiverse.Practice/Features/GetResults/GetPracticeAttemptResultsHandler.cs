using Aptiverse.Practice.Domain;
using Aptiverse.Practice.Persistence;
using Aptiverse.SharedKernel.Results;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Practice.Features.GetResults;

/// <summary>
/// Builds the marked paper. Refused while the attempt is active, so answers never leak before submission. An
/// answer whose marking failed shows "not marked yet" and keeps the score null rather than counting it as zero.
/// </summary>
internal sealed class GetPracticeAttemptResultsHandler(PracticeDbContext db)
{
    public const string Marked = "marked";
    public const string NotMarkedYet = "not_marked_yet";
    public const string SelfRated = "self_rated";

    public async Task<Result<AttemptResults>> HandleAsync(Guid userId, Guid attemptId, CancellationToken cancellationToken)
    {
        var attempt = await db.Attempts.AsNoTracking().SingleOrDefaultAsync(a => a.Id == attemptId && a.UserId == userId, cancellationToken);
        if (attempt is null)
        {
            return PracticeErrors.AttemptNotFound;
        }

        if (attempt.IsActive)
        {
            return PracticeErrors.ResultsNotReady;
        }

        var test = await db.Tests.IgnoreQueryFilters().AsNoTracking().SingleAsync(t => t.Id == attempt.TestId && t.UserId == userId, cancellationToken);
        var questions = await db.Questions.AsNoTracking().Where(q => q.TestId == test.Id).OrderBy(q => q.Position).ToListAsync(cancellationToken);
        var answers = await db.Answers.AsNoTracking()
            .Where(a => a.AttemptId == attempt.Id && a.UserId == userId)
            .ToDictionaryAsync(a => a.QuestionId, cancellationToken);
        var topics = await db.AttemptTopicScores.AsNoTracking()
            .Where(s => s.AttemptId == attempt.Id && s.UserId == userId)
            .OrderBy(s => s.Topic)
            .Select(s => new TopicResult(s.Topic, s.QuestionsTotal, s.QuestionsCorrect, s.MarksAvailable, s.MarksAwarded))
            .ToListAsync(cancellationToken);

        var graded = attempt.Status == AttemptStatuses.Graded && test.IsScored;
        var complete = graded && !attempt.PartiallyGraded;
        return new AttemptResults(
            attempt.Id,
            test.Id,
            test.Title,
            test.Format,
            attempt.Status,
            complete ? attempt.ScoreMarks : null,
            attempt.MaxMarks,
            complete ? attempt.ScorePercent : null,
            graded ? attempt.MarkedMarks : null,
            graded ? attempt.ScoreMarks : null,
            attempt.PartiallyGraded,
            attempt.SubmittedAt,
            attempt.SubmitSource,
            Marking.SecondsOnTask(attempt, test.DurationMinutes),
            attempt.FocusLossCount,
            topics,
            questions.Select(q => ToResult(q, answers.GetValueOrDefault(q.Id), test.IsScored)).ToList());
    }

    private static ResultQuestion ToResult(Question question, Answer? answer, bool scored)
    {
        string status;
        bool? isCorrect;
        int? awarded;
        string? feedback;

        if (!scored)
        {
            (status, isCorrect, awarded, feedback) = (SelfRated, null, null, null);
        }
        else if (answer is null)
        {
            // Never answered: marked as nothing written, which is a real zero.
            (status, isCorrect, awarded, feedback) = (Marked, false, 0, Marking.NoAnswerFeedback);
        }
        else if (answer.GradedBy is null or GradedBy.Pending)
        {
            (status, isCorrect, awarded, feedback) = (NotMarkedYet, null, null, null);
        }
        else
        {
            (status, isCorrect, awarded, feedback) = (Marked, answer.IsCorrect, answer.AwardedMarks, answer.Feedback);
        }

        return new ResultQuestion(
            question.Id,
            question.Position,
            question.Kind,
            question.Section,
            question.Topic,
            question.Stem,
            question.Options,
            question.Marks,
            answer?.SelectedIndex,
            answer?.TextAnswer,
            answer?.SelfRating,
            question.AnswerIndex,
            question.ExpectedAnswer,
            question.Memo,
            question.Explanation,
            isCorrect,
            awarded,
            feedback,
            answer?.NeedsReview ?? false,
            status);
    }
}
