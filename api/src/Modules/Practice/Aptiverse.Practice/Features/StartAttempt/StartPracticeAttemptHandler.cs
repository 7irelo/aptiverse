using Aptiverse.Practice.Contracts;
using Aptiverse.Practice.Domain;
using Aptiverse.Practice.Features.Common;
using Aptiverse.Practice.Persistence;
using Aptiverse.SharedKernel.Persistence;
using Aptiverse.SharedKernel.Results;
using Aptiverse.SharedKernel.Time;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Wolverine;
using Wolverine.EntityFrameworkCore;

namespace Aptiverse.Practice.Features.StartAttempt;

/// <summary>
/// Starts the one attempt a test gets. The start time and deadline come from the server clock only. A timed attempt
/// schedules its own auto-submit at the deadline plus the network grace in the same transaction, so the deadline
/// holds even if the student never comes back. Unique indexes settle races: a second start is 409, never a 500.
/// </summary>
internal sealed partial class StartPracticeAttemptHandler(
    IDbContextOutbox<PracticeDbContext> outbox,
    AttemptViews views,
    IClock clock,
    IOptions<PracticeOptions> options,
    ILogger<StartPracticeAttemptHandler> logger)
{
    private const string OneAttemptPerTest = "ix_attempts_test_id";

    private PracticeDbContext Db => outbox.DbContext;

    public async Task<Result<AttemptState>> HandleAsync(Guid userId, Guid testId, CancellationToken cancellationToken)
    {
        var test = await Db.TestAsync(userId, testId, cancellationToken);
        if (test is null)
        {
            return PracticeErrors.TestNotFound;
        }

        if (await ExistingAttemptIdAsync(test.Id, cancellationToken) is { } existing)
        {
            return PracticeErrors.AttemptExists.With("attemptId", existing);
        }

        if (test.Status == TestStatuses.Archived)
        {
            return PracticeErrors.TestArchived;
        }

        if (test.Status != TestStatuses.Ready)
        {
            return PracticeErrors.TestNotReady;
        }

        if (await ActiveAttemptIdAsync(userId, cancellationToken) is { } active)
        {
            return PracticeErrors.OtherAttemptActive.With("attemptId", active);
        }

        var now = clock.UtcNow;
        var attempt = Attempt.Start(test, now);
        Db.Attempts.Add(attempt);
        await outbox.PublishAsync(new PracticeAttemptStarted(attempt.Id, test.Id, userId, attempt.Mode, attempt.DeadlineAt, now));
        if (attempt.DeadlineAt is { } deadline)
        {
            await outbox.ScheduleAsync(new AutoSubmitPracticeAttempt(attempt.Id, deadline), deadline + options.Value.NetworkGrace);
        }

        try
        {
            await outbox.SaveChangesAndFlushMessagesAsync(cancellationToken);
        }
        catch (DbUpdateException ex) when (DbErrors.IsUniqueViolation(ex))
        {
            Db.ChangeTracker.Clear();
            if (DbErrors.IsUniqueViolation(ex, OneAttemptPerTest) && await ExistingAttemptIdAsync(test.Id, cancellationToken) is { } raced)
            {
                return PracticeErrors.AttemptExists.With("attemptId", raced);
            }

            return await ActiveAttemptIdAsync(userId, cancellationToken) is { } other
                ? PracticeErrors.OtherAttemptActive.With("attemptId", other)
                : PracticeErrors.OtherAttemptActive;
        }

        PracticeMetrics.Started(attempt.Mode);
        LogStarted(logger, userId, test.Id, attempt.Id, attempt.Mode, attempt.DeadlineAt);
        return await views.BuildAsync(attempt, now, cancellationToken);
    }

    // Soft-deleted attempts count too: one attempt per test, ever.
    private async Task<Guid?> ExistingAttemptIdAsync(Guid testId, CancellationToken cancellationToken) =>
        await Db.Attempts.AsNoTracking()
            .IgnoreQueryFilters([ModuleDbContext.SoftDeleteFilter])
            .Where(a => a.TestId == testId)
            .Select(a => (Guid?)a.Id)
            .SingleOrDefaultAsync(cancellationToken);

    private async Task<Guid?> ActiveAttemptIdAsync(Guid userId, CancellationToken cancellationToken) =>
        await Db.Attempts.AsNoTracking()
            .Where(a => a.UserId == userId && AttemptStatuses.Active.Contains(a.Status))
            .Select(a => (Guid?)a.Id)
            .FirstOrDefaultAsync(cancellationToken);

    [LoggerMessage(
        Level = LogLevel.Information,
        Message = "User {UserId} started attempt {AttemptId} on test {TestId} ({Mode}, deadline {DeadlineAt})")]
    private static partial void LogStarted(ILogger logger, Guid userId, Guid testId, Guid attemptId, string mode, DateTimeOffset? deadlineAt);
}
