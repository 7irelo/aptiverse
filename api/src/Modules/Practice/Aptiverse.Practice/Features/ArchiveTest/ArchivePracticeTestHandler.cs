using Aptiverse.Practice.Contracts;
using Aptiverse.Practice.Domain;
using Aptiverse.Practice.Features.Common;
using Aptiverse.Practice.Persistence;
using Aptiverse.SharedKernel.Persistence;
using Aptiverse.SharedKernel.Results;
using Aptiverse.SharedKernel.Time;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Wolverine.EntityFrameworkCore;

namespace Aptiverse.Practice.Features.ArchiveTest;

/// <summary>
/// A test with an attempt is archived (kept for history and results); a test without one is soft deleted with its
/// questions, and a generation still running for it is cancelled so the student can generate again. Removing it a
/// second time is a no-op. There is no refund: the generation was already used.
/// </summary>
internal sealed partial class ArchivePracticeTestHandler(
    IDbContextOutbox<PracticeDbContext> outbox,
    IClock clock,
    ILogger<ArchivePracticeTestHandler> logger)
{
    private PracticeDbContext Db => outbox.DbContext;

    public async Task<Result> HandleAsync(Guid userId, Guid testId, CancellationToken cancellationToken)
    {
        var test = await Db.TestAsync(userId, testId, cancellationToken);
        if (test is null)
        {
            var deletedByOwner = await Db.Tests
                .IgnoreQueryFilters([ModuleDbContext.SoftDeleteFilter])
                .AnyAsync(t => t.Id == testId && t.UserId == userId && t.DeletedAt != null, cancellationToken);
            return deletedByOwner ? Result.Success() : PracticeErrors.TestNotFound;
        }

        var attempt = await Db.Attempts.SingleOrDefaultAsync(a => a.TestId == test.Id && a.UserId == userId, cancellationToken);
        if (attempt is { IsActive: true })
        {
            return PracticeErrors.AttemptActive;
        }

        if (attempt is not null)
        {
            test.Archive();
        }
        else
        {
            var questions = await Db.Questions.Where(q => q.TestId == test.Id).ToListAsync(cancellationToken);
            var job = await Db.GenerationJobs.SingleOrDefaultAsync(j => j.TestId == test.Id && j.UserId == userId, cancellationToken);
            if (job is { IsActive: true })
            {
                var now = clock.UtcNow;
                job.Fail(GenerationErrorCodes.Cancelled, now);
                await outbox.PublishAsync(new PracticeTestGenerationFailed(test.Id, userId, GenerationErrorCodes.Cancelled, now));
            }

            Db.Questions.RemoveRange(questions);
            Db.Tests.Remove(test);
        }

        try
        {
            await outbox.SaveChangesAndFlushMessagesAsync(cancellationToken);
        }
        catch (DbUpdateConcurrencyException)
        {
            // An attempt started or the job finished at the same moment; let the student retry on fresh state.
            return PracticeErrors.ConcurrencyConflict;
        }

        PracticeMetrics.Archived(attempt is not null);
        LogArchived(logger, userId, test.Id, attempt is not null);
        return Result.Success();
    }

    [LoggerMessage(Level = LogLevel.Information, Message = "User {UserId} removed practice test {TestId} (had attempt: {HadAttempt})")]
    private static partial void LogArchived(ILogger logger, Guid userId, Guid testId, bool hadAttempt);
}
