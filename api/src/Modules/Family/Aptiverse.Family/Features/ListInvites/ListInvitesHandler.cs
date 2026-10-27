using Aptiverse.Family.Features.SendInvite;
using Aptiverse.Family.Persistence;
using Aptiverse.SharedKernel.Time;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Family.Features.ListInvites;

internal sealed class ListInvitesHandler(FamilyDbContext db, IClock clock)
{
    public const int MaxItems = 50;

    public async Task<IReadOnlyList<InviteView>> HandleAsync(Guid parentUserId, CancellationToken cancellationToken)
    {
        var invites = await db.Invites.AsNoTracking()
            .Where(i => i.InviterUserId == parentUserId)
            .OrderByDescending(i => i.CreatedAt)
            .Take(MaxItems)
            .ToListAsync(cancellationToken);
        var now = clock.UtcNow;
        return invites.Select(i => SendInviteHandler.ToView(i, now)).ToList();
    }
}
