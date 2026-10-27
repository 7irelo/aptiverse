using System.Text.Json;
using Aptiverse.AiTutor.Contracts;
using Aptiverse.Billing.Contracts;
using Aptiverse.Practice.Contracts;
using Aptiverse.Practice.Domain;
using Aptiverse.Practice.Persistence;
using Aptiverse.SharedKernel.Time;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Wolverine;
using Wolverine.EntityFrameworkCore;

namespace Aptiverse.Practice.Generation;

/// <summary>
/// Watches a started generation job until the ai service finishes it.
/// <para>
/// This pass polls: <see cref="PollingGenerationWatcher"/> schedules a <see cref="PollPracticeGeneration"/> message
/// and <see cref="GenerationPoller"/> reads the job's status every few seconds. The ai service also publishes a
/// completion message to SQS; an SQS listener can replace polling later by implementing this interface (it would
/// only arm a timeout) and calling <see cref="GenerationCompletion"/> when the message arrives. Nothing else in the
/// job lifecycle changes.
/// </para>
/// </summary>
internal interface IGenerationWatcher
{
    /// <summary>Called inside the outbox transaction that marks the job running.</summary>
    ValueTask WatchAsync(IDbContextOutbox<PracticeDbContext> outbox, GenerationJob job, CancellationToken cancellationToken);
}

internal sealed class PollingGenerationWatcher(IOptions<PracticeOptions> options) : IGenerationWatcher
{
    public ValueTask WatchAsync(IDbContextOutbox<PracticeDbContext> outbox, GenerationJob job, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(outbox);
        ArgumentNullException.ThrowIfNull(job);
        return outbox.ScheduleAsync(new PollPracticeGeneration(job.Id), TimeSpan.FromSeconds(options.Value.GenerationPollSeconds));
    }
}

/// <summary>
/// Finishes a job either way: stores the questions and readies the test, or fails both. Idempotent. The quota
/// reservation is confirmed (ready) or refunded (failed) before the save; both are idempotent at Billing, so a retry
/// after a failed save settles it once.
/// </summary>
internal sealed partial class GenerationCompletion(
    IDbContextOutbox<PracticeDbContext> outbox,
    IUsageMeter meter,
    IClock clock,
    ILogger<GenerationCompletion> logger)
{
    private PracticeDbContext Db => outbox.DbContext;

    public async Task CompleteAsync(GenerationJob job, PracticeTest test, GeneratedPaper paper, long costUsdMicros, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(job);
        ArgumentNullException.ThrowIfNull(test);
        ArgumentNullException.ThrowIfNull(paper);
        if (!job.IsActive || test.Status != TestStatuses.Generating)
        {
            return;
        }

        var questions = PaperMapper.Map(test.Id, paper);
        if (questions.Count == 0)
        {
            await FailAsync(job, test, GenerationErrorCodes.InvalidOutput, costUsdMicros, cancellationToken);
            return;
        }

        if (job.QuotaReservationId is { } reservationId)
        {
            await meter.ConfirmAsync(reservationId, 1, costUsdMicros, cancellationToken);
        }

        var now = clock.UtcNow;
        Db.Questions.AddRange(questions);
        test.MarkReady(questions.Count, test.IsScored ? questions.Sum(q => q.Marks) : 0);
        job.Succeed(now, costUsdMicros);
        await outbox.PublishAsync(new PracticeTestGenerated(test.Id, test.UserId, test.StudyUnitId, questions.Count, now));
        await outbox.SaveChangesAndFlushMessagesAsync(cancellationToken);
        LogReady(logger, test.Id, job.Id, questions.Count);
    }

    public async Task FailAsync(GenerationJob job, PracticeTest? test, string errorCode, long costUsdMicros, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(job);
        if (!job.IsActive)
        {
            return;
        }

        if (job.QuotaReservationId is { } reservationId)
        {
            await meter.RefundAsync(reservationId, errorCode, cancellationToken);
        }

        var now = clock.UtcNow;
        job.Fail(errorCode, now, costUsdMicros);
        if (test is { Status: TestStatuses.Generating })
        {
            test.MarkFailed();
        }

        await outbox.PublishAsync(new PracticeTestGenerationFailed(job.TestId, job.UserId, errorCode, now));
        await outbox.SaveChangesAndFlushMessagesAsync(cancellationToken);
        PracticeMetrics.GenerationFailed(errorCode);
        LogFailed(logger, job.TestId, job.Id, errorCode);
    }

    [LoggerMessage(Level = LogLevel.Information, Message = "Practice test {TestId} is ready from job {JobId} with {QuestionCount} questions")]
    private static partial void LogReady(ILogger logger, Guid testId, Guid jobId, int questionCount);

    [LoggerMessage(Level = LogLevel.Warning, Message = "Practice test {TestId} failed in job {JobId} with {ErrorCode}")]
    private static partial void LogFailed(ILogger logger, Guid testId, Guid jobId, string errorCode);
}

