using Aptiverse.Practice.Domain;
using Aptiverse.Practice.Features.Common;
using Aptiverse.Practice.Persistence;
using Aptiverse.SharedKernel.Results;
using Aptiverse.SharedKernel.Time;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Aptiverse.Practice.Features.SaveAnswer;

/// <summary>
/// Autosaves one answer. Only an in-progress attempt takes answers, and a timed one only until its deadline plus the
/// network grace. The attempt row is touched in the same save, so a save racing a submit loses cleanly (409) instead
/// of changing an answer after it was marked. Answer text is never logged.
/// </summary>
internal sealed partial class SaveAttemptAnswerHandler(
    PracticeDbContext db,
    IClock clock,
    IOptions<PracticeOptions> options,
    ILogger<SaveAttemptAnswerHandler> logger)
{
    public async Task<Result<SavedAnswer>> HandleAsync(
        Guid userId,
        Guid attemptId,
        Guid questionId,
        SaveAttemptAnswerRequest request,
        CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);
        var attempt = await db.AttemptAsync(userId, attemptId, cancellationToken);
        if (attempt is null)
        {
            return PracticeErrors.AttemptNotFound;
        }

        if (!attempt.IsActive)
        {
            return PracticeErrors.AttemptNotActive;
        }

        if (attempt.Status == AttemptStatuses.Paused)
        {
            return PracticeErrors.AttemptPaused;
        }

        var now = clock.UtcNow;
        if (attempt.IsPastGrace(now, options.Value.NetworkGrace))
        {
            PracticeMetrics.AnswerRejectedLate();
            LogOutcome(logger, userId, attempt.Id, questionId, request.BaseRevision, "late");
            return PracticeErrors.DeadlinePassed;
        }

        var question = await db.Questions.AsNoTracking()
            .SingleOrDefaultAsync(q => q.Id == questionId && q.TestId == attempt.TestId, cancellationToken);
        if (question is null)
        {
            return PracticeErrors.QuestionNotFound;
        }

        if (!Fits(question, request))
        {
            return PracticeErrors.AnswerKindMismatch;
        }

        var answer = await db.Answers.SingleOrDefaultAsync(
            a => a.AttemptId == attempt.Id && a.QuestionId == question.Id && a.UserId == userId,
            cancellationToken);
        var current = answer?.Revision ?? 0;

        // A replayed save of the value already stored at the next revision is a success with no change.
        if (answer is not null && request.BaseRevision == current - 1 && answer.Holds(request.SelectedIndex, request.TextAnswer, request.SelfRating))
        {
            return new SavedAnswer(question.Id, answer.Revision, answer.SavedAt);
        }

        if (request.BaseRevision != current)
        {
            LogOutcome(logger, userId, attempt.Id, question.Id, request.BaseRevision, "stale");
            return PracticeErrors.RevisionConflict.With("currentRevision", current);
        }

        if (answer is null)
        {
            answer = Answer.Create(attempt, question.Id);
            db.Answers.Add(answer);
        }

        answer.Save(request.SelectedIndex, request.TextAnswer, request.SelfRating, now);
        attempt.Touch(now);

        try
        {
            await db.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateConcurrencyException)
        {
            return await ConflictAsync(attempt.Id, question.Id, cancellationToken);
        }
        catch (DbUpdateException ex) when (DbErrors.IsUniqueViolation(ex))
        {
            return await ConflictAsync(attempt.Id, question.Id, cancellationToken);
        }

        PracticeMetrics.AnswerSaved(question.Kind);
        LogOutcome(logger, userId, attempt.Id, question.Id, request.BaseRevision, "saved");
        return new SavedAnswer(question.Id, answer.Revision, answer.SavedAt);
    }

    private static bool Fits(Question question, SaveAttemptAnswerRequest request) => question.Kind switch
    {
        QuestionKinds.Mcq => request.SelectedIndex is { } index && index < question.Options.Count,
        QuestionKinds.Flashcard => request.SelfRating is not null,
        _ => request.TextAnswer is not null,
    };

    /// <summary>The attempt was submitted or the answer saved elsewhere at the same moment.</summary>
    private async Task<Error> ConflictAsync(Guid attemptId, Guid questionId, CancellationToken cancellationToken)
    {
        db.ChangeTracker.Clear();
        var status = await db.Attempts.AsNoTracking().Where(a => a.Id == attemptId).Select(a => a.Status).SingleAsync(cancellationToken);
        if (!AttemptStatuses.IsActive(status))
        {
            return PracticeErrors.AttemptNotActive;
        }

        var revision = await db.Answers.AsNoTracking()
            .Where(a => a.AttemptId == attemptId && a.QuestionId == questionId)
            .Select(a => (int?)a.Revision)
            .SingleOrDefaultAsync(cancellationToken) ?? 0;
        return PracticeErrors.RevisionConflict.With("currentRevision", revision);
    }

    [LoggerMessage(Level = LogLevel.Debug, Message = "User {UserId} save on attempt {AttemptId} question {QuestionId} at revision {Revision}: {Outcome}")]
    private static partial void LogOutcome(ILogger logger, Guid userId, Guid attemptId, Guid questionId, int revision, string outcome);
}
