using Aptiverse.Family.Contracts;
using Aptiverse.Family.Domain;
using Aptiverse.Family.Features.Common;
using Aptiverse.Family.Persistence;
using Aptiverse.SharedKernel.Results;
using Aptiverse.SharedKernel.Time;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Wolverine.EntityFrameworkCore;

namespace Aptiverse.Family.Features.UpdateSharing;

/// <summary>Only the student on the link changes what a parent sees. Parent reads check the flags on every request, so a change applies at once.</summary>
internal sealed partial class UpdateSharingHandler(IDbContextOutbox<FamilyDbContext> outbox, IClock clock, ILogger<UpdateSharingHandler> logger)
{
    private FamilyDbContext Db => outbox.DbContext;

    public async Task<Result<LinkView>> HandleAsync(Guid studentUserId, Guid parentUserId, UpdateSharingRequest request, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);
        var link = await Db.ActiveLinkAsync(parentUserId, studentUserId, cancellationToken);
        if (link is null)
        {
            return FamilyErrors.ParentNotFound;
        }

        var now = clock.UtcNow;
        var flags = new SharingFlags(request.Academics!.Value, request.Practice!.Value, request.Goals!.Value, request.TutorActivity!.Value);
        if (!link.SetSharing(flags, now))
        {
            return LinkView.Of(link);
        }

        await outbox.PublishAsync(new FamilySharingChanged(link.Id, parentUserId, studentUserId, flags, now));
        try
        {
            await outbox.SaveChangesAndFlushMessagesAsync(cancellationToken);
        }
        catch (DbUpdateConcurrencyException)
        {
            // The link was removed or changed at the same moment: answer as if it was not found, the client reloads.
            return FamilyErrors.ParentNotFound;
        }

        LogChanged(logger, studentUserId, link.Id, flags.Academics, flags.Practice, flags.Goals, flags.TutorActivity);
        return LinkView.Of(link);
    }

    [LoggerMessage(
        Level = LogLevel.Information,
        Message = "Student {UserId} changed sharing on family link {LinkId}: academics {Academics}, practice {Practice}, goals {Goals}, tutor {TutorActivity}")]
    private static partial void LogChanged(ILogger logger, Guid userId, Guid linkId, bool academics, bool practice, bool goals, bool tutorActivity);
}
