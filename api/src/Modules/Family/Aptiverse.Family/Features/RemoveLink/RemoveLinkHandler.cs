using Aptiverse.Family.Contracts;
using Aptiverse.Family.Domain;
using Aptiverse.Family.Features.Common;
using Aptiverse.Family.Persistence;
using Aptiverse.SharedKernel.Results;
using Aptiverse.SharedKernel.Time;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Wolverine.EntityFrameworkCore;

namespace Aptiverse.Family.Features.RemoveLink;

internal sealed partial class RemoveLinkHandler(IDbContextOutbox<FamilyDbContext> outbox, IClock clock, ILogger<RemoveLinkHandler> logger)
{
    private FamilyDbContext Db => outbox.DbContext;

    /// <param name="parentUserId">The parent on the link (the caller when <paramref name="removedBy"/> is parent).</param>
    /// <param name="studentUserId">The student on the link (the caller when <paramref name="removedBy"/> is student).</param>
    /// <param name="removedBy">"parent" or "student".</param>
    /// <param name="cancellationToken">Cancels the write.</param>
    public async Task<Result> HandleAsync(Guid parentUserId, Guid studentUserId, string removedBy, CancellationToken cancellationToken)
    {
        var link = await Db.ActiveLinkAsync(parentUserId, studentUserId, cancellationToken);
        if (link is null)
        {
            var wasLinked = await Db.Links.AnyAsync(l => l.ParentUserId == parentUserId && l.StudentUserId == studentUserId, cancellationToken);
            return wasLinked ? Result.Success() : NotFoundFor(removedBy);
        }

        var now = clock.UtcNow;
        link.Remove(removedBy, now);
        await outbox.PublishAsync(new FamilyLinkRemoved(link.Id, parentUserId, studentUserId, removedBy, now));
        try
        {
            await outbox.SaveChangesAndFlushMessagesAsync(cancellationToken);
        }
        catch (DbUpdateConcurrencyException)
        {
            // Removed by the other side at the same moment: the outcome the caller asked for.
            return Result.Success();
        }

        FamilyMetrics.LinkRemoved(removedBy);
        LogRemoved(logger, link.Id, removedBy);
        return Result.Success();
    }

    private static Error NotFoundFor(string removedBy) => removedBy == RemovedBy.Parent ? FamilyErrors.ChildNotFound : FamilyErrors.ParentNotFound;

    [LoggerMessage(Level = LogLevel.Information, Message = "Family link {LinkId} removed by {RemovedBy}")]
    private static partial void LogRemoved(ILogger logger, Guid linkId, string removedBy);
}
