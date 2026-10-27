using Aptiverse.Practice.Contracts;
using Aptiverse.Practice.Domain;
using Aptiverse.Practice.Persistence;
using Aptiverse.SharedKernel.Time;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Wolverine;
using Wolverine.EntityFrameworkCore;

namespace Aptiverse.Practice.Grading;

/// <summary>
/// Handles the deadline message of a timed attempt: submits it with the answers saved up to the deadline plus the
/// network grace. A message that fires early is rescheduled for the right time; a stale or repeated one is a no-op.
/// </summary>
internal sealed class AutoSubmitter(
    IDbContextOutbox<PracticeDbContext> outbox,
    AttemptSubmitter submitter,
    IClock clock,
    IOptions<PracticeOptions> options)
{
    public async Task RunAsync(AutoSubmitPracticeAttempt message, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(message);
        var attempt = await outbox.DbContext.Attempts.AsNoTracking()
            .SingleOrDefaultAsync(a => a.Id == message.AttemptId, cancellationToken);
        if (attempt is not { IsActive: true, IsTimed: true } || !attempt.HasDeadline(message.DeadlineAt))
        {
            return;
        }

        var due = attempt.DeadlineAt!.Value + options.Value.NetworkGrace;
        if (clock.UtcNow < due)
        {
            await outbox.ScheduleAsync(message, due);
            await outbox.SaveChangesAndFlushMessagesAsync(cancellationToken);
            return;
        }

        await submitter.SubmitAsync(message.AttemptId, userId: null, SubmitSources.Deadline, attempt.DeadlineAt, cancellationToken);
    }
}
