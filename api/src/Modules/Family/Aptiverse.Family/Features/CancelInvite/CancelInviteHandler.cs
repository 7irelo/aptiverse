using Aptiverse.Family.Domain;
using Aptiverse.Family.Persistence;
using Aptiverse.SharedKernel.Results;
using Aptiverse.SharedKernel.Time;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Aptiverse.Family.Features.CancelInvite;

internal sealed partial class CancelInviteHandler(FamilyDbContext db, IClock clock, ILogger<CancelInviteHandler> logger)
{
    public async Task<Result> HandleAsync(Guid parentUserId, Guid inviteId, CancellationToken cancellationToken)
    {
        // Only the inviter's own invites: anyone else's id is the same 404 as an unknown one.
        var invite = await db.Invites.SingleOrDefaultAsync(i => i.Id == inviteId && i.InviterUserId == parentUserId, cancellationToken);
        if (invite is null)
        {
            return FamilyErrors.InviteNotFound;
        }

        if (!invite.IsPending)
        {
            return Result.Success();
        }

        invite.Cancel(clock.UtcNow);
        try
        {
            await db.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateConcurrencyException)
        {
            // Accepted or cancelled at the same moment; either way it is no longer pending.
            return Result.Success();
        }

        LogCancelled(logger, parentUserId, inviteId);
        return Result.Success();
    }

    [LoggerMessage(Level = LogLevel.Information, Message = "Parent {UserId} cancelled family invite {InviteId}")]
    private static partial void LogCancelled(ILogger logger, Guid userId, Guid inviteId);
}
