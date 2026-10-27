using Aptiverse.Family.Contracts;
using Aptiverse.Family.Domain;
using Aptiverse.Family.Features.Common;
using Aptiverse.Family.Persistence;
using Aptiverse.Identity.Contracts;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Family.Features.ListChildren;

/// <param name="Children">Your linked children, oldest link first.</param>
/// <param name="ChildLimit">How many children your plan lets you link.</param>
internal sealed record ChildrenView(IReadOnlyList<ChildView> Children, int ChildLimit);

/// <param name="StudentId">Use it in the other /family/children routes.</param>
/// <param name="LinkId">The link.</param>
/// <param name="DisplayName">The child's name as they wrote it.</param>
/// <param name="Stage">"high_school" or "university"; null before onboarding.</param>
/// <param name="Level">For example "Grade 11" or "Year 2"; null before onboarding.</param>
/// <param name="Relationship">How you are related.</param>
/// <param name="LinkedAt">When you were linked.</param>
/// <param name="Sharing">What the child shares with you. Only the child can change it.</param>
/// <param name="Consent">Parental consent status for this child.</param>
internal sealed record ChildView(
    Guid StudentId,
    Guid LinkId,
    string DisplayName,
    string? Stage,
    string? Level,
    string Relationship,
    DateTimeOffset LinkedAt,
    SharingFlags Sharing,
    ConsentView Consent);

internal sealed class ListChildrenHandler(
    FamilyDbContext db,
    IUserDirectory directory,
    IStudentProfileLookup profiles,
    IPayerEligibilityLookup ages,
    ChildAllowance allowance)
{
    public async Task<ChildrenView> HandleAsync(Guid parentUserId, CancellationToken cancellationToken)
    {
        var links = await db.Links.AsNoTracking()
            .Where(l => l.ParentUserId == parentUserId && l.Status == LinkStatuses.Active)
            .OrderBy(l => l.LinkedAt)
            .ToListAsync(cancellationToken);

        // At most a handful of children (the plan caps it), so per-child contract calls stay cheap.
        var children = new List<ChildView>(links.Count);
        foreach (var link in links)
        {
            var contact = await directory.GetContactAsync(link.StudentUserId, cancellationToken);
            if (contact is null)
            {
                continue;
            }

            var profile = await profiles.GetAsync(link.StudentUserId, cancellationToken);
            var age = await ages.GetAsync(link.StudentUserId, cancellationToken);
            var consent = await db.CurrentConsentAsync(link.StudentUserId, cancellationToken);
            children.Add(new ChildView(
                link.StudentUserId,
                link.Id,
                contact.Name,
                profile?.Stage,
                profile?.Level,
                link.Relationship,
                link.LinkedAt,
                link.Sharing,
                ConsentView.Of(age?.IsMinor, consent, parentUserId)));
        }

        return new ChildrenView(children, await allowance.ForAsync(parentUserId, cancellationToken));
    }
}
