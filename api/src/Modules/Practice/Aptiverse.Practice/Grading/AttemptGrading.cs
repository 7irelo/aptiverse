using Aptiverse.AiTutor.Contracts;
using Aptiverse.Practice.Contracts;
using Aptiverse.Practice.Domain;
using Aptiverse.Practice.Generation;
using Aptiverse.Practice.Persistence;
using Aptiverse.SharedKernel.Results;
using Aptiverse.SharedKernel.Time;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Wolverine;
using Wolverine.EntityFrameworkCore;

namespace Aptiverse.Practice.Grading;

/// <summary>The state an attempt is in after a submit, for the submit response.</summary>
internal sealed record SubmitOutcome(Guid AttemptId, string Status);

/// <summary>
/// Submits attempts, for the student and for the deadline. Objective questions are marked inline; written answers
/// are left pending for <see cref="WrittenGrader"/>, which runs from a message so the model is never called on the
/// request path. The status guard plus the xmin token make concurrent submits (student, deadline, double clicks)
/// produce exactly one transition: the loser retries in a fresh scope and finds the attempt already submitted.
/// </summary>
internal sealed partial class AttemptSubmitter(IServiceScopeFactory scopes, ILogger<AttemptSubmitter> logger)
{
    private const int MaxTries = 3;

    /// <param name="attemptId">The attempt.</param>
    /// <param name="userId">The owner for a student submit; null for the deadline, which is not a user request.</param>
    /// <param name="source">"student" or "deadline".</param>
    /// <param name="expectedDeadline">For the deadline: the deadline the scheduled message was created for.</param>
    /// <param name="cancellationToken">Cancels the submit.</param>
    public async Task<Result<SubmitOutcome>> SubmitAsync(
        Guid attemptId,
        Guid? userId,
        string source,
        DateTimeOffset? expectedDeadline,
        CancellationToken cancellationToken)
    {
        for (var attempt = 1; ; attempt++)
        {
            await using var scope = scopes.CreateAsyncScope();
            var once = scope.ServiceProvider.GetRequiredService<SubmitOnce>();
            try
            {
                return await once.RunAsync(attemptId, userId, source, expectedDeadline, cancellationToken);
            }
            catch (DbUpdateConcurrencyException) when (attempt < MaxTries)
            {
                LogRetry(logger, attemptId, attempt);
            }
            catch (DbUpdateConcurrencyException)
            {
                return PracticeErrors.ConcurrencyConflict;
            }
        }
    }

    [LoggerMessage(Level = LogLevel.Information, Message = "Attempt {AttemptId} changed during submit (try {Try}); retrying")]
    private static partial void LogRetry(ILogger logger, Guid attemptId, int @try);
}

