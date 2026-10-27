using Aptiverse.Family.Contracts;
using Aptiverse.Family.Domain;
using Aptiverse.Family.Persistence;
using Aptiverse.Family.Persistence.Configurations;
using Aptiverse.SharedKernel.Results;
using Aptiverse.SharedKernel.Time;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Wolverine.EntityFrameworkCore;

namespace Aptiverse.Family.Features.Common;

/// <param name="ParentUserId">The parent.</param>
/// <param name="StudentUserId">The student.</param>
/// <param name="Relationship">One of <see cref="Relationships.All"/>.</param>
/// <param name="Method">One of <see cref="LinkMethods.All"/>.</param>
/// <param name="SourceId">The invite or code behind the link.</param>
/// <param name="Sharing">Initial flags, or null for the defaults.</param>
internal sealed record NewLink(Guid ParentUserId, Guid StudentUserId, string Relationship, string Method, Guid SourceId, SharingFlags? Sharing);

/// <summary>
/// Creates a link under the parent's lock, after the limits and the duplicate check, and commits it together with the
/// change to its source (the accepted invite or used code) and the FamilyLinkCreated event.
/// </summary>
internal sealed class LinkWriter(IDbContextOutbox<FamilyDbContext> outbox, ChildAllowance allowance, IClock clock, IOptions<FamilyOptions> options)
{
    private FamilyDbContext Db => outbox.DbContext;

    /// <param name="link">What to create.</param>
    /// <param name="markSource">Marks the invite or code as used; runs only when the link is created.</param>
    /// <param name="cancellationToken">Cancels the write.</param>
    public async Task<Result<FamilyLink>> CreateAsync(NewLink link, Action<DateTimeOffset> markSource, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(link);
        ArgumentNullException.ThrowIfNull(markSource);
        if (link.ParentUserId == link.StudentUserId)
        {
            return FamilyErrors.AlreadyLinked;
        }

        var limit = await allowance.ForAsync(link.ParentUserId, cancellationToken);

        try
        {
            return await FamilyLocks.RunAsync<Result<FamilyLink>>(Db, link.ParentUserId, async () =>
            {
                if (await Db.ActiveLinkAsync(link.ParentUserId, link.StudentUserId, cancellationToken) is not null)
                {
                    return FamilyErrors.AlreadyLinked;
                }

                var children = await Db.Links.CountAsync(l => l.ParentUserId == link.ParentUserId && l.Status == LinkStatuses.Active, cancellationToken);
                if (children >= limit)
                {
                    return FamilyErrors.ChildLimitReached(limit);
                }

                var parents = await Db.Links.CountAsync(l => l.StudentUserId == link.StudentUserId && l.Status == LinkStatuses.Active, cancellationToken);
                if (parents >= options.Value.MaxParents)
                {
                    return FamilyErrors.ParentLimitReached(options.Value.MaxParents);
                }

                var now = clock.UtcNow;
                var created = FamilyLink.Create(link.ParentUserId, link.StudentUserId, link.Relationship, link.Method, link.SourceId, now);
                if (link.Sharing is { } sharing)
                {
                    created.SetSharing(sharing, now);
                }

                Db.Links.Add(created);
                markSource(now);
                await outbox.PublishAsync(new FamilyLinkCreated(created.Id, created.ParentUserId, created.StudentUserId, created.Method, now));
                await outbox.SaveChangesAndFlushMessagesAsync(cancellationToken);

                FamilyMetrics.LinkCreated(link.Method);
                return created;
            }, cancellationToken);
        }
        catch (DbUpdateException ex) when (DbErrors.IsUniqueViolation(ex, FamilyLinkConfiguration.ActivePairIndex))
        {
            return FamilyErrors.AlreadyLinked;
        }
    }
}
