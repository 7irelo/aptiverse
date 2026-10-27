using Aptiverse.Family.Contracts;
using Aptiverse.Family.Domain;
using Aptiverse.Family.Features.Common;
using Aptiverse.Family.Persistence;
using Aptiverse.Family.Persistence.Configurations;
using Aptiverse.Identity.Contracts;
using Aptiverse.SharedKernel.Results;
using Aptiverse.SharedKernel.Time;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Wolverine.EntityFrameworkCore;

namespace Aptiverse.Family.Features.SendInvite;

/// <summary>
/// A parent invites a student by email. The answer is the same whether or not the address has an account, so the
/// route cannot be used to find out who uses Aptiverse. The link is made only when the student accepts.
/// </summary>
internal sealed partial class SendInviteHandler(
    IDbContextOutbox<FamilyDbContext> outbox,
    IUserDirectory directory,
    ChildAllowance allowance,
    IClock clock,
    IOptions<FamilyOptions> options,
    ILogger<SendInviteHandler> logger)
{
    public const string AcceptPath = "family/invite";

    private FamilyDbContext Db => outbox.DbContext;

    public async Task<Result<InviteView>> HandleAsync(Guid parentUserId, SendInviteRequest request, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);
        var parent = await directory.GetContactAsync(parentUserId, cancellationToken);
        if (parent is not { EmailVerified: true })
        {
            return FamilyErrors.EmailNotVerified;
        }

        var email = Emails.Normalize(request.Email!);
        if (email == Emails.Normalize(parent.Email))
        {
            return FamilyErrors.SelfInvite;
        }

        var now = clock.UtcNow;
        var existing = await Db.Invites.SingleOrDefaultAsync(
            i => i.InviterUserId == parentUserId && i.InviteeEmail == email && i.Status == InviteStatuses.Pending,
            cancellationToken);
        if (existing is not null && !existing.IsExpired(now))
        {
            return FamilyErrors.InviteDuplicate(existing.Id);
        }

        if (existing is not null)
        {
            // Saved on its own first: the partial unique index allows one pending invite per address.
            existing.Expire();
            await Db.SaveChangesAsync(cancellationToken);
        }

        var limit = await allowance.ForAsync(parentUserId, cancellationToken);
        var children = await Db.Links.CountAsync(l => l.ParentUserId == parentUserId && l.Status == LinkStatuses.Active, cancellationToken);
        if (children >= limit)
        {
            return FamilyErrors.ChildLimitReached(limit);
        }

        var token = InviteTokens.NewToken();
        var invite = FamilyInvite.Create(
            parentUserId,
            email,
            parent.Name,
            request.Relationship!,
            InviteTokens.Hash(token),
            now.AddHours(options.Value.InviteExpiryHours));
        Db.Invites.Add(invite);

        await outbox.PublishAsync(new FamilyInviteSent(
            invite.Id,
            parentUserId,
            email,
            invite.InviterDisplayName,
            invite.Relationship,
            AcceptUrl(token),
            invite.ExpiresAt,
            now));

        try
        {
            await outbox.SaveChangesAndFlushMessagesAsync(cancellationToken);
        }
        catch (DbUpdateException ex) when (DbErrors.IsUniqueViolation(ex, FamilyInviteConfiguration.PendingIndex))
        {
            Db.ChangeTracker.Clear();
            var raced = await Db.Invites.AsNoTracking()
                .Where(i => i.InviterUserId == parentUserId && i.InviteeEmail == email && i.Status == InviteStatuses.Pending)
                .Select(i => i.Id)
                .FirstOrDefaultAsync(cancellationToken);
            return FamilyErrors.InviteDuplicate(raced);
        }

        FamilyMetrics.InviteSent();
        LogSent(logger, parentUserId, invite.Id);
        return ToView(invite, now);
    }

    public static InviteView ToView(FamilyInvite invite, DateTimeOffset now)
    {
        ArgumentNullException.ThrowIfNull(invite);
        return new(invite.Id, Emails.Mask(invite.InviteeEmail), invite.Relationship, invite.EffectiveStatus(now), invite.ExpiresAt, invite.CreatedAt);
    }

    private Uri AcceptUrl(string token)
    {
        var root = options.Value.WebAppUrl!.GetLeftPart(UriPartial.Path).TrimEnd('/');
        return new Uri($"{root}/{AcceptPath}?token={Uri.EscapeDataString(token)}", UriKind.Absolute);
    }

    [LoggerMessage(Level = LogLevel.Information, Message = "Parent {UserId} sent family invite {InviteId}")]
    private static partial void LogSent(ILogger logger, Guid userId, Guid inviteId);
}