/// <summary>One submit in one scope (one outbox). Throws DbUpdateConcurrencyException when the attempt moved underneath.</summary>
internal sealed partial class SubmitOnce(
    IDbContextOutbox<PracticeDbContext> outbox,
    GradeFinalizer finalizer,
    IClock clock,
    IOptions<PracticeOptions> options,
    ILogger<SubmitOnce> logger)
{
    private PracticeDbContext Db => outbox.DbContext;

    public async Task<Result<SubmitOutcome>> RunAsync(
        Guid attemptId,
        Guid? userId,
        string source,
        DateTimeOffset? expectedDeadline,
        CancellationToken cancellationToken)
    {
        var attempt = await Db.Attempts.SingleOrDefaultAsync(
            a => a.Id == attemptId && (userId == null || a.UserId == userId),
            cancellationToken);
        if (attempt is null)
        {
            return PracticeErrors.AttemptNotFound;
        }

        if (!attempt.IsActive)
        {
            return new SubmitOutcome(attempt.Id, attempt.Status);
        }

        var now = clock.UtcNow;
        if (source == SubmitSources.Student && attempt.IsPastGrace(now, options.Value.NetworkGrace))
        {
            // The deadline message owns a late attempt, so a late click cannot add time.
            return PracticeErrors.DeadlinePassed;
        }

        if (source == SubmitSources.Deadline && (!attempt.IsTimed || !attempt.HasDeadline(expectedDeadline)))
        {
            // A stale message for a deadline that no longer applies.
            return new SubmitOutcome(attempt.Id, attempt.Status);
        }

        var test = await Db.Tests.IgnoreQueryFilters().SingleAsync(t => t.Id == attempt.TestId, cancellationToken);
        var questions = await Db.Questions.Where(q => q.TestId == test.Id).OrderBy(q => q.Position).ToListAsync(cancellationToken);
        var answers = await Db.Answers.Where(a => a.AttemptId == attempt.Id && a.UserId == attempt.UserId).ToListAsync(cancellationToken);

        var from = attempt.Status;
        attempt.Submit(now, source);
        var pending = test.IsScored && MarkObjective(questions, answers);
        await outbox.PublishAsync(new PracticeAttemptSubmitted(attempt.Id, attempt.UserId, source, attempt.FocusLossCount, now));

        if (!test.IsScored)
        {
            attempt.CompleteUnscored(now);
        }
        else if (pending)
        {
            attempt.StartGrading();
            await outbox.PublishAsync(new GradePracticeAttempt(attempt.Id));
        }
        else
        {
            await finalizer.FinalizeAsync(attempt, test, questions, answers, now);
        }

        await outbox.SaveChangesAndFlushMessagesAsync(cancellationToken);

        PracticeMetrics.Submitted(source, Marking.SecondsOnTask(attempt, test.DurationMinutes));
        LogTransition(logger, attempt.Id, from, attempt.Status, source, answers.Count, attempt.FocusLossCount);
        return new SubmitOutcome(attempt.Id, attempt.Status);
    }

    /// <summary>Marks multiple choice and blank answers; returns true when written answers wait for the grader.</summary>
    private static bool MarkObjective(List<Question> questions, List<Answer> answers)
    {
        var byQuestion = answers.ToDictionary(a => a.QuestionId);
        var pending = false;
        foreach (var question in questions)
        {
            byQuestion.TryGetValue(question.Id, out var answer);
            if (answer is null)
            {
                continue;
            }

            if (question.Kind == QuestionKinds.Mcq)
            {
                var (correct, awarded, feedback) = Marking.MarkChoice(question, answer.SelectedIndex);
                answer.MarkAuto(correct, awarded, feedback);
            }
            else if (string.IsNullOrWhiteSpace(answer.TextAnswer))
            {
                answer.MarkAuto(false, 0, Marking.NoAnswerFeedback);
            }
            else
            {
                answer.MarkPending();
                pending = true;
            }
        }

        return pending;
    }

    [LoggerMessage(
        Level = LogLevel.Information,
        Message = "Attempt {AttemptId} moved from {From} to {To} by {Source} with {AnsweredCount} answers and {FocusLossCount} focus losses")]
    private static partial void LogTransition(ILogger logger, Guid attemptId, string from, string to, string source, int answeredCount, int focusLossCount);
}

/// <summary>
/// Writes the final grade of a scored attempt: topic scores, totals over the marked part, and PracticeAttemptGraded
/// in the same outbox transaction (so the event is published exactly when the grade commits). Pending answers stay
/// "not marked yet" and are never counted as zero.
/// </summary>
internal sealed class GradeFinalizer(IDbContextOutbox<PracticeDbContext> outbox)
{
    public async Task FinalizeAsync(Attempt attempt, PracticeTest test, IReadOnlyList<Question> questions, IReadOnlyList<Answer> answers, DateTimeOffset now)
    {
        ArgumentNullException.ThrowIfNull(attempt);
        ArgumentNullException.ThrowIfNull(test);
        ArgumentNullException.ThrowIfNull(questions);
        ArgumentNullException.ThrowIfNull(answers);

        var byQuestion = answers.ToDictionary(a => a.QuestionId);
        var marked = questions
            .Select(q =>
            {
                byQuestion.TryGetValue(q.Id, out var answer);
                return new MarkedQuestion(
                    q.Topic,
                    q.Marks,
                    answer?.IsCorrect ?? false,
                    answer?.AwardedMarks ?? 0,
                    answer?.GradedBy == GradedBy.Pending);
            })
            .ToList();

        var tallies = Marking.Tally(marked);
        foreach (var tally in tallies)
        {
            outbox.DbContext.AttemptTopicScores.Add(AttemptTopicScore.From(attempt, tally));
        }

        var awarded = tallies.Sum(t => t.MarksAwarded);
        var available = tallies.Sum(t => t.MarksAvailable);
        var partial = marked.Any(m => m.Pending);
        attempt.Grade(awarded, available, partial, now);

        await outbox.PublishAsync(new PracticeAttemptGraded(
            attempt.Id,
            test.Id,
            attempt.UserId,
            attempt.StudyUnitId,
            awarded,
            available,
            attempt.ScorePercent ?? 0m,
            partial,
            Marking.SecondsOnTask(attempt, test.DurationMinutes),
            tallies.Select(t => new TopicAccuracy(t.Topic, t.QuestionsTotal, t.QuestionsCorrect, t.MarksAvailable, t.MarksAwarded)).ToList(),
            attempt.SubmittedAt ?? now,
            now));
    }
}

