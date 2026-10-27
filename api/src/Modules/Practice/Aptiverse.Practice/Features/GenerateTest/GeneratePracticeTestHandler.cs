using System.Text.Json;
using System.Text.RegularExpressions;
using Aptiverse.Academics.Contracts;
using Aptiverse.AiTutor.Contracts;
using Aptiverse.Billing.Contracts;
using Aptiverse.Practice.Contracts;
using Aptiverse.Practice.Domain;
using Aptiverse.Practice.Features.Common;
using Aptiverse.Practice.Generation;
using Aptiverse.Practice.Persistence;
using Aptiverse.SharedKernel.Persistence;
using Aptiverse.SharedKernel.Results;
using Aptiverse.SharedKernel.Time;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Wolverine.EntityFrameworkCore;

namespace Aptiverse.Practice.Features.GenerateTest;

/// <summary>
/// Creates a practice test for one of the caller's assessments. Everything the ai service sees is built here from
/// the student's own records (the assessment, its unit, level and topics); nothing in the request names a user, a
/// unit or a level. One unit of the monthly practice.generate allowance is reserved with Billing first (failing closed);
/// the test and its job are then inserted under a per-user lock that also enforces the daily safety cap and the
/// one-active-generation rule, and the start message goes out through the outbox in the same transaction. If the
/// insert does not happen, the reservation is refunded; the job confirms or refunds it when generation ends.
/// </summary>
internal sealed partial class GeneratePracticeTestHandler(
    IDbContextOutbox<PracticeDbContext> outbox,
    IAssessmentLookup assessments,
    IStudyUnitLookup units,
    IUsageMeter meter,
    IClock clock,
    IOptions<PracticeOptions> options,
    ILogger<GeneratePracticeTestHandler> logger)
{
    private const int WeakestTopicCount = 3;
    private const int AvoidStemCount = 30;
    private const int AvoidStemLength = 300;

    /// <summary>Long enough for start retries plus the poll timeout; a confirm after expiry still charges.</summary>
    private static readonly TimeSpan QuotaHold = TimeSpan.FromHours(2);

    private static readonly string[] OpenAssessmentStates = ["scheduled", "in_progress"];

    private PracticeDbContext Db => outbox.DbContext;

    public async Task<Result<GenerationAccepted>> HandleAsync(
        Guid userId,
        GeneratePracticeTestRequest request,
        string? idempotencyKey,
        CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);
        if (idempotencyKey is not null && !IdempotencyKey().IsMatch(idempotencyKey))
        {
            return PracticeErrors.InvalidIdempotencyKey;
        }

        if (idempotencyKey is not null && await FindReplayAsync(userId, idempotencyKey, cancellationToken) is { } replay)
        {
            return replay;
        }

        var assessment = await assessments.GetForUserAsync(userId, request.AssessmentId, cancellationToken);
        if (assessment is null || !OpenAssessmentStates.Contains(assessment.State))
        {
            return PracticeErrors.AssessmentNotFound;
        }

        var unit = await units.GetAsync(assessment.StudyUnitId, userId, cancellationToken);
        if (unit is null)
        {
            return PracticeErrors.StudyUnitNotFound;
        }

        if (request.Format == PracticeFormats.Reading && unit.Stage != Stages.HighSchool)
        {
            return PracticeErrors.FormatNotAvailable;
        }

        var stage = unit.Stage == Stages.HighSchool ? Stages.HighSchool : Stages.University;
        var mode = PracticeFormats.EffectiveMode(request.Format, request.Mode);
        var difficulty = request.Difficulty ?? Difficulties.Core;
        var questionCount = PracticeFormats.UsesQuestionCount(request.Format) ? request.QuestionCount ?? options.Value.DefaultQuestionCount : (int?)null;
        var duration = request.Format == PracticeFormats.ExamPaper ? request.PaperMarks : mode == PracticeModes.Timed ? request.DurationMinutes : null;
        var topics = await ResolveTopicsAsync(userId, request, unit, cancellationToken);

        var test = PracticeTest.CreateGenerating(
            userId,
            unit.StudyUnitId,
            assessment.AssessmentId,
            unit.Name,
            unit.Level,
            stage,
            $"{assessment.Title}: {PracticeFormats.Label(request.Format)}",
            request.Format,
            mode,
            duration,
            topics,
            difficulty,
            request.FocusOnWeakest);

        var job = GenerationJob.Queue(userId, test.Id, idempotencyKey);
        var aiRequest = new QuestionGenerationRequest(
            userId,
            job.Id.ToString(),
            stage,
            GenerationText.HumanLevel(unit.Level),
            unit.Name,
            GenerationText.SubjectKey(unit.Name),
            GenerationText.Grade(unit.Level),
            stage == Stages.HighSchool ? "caps" : "tertiary",
            request.Format,
            test.Topics,
            assessment.Title,
            GenerationText.TotalMarks(request.Format, questionCount ?? 0, request.PaperMarks),
            await AvoidStemsAsync(userId, unit.StudyUnitId, cancellationToken));
        job.AttachRequest(JsonSerializer.Serialize(
            new StoredGenerationRequest(assessment.AssessmentId, unit.StudyUnitId, request.Format, mode, difficulty, questionCount, request.PaperMarks, aiRequest),
            JsonSerializerOptions.Web));

        var quota = await meter.ReserveAsync(userId, QuotaKeys.PracticeGenerate, 1, $"practice_job:{job.Id}", QuotaHold, cancellationToken);
        switch (quota.Status)
        {
            case ReserveStatus.Exhausted:
                return PracticeErrors.QuotaExhausted.With("quotaKey", quota.QuotaKey).With("resetsAt", quota.ResetsAt);
            case ReserveStatus.Unavailable:
                return PracticeErrors.QuotaUnavailable;
            case ReserveStatus.Reserved:
            default:
                break;
        }

        var reservationId = quota.ReservationId!.Value;
        job.AttachReservation(reservationId);
        Result<GenerationAccepted>? result = null;
        try
        {
            result = await ReserveAsync(test, job, idempotencyKey, cancellationToken);
            return result;
        }
        finally
        {
            // Nothing was queued for this reservation (limit, active job, replay or an exception): give it back.
            if (result is null || result.IsFailure || result.Value.JobId != job.Id)
            {
                await RefundAsync(reservationId);
            }
        }
    }

    private async Task RefundAsync(Guid reservationId)
    {
        try
        {
            await meter.RefundAsync(reservationId, "not_queued", CancellationToken.None);
        }
        catch (Exception ex) when (DbErrors.IsUnavailable(ex))
        {
            // The reservation expires on its own and releases the unit.
            LogRefundFailed(logger, reservationId, ex);
        }
    }

    /// <summary>
    /// Inserts the rows under the user's advisory lock so parallel requests cannot overshoot the daily limit.
    /// Deleted tests still count, or deleting a test would reset the limit. Fails closed: if the count cannot be
    /// made, nothing is generated.
    /// </summary>
    private async Task<Result<GenerationAccepted>> ReserveAsync(
        PracticeTest test,
        GenerationJob job,
        string? idempotencyKey,
        CancellationToken cancellationToken)
    {
        var userId = test.UserId;
        try
        {
            return await AdvisoryLocks.WithUserLockAsync(Db, userId, async () =>
            {
                var since = new DateTimeOffset(clock.UtcNow.UtcDateTime.Date, TimeSpan.Zero);
                var used = await Db.Tests
                    .IgnoreQueryFilters([ModuleDbContext.SoftDeleteFilter])
                    .CountAsync(t => t.UserId == userId && t.CreatedAt >= since, cancellationToken);
                if (used >= options.Value.DailyGenerationLimit)
                {
                    return PracticeErrors.DailyLimitReached;
                }

                if (await ActiveJobIdAsync(userId, cancellationToken) is { } activeJobId)
                {
                    return PracticeErrors.GenerationInProgress.With("jobId", activeJobId);
                }

                Db.Tests.Add(test);
                Db.GenerationJobs.Add(job);
                await outbox.PublishAsync(new StartPracticeGeneration(job.Id));
                await outbox.SaveChangesAndFlushMessagesAsync(cancellationToken);

                PracticeMetrics.Requested(test.Mode, test.StageSnapshot);
                LogRequested(logger, userId, test.Id, job.Id, test.StudyUnitId, test.Topics.Count, test.Format, test.Mode);
                return Result.Success(Accepted(test.Id, job.Id, "queued"));
            }, cancellationToken);
        }
        catch (DbUpdateException ex) when (DbErrors.IsUniqueViolation(ex))
        {
            // A parallel request from another device won the race for the active slot or the idempotency key.
            Db.ChangeTracker.Clear();
            if (idempotencyKey is not null && await FindReplayAsync(userId, idempotencyKey, cancellationToken) is { } replay)
            {
                return replay;
            }

            return await ActiveJobIdAsync(userId, cancellationToken) is { } activeJobId
                ? PracticeErrors.GenerationInProgress.With("jobId", activeJobId)
                : PracticeErrors.GenerationInProgress;
        }
        catch (Exception ex) when (DbErrors.IsUnavailable(ex))
        {
            LogLimitUnavailable(logger, ex);
            return PracticeErrors.LimitUnavailable;
        }
    }

    private async Task<Guid?> ActiveJobIdAsync(Guid userId, CancellationToken cancellationToken) =>
        await Db.GenerationJobs.AsNoTracking()
            .Where(j => j.UserId == userId && JobStatuses.Active.Contains(j.Status))
            .Select(j => (Guid?)j.Id)
            .FirstOrDefaultAsync(cancellationToken);

    private async Task<GenerationAccepted?> FindReplayAsync(Guid userId, string idempotencyKey, CancellationToken cancellationToken)
    {
        var row = await (from j in Db.GenerationJobs.AsNoTracking().IgnoreQueryFilters([ModuleDbContext.SoftDeleteFilter])
                         join t in Db.Tests.AsNoTracking().IgnoreQueryFilters([ModuleDbContext.SoftDeleteFilter]) on j.TestId equals t.Id
                         where j.UserId == userId && j.IdempotencyKey == idempotencyKey && t.UserId == userId
                         select new { j.Id, j.TestId, JobStatus = j.Status, TestStatus = t.Status })
            .SingleOrDefaultAsync(cancellationToken);

        return row is null ? null : Accepted(row.TestId, row.Id, PublicStatus.Of(row.TestStatus, row.JobStatus));
    }

    private async Task<IReadOnlyList<string>> ResolveTopicsAsync(
        Guid userId,
        GeneratePracticeTestRequest request,
        StudyUnitContext unit,
        CancellationToken cancellationToken)
    {
        var requested = (request.Topics ?? [])
            .Select(t => t.Trim())
            .Where(t => t.Length > 0)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();

        if (request.FocusOnWeakest)
        {
            var weakest = await Db.AttemptTopicScores.AsNoTracking()
                .Where(s => s.UserId == userId && s.StudyUnitId == unit.StudyUnitId)
                .GroupBy(s => s.Topic)
                .Select(g => new { Topic = g.Key, Available = g.Sum(s => s.MarksAvailable), Awarded = g.Sum(s => s.MarksAwarded) })
                .Where(g => g.Available > 0)
                .OrderBy(g => (double)g.Awarded / g.Available)
                .ThenBy(g => g.Topic)
                .Take(WeakestTopicCount)
                .Select(g => g.Topic)
                .ToListAsync(cancellationToken);
            if (weakest.Count > 0)
            {
                requested = weakest.Select(t => t.Length <= PracticeTest.TopicMaxLength ? t : t[..PracticeTest.TopicMaxLength]).ToList();
            }
        }

        if (requested.Count == 0)
        {
            requested = unit.KnownTopics.Take(PracticeTest.MaxTopics).ToList();
        }

        return requested.Count == 0 ? [unit.Name] : requested.Take(PracticeTest.MaxTopics).ToList();
    }

    private async Task<IReadOnlyList<string>> AvoidStemsAsync(Guid userId, Guid studyUnitId, CancellationToken cancellationToken)
    {
        var stems = await (from q in Db.Questions.AsNoTracking()
                           join t in Db.Tests.AsNoTracking() on q.TestId equals t.Id
                           where t.UserId == userId && t.StudyUnitId == studyUnitId
                           orderby t.CreatedAt descending, q.Position
                           select q.Stem)
            .Take(AvoidStemCount)
            .ToListAsync(cancellationToken);
        return stems.Select(s => s.Length <= AvoidStemLength ? s : s[..AvoidStemLength]).ToList();
    }

    private static GenerationAccepted Accepted(Guid testId, Guid jobId, string status) =>
        new(testId, jobId, status, PracticeUrls.Status(testId));

    [GeneratedRegex("^[A-Za-z0-9_-]{8,64}$")]
    private static partial Regex IdempotencyKey();

    [LoggerMessage(
        Level = LogLevel.Information,
        Message = "User {UserId} requested practice test {TestId} (job {JobId}) for unit {StudyUnitId}: {TopicCount} topics, {Format}, {Mode}")]
    private static partial void LogRequested(ILogger logger, Guid userId, Guid testId, Guid jobId, Guid studyUnitId, int topicCount, string format, string mode);

    [LoggerMessage(Level = LogLevel.Warning, Message = "Could not refund practice quota reservation {ReservationId}; it will expire")]
    private static partial void LogRefundFailed(ILogger logger, Guid reservationId, Exception exception);

    [LoggerMessage(Level = LogLevel.Error, Message = "Could not check the daily practice limit; refusing the request")]
    private static partial void LogLimitUnavailable(ILogger logger, Exception exception);
}

/// <summary>One public generation status from the test and job rows.</summary>
internal static class PublicStatus
{
    public static string Of(string testStatus, string? jobStatus) => testStatus switch
    {
        TestStatuses.Ready or TestStatuses.Archived => "ready",
        TestStatuses.Failed => "failed",
        _ => jobStatus switch
        {
            JobStatuses.Running => "running",
            JobStatuses.Failed => "failed",
            JobStatuses.Succeeded => "ready",
            _ => "queued",
        },
    };
}
