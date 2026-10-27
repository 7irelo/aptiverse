using Aptiverse.Family.Contracts;
using Aptiverse.Family.Domain;
using Aptiverse.Family.Features.Common;
using Aptiverse.Family.Persistence;
using Aptiverse.Identity.Contracts;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Family.Features.ListParents;

/// <param name="ParentId">Use it in the other /family/parents routes.</param>
/// <param name="LinkId">The link.</param>
/// <param name="DisplayName">The parent's name as they wrote it.</param>
/// <param name="Relationship">How they are related to you.</param>
/// <param name="LinkedAt">When you were linked.</param>
/// <param name="Sharing">What you share with this parent. Change it with PUT /family/parents/{parentId}/sharing.</param>
/// <param name="IsConsentingParent">True when this parent gave the parental consent currently on record.</param>
internal sealed record ParentView(
    Guid ParentId,
    Guid LinkId,
    string DisplayName,
    string Relationship,
    DateTimeOffset LinkedAt,
    SharingFlags Sharing,
    bool IsConsentingParent);

internal sealed class ListParentsHandler(FamilyDbContext db, IUserDirectory directory)
{
    public async Task<IReadOnlyList<ParentView>> HandleAsync(Guid studentUserId, CancellationToken cancellationToken)
    {
        var links = await db.Links.AsNoTracking()
            .Where(l => l.StudentUserId == studentUserId && l.Status == LinkStatuses.Active)
            .OrderBy(l => l.LinkedAt)
            .ToListAsync(cancellationToken);
        var consent = await db.CurrentConsentAsync(studentUserId, cancellationToken);

        var parents = new List<ParentView>(links.Count);
        foreach (var link in links)
        {
            if (await directory.GetContactAsync(link.ParentUserId, cancellationToken) is not { } contact)
            {
                continue;
            }

            parents.Add(new ParentView(
                link.ParentUserId,
                link.Id,
                contact.Name,
                link.Relationship,
                link.LinkedAt,
                link.Sharing,
                consent is { IsGrant: true } && consent.ParentUserId == link.ParentUserId));
        }

        return parents;
    }
}
