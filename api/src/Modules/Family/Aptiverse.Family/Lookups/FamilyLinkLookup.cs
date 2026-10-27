using Aptiverse.Family.Contracts;
using Aptiverse.Family.Domain;
using Aptiverse.Family.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Family.Lookups;

/// <summary>Active links only; a removed link answers exactly like one that never existed.</summary>
internal sealed class FamilyLinkLookup(FamilyDbContext db) : IFamilyLinkLookup
{
    public Task<bool> IsLinkedAsync(Guid parentUserId, Guid studentUserId, CancellationToken cancellationToken) =>
        Active().AnyAsync(l => l.ParentUserId == parentUserId && l.StudentUserId == studentUserId, cancellationToken);

    public async Task<IReadOnlyList<Guid>> GetChildrenAsync(Guid parentUserId, CancellationToken cancellationToken) =>
        await Active()
            .Where(l => l.ParentUserId == parentUserId)
            .OrderBy(l => l.LinkedAt)
            .Select(l => l.StudentUserId)
            .ToListAsync(cancellationToken);

    public async Task<SharingFlags?> GetSharingAsync(Guid parentUserId, Guid studentUserId, CancellationToken cancellationToken)
    {
        var link = await Active().SingleOrDefaultAsync(l => l.ParentUserId == parentUserId && l.StudentUserId == studentUserId, cancellationToken);
        return link?.Sharing;
    }

    private IQueryable<FamilyLink> Active() => db.Links.AsNoTracking().Where(l => l.Status == LinkStatuses.Active);
}