/// <summary>Starts a queued job on the ai service, retrying a few times with backoff before failing it.</summary>
internal sealed partial class GenerationRunner(
    IDbContextOutbox<PracticeDbContext> outbox,
    IQuestionGenerator generator,
    IGenerationWatcher watcher,
    GenerationCompletion completion,
    IClock clock,
    IOptions<PracticeOptions> options,
    ILogger<GenerationRunner> logger)
{
    private PracticeDbContext Db => outbox.DbContext;

    public async Task StartAsync(Guid jobId, CancellationToken cancellationToken)
    {
        var job = await Db.GenerationJobs.SingleOrDefaultAsync(j => j.Id == jobId, cancellationToken);
        if (job is not { Status: JobStatuses.Queued })
        {
            return;
        }

        var test = await Db.Tests.SingleOrDefaultAsync(t => t.Id == job.TestId && t.UserId == job.UserId, cancellationToken);
        if (test is null)
        {
            await completion.FailAsync(job, null, GenerationErrorCodes.Cancelled, 0, cancellationToken);
            return;
        }

        var stored = JsonSerializer.Deserialize<StoredGenerationRequest>(job.Request, JsonSerializerOptions.Web)
            ?? throw new InvalidOperationException($"Generation job {job.Id} has no stored request.");

        try
        {
            await generator.StartAsync(stored.Ai, cancellationToken);
        }
        catch (AiServiceUnavailableException ex)
        {
            var attempts = job.RecordStartFailure();
            LogStartFailed(logger, job.Id, attempts, ex);
            if (attempts >= options.Value.MaxGenerationAttempts)
            {
                await completion.FailAsync(job, test, GenerationErrorCodes.Failed, 0, cancellationToken);
                return;
            }

            await outbox.ScheduleAsync(new StartPracticeGeneration(job.Id), Backoff.Delay(options.Value.RetryBaseSeconds, attempts));
            await outbox.SaveChangesAndFlushMessagesAsync(cancellationToken);
            return;
        }

        var now = clock.UtcNow;
        job.MarkStarted(now, now.AddMinutes(options.Value.GenerationTimeoutMinutes));
        await watcher.WatchAsync(outbox, job, cancellationToken);
        await outbox.SaveChangesAndFlushMessagesAsync(cancellationToken);
    }

    [LoggerMessage(Level = LogLevel.Warning, Message = "Could not start generation job {JobId} (attempt {Attempt})")]
    private static partial void LogStartFailed(ILogger logger, Guid jobId, int attempt, Exception exception);
}

/// <summary>
/// Reads a running job's status from the ai service on a schedule (every few seconds, giving up after the configured
/// timeout). Polling is the stand-in for the ai service's SQS completion messages; see <see cref="IGenerationWatcher"/>
/// for how a listener replaces it.
/// </summary>
internal sealed partial class GenerationPoller(
    IDbContextOutbox<PracticeDbContext> outbox,
    IQuestionGenerator generator,
    GenerationCompletion completion,
    IClock clock,
    IOptions<PracticeOptions> options,
    ILogger<GenerationPoller> logger)
{
    private PracticeDbContext Db => outbox.DbContext;

    public async Task PollAsync(Guid jobId, CancellationToken cancellationToken)
    {
        var job = await Db.GenerationJobs.SingleOrDefaultAsync(j => j.Id == jobId, cancellationToken);
        if (job is not { Status: JobStatuses.Running })
        {
            return;
        }

        var test = await Db.Tests.SingleOrDefaultAsync(t => t.Id == job.TestId && t.UserId == job.UserId, cancellationToken);
        if (test is null)
        {
            await completion.FailAsync(job, null, GenerationErrorCodes.Cancelled, 0, cancellationToken);
            return;
        }

        if (job.PollDeadlineAt is { } deadline && clock.UtcNow > deadline)
        {
            await completion.FailAsync(job, test, GenerationErrorCodes.TimedOut, 0, cancellationToken);
            return;
        }

        QuestionGenerationStatus status;
        try
        {
            status = await generator.GetStatusAsync(job.UserId, job.Id.ToString(), cancellationToken);
        }
        catch (AiServiceUnavailableException ex)
        {
            LogPollFailed(logger, job.Id, ex);
            await RescheduleAsync(job, cancellationToken);
            return;
        }

        switch (status.Status)
        {
            case QuestionGenerationStatus.Completed when status.Result is { } paper:
                await completion.CompleteAsync(job, test, paper, status.CostUsdMicros, cancellationToken);
                break;
            case QuestionGenerationStatus.Running:
            case QuestionGenerationStatus.Review:
                await RescheduleAsync(job, cancellationToken);
                break;
            default:
                await completion.FailAsync(job, test, GenerationErrorCodes.Failed, status.CostUsdMicros, cancellationToken);
                break;
        }
    }

    private async Task RescheduleAsync(GenerationJob job, CancellationToken cancellationToken)
    {
        await outbox.ScheduleAsync(new PollPracticeGeneration(job.Id), TimeSpan.FromSeconds(options.Value.GenerationPollSeconds));
        await outbox.SaveChangesAndFlushMessagesAsync(cancellationToken);
    }

    [LoggerMessage(Level = LogLevel.Warning, Message = "Could not read the status of generation job {JobId}; polling again")]
    private static partial void LogPollFailed(ILogger logger, Guid jobId, Exception exception);
}

internal static class Backoff
{
    /// <summary>base, 2 x base, 4 x base... capped at an hour.</summary>
    public static TimeSpan Delay(int baseSeconds, int attempt) =>
        TimeSpan.FromSeconds(Math.Min(3600, baseSeconds * Math.Pow(2, Math.Max(0, attempt - 1))));
}