/// <summary>
/// Marks the pending written answers of a submitted attempt through the ai grader. A failed call is retried with
/// backoff; after the last try the answers stay "not marked yet" and the attempt is graded on its marked part.
/// </summary>
internal sealed partial class WrittenGrader(
    IDbContextOutbox<PracticeDbContext> outbox,
    IGrader grader,
    GradeFinalizer finalizer,
    IClock clock,
    IOptions<PracticeOptions> options,
    ILogger<WrittenGrader> logger)
{
    private PracticeDbContext Db => outbox.DbContext;

    public async Task GradeAsync(Guid attemptId, CancellationToken cancellationToken)
    {
        var attempt = await Db.Attempts.SingleOrDefaultAsync(a => a.Id == attemptId, cancellationToken);
        if (attempt is not { Status: AttemptStatuses.Grading })
        {
            return;
        }

        var test = await Db.Tests.IgnoreQueryFilters().SingleAsync(t => t.Id == attempt.TestId, cancellationToken);
        var questions = await Db.Questions.Where(q => q.TestId == test.Id).OrderBy(q => q.Position).ToListAsync(cancellationToken);
        var answers = await Db.Answers.Where(a => a.AttemptId == attempt.Id && a.UserId == attempt.UserId).ToListAsync(cancellationToken);
        var byId = questions.ToDictionary(q => q.Id);
        var pending = answers.Where(a => a.GradedBy == GradedBy.Pending && byId.ContainsKey(a.QuestionId)).ToList();

        if (pending.Count > 0)
        {
            var tries = attempt.RecordGradingAttempt();
            var request = new WrittenGradingRequest(
                attempt.UserId,
                attempt.Id.ToString(),
                GenerationText.HumanLevel(test.LevelSnapshot),
                test.SubjectSnapshot,
                pending
                    .Select(a => byId[a.QuestionId])
                    .Select(q => new WrittenAnswer(
                        q.Id.ToString(),
                        q.Kind,
                        q.Stem,
                        q.Marks,
                        q.Memo,
                        q.ExpectedAnswer ?? string.Empty,
                        pending.Single(a => a.QuestionId == q.Id).TextAnswer ?? string.Empty))
                    .ToList());

            WrittenGradingResult result;
            try
            {
                result = await grader.GradeAsync(request, cancellationToken);
            }
            catch (AiServiceUnavailableException ex)
            {
                LogGradingFailed(logger, attempt.Id, tries, ex);
                if (tries < options.Value.MaxGradingAttempts)
                {
                    await outbox.ScheduleAsync(new GradePracticeAttempt(attempt.Id), Backoff.Delay(options.Value.RetryBaseSeconds, tries));
                    await outbox.SaveChangesAndFlushMessagesAsync(cancellationToken);
                    return;
                }

                result = new WrittenGradingResult([], 0);
            }

            var graded = result.Answers
                .Where(g => Guid.TryParse(g.QuestionId, out _))
                .GroupBy(g => Guid.Parse(g.QuestionId))
                .ToDictionary(g => g.Key, g => g.First());
            var flagged = 0;
            foreach (var answer in pending)
            {
                if (graded.TryGetValue(answer.QuestionId, out var mark))
                {
                    var question = byId[answer.QuestionId];
                    answer.MarkByAi(mark.Awarded, question.Marks, mark.Feedback, mark.NeedsReview);
                    flagged += mark.NeedsReview ? 1 : 0;
                }
            }

            if (flagged > 0)
            {
                PracticeMetrics.PendingReview(flagged);
            }
        }

        await finalizer.FinalizeAsync(attempt, test, questions, answers, clock.UtcNow);
        await outbox.SaveChangesAndFlushMessagesAsync(cancellationToken);
        LogGraded(logger, attempt.Id, attempt.PartiallyGraded);
    }

    [LoggerMessage(Level = LogLevel.Warning, Message = "Could not grade the written answers of attempt {AttemptId} (try {Try})")]
    private static partial void LogGradingFailed(ILogger logger, Guid attemptId, int @try, Exception exception);

    [LoggerMessage(Level = LogLevel.Information, Message = "Attempt {AttemptId} moved from grading to graded (partially graded: {Partial})")]
    private static partial void LogGraded(ILogger logger, Guid attemptId, bool partial);
}
