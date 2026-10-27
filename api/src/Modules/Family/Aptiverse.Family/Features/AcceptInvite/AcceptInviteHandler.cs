using Aptiverse.Family.Domain;
using Aptiverse.Family.Features.Common;
using Aptiverse.Family.Persistence;
using Aptiverse.Identity.Contracts;
using Aptiverse.SharedKernel.Results;
using Aptiverse.SharedKernel.Time;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Wolverine.EntityFrameworkCore;

namespace Aptiverse.Family.Features.AcceptInvite;

/// <summary>
/// The student accepts a parent's invite: this is the student-side consent every link needs. The signed-in account's
/// verified email must be the invited address, so a forwarded or leaked link cannot link someone else.
/// </summary>
internal sealed partial class AcceptInviteHandler(
    IDbContextOutbox<FamilyDbContext> outbox,
    IUserDirectory directory,
    LinkWriter links,
    IClock clock,
    ILogger<AcceptInviteHandler> logger)
{
    private FamilyDbContext Db => outbox.DbContext;

    public async Task<Result<LinkView>> HandleAsync(Guid studentUserId, AcceptInviteRequest request, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);
        var hash = InviteTokens.Hash(request.Token!);
        var invite = await Db.Invites.SingleOrDefaultAsync(i => i.TokenHash == hash, cancellationToken);
        if (invite is null)
        {
            return FamilyErrors.InviteNotFound;
        }

        if (!invite.IsPending)
        {
            // Accepting twice as the same student answers with the link it made.
            if (invite.Status == InviteStatuses.Accepted && invite.AcceptedByUserId == studentUserId
                && await Db.Links.AsNoTracking().SingleOrDefaultAsync(l => l.SourceId == invite.Id && l.Status == LinkStatuses.Active, cancellationToken) is { } made)
            {
                return LinkView.Of(made);
            }

            return FamilyErrors.InviteNotFound;
        }

        if (invite.IsExpired(clock.UtcNow))
        {
            return FamilyErrors.InviteExpired;
        }

        var student = await directory.GetContactAsync(studentUserId, cancellationToken);
        if (student is not { EmailVerified: true })
        {
            return FamilyErrors.EmailNotVerified;
        }

        if (Emails.Normalize(student.Email) != invite.InviteeEmail)
        {
            return FamilyErrors.InviteEmailMismatch;
        }

        var created = await links.CreateAsync(
            new NewLink(invite.InviterUserId, studentUserId, invite.Relationship, LinkMethods.Invite, invite.Id, request.Sharing),
            now => invite.Accept(studentUserId, now),
            cancellationToken);
        if (created.IsFailure)
        {
            return created.Error!;
        }

        LogAccepted(logger, studentUserId, invite.Id, created.Value.Id);
        return LinkView.Of(created.Value);
    }

    [LoggerMessage(Level = LogLevel.Information, Message = "Student {UserId} accepted family invite {InviteId}, link {LinkId}")]
    private static partial void LogAccepted(ILogger logger, Guid userId, Guid inviteId, Guid linkId);
}
