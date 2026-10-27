using Aptiverse.Family.Contracts;
using Aptiverse.Family.Domain;
using Aptiverse.Family.Features.Common;
using Aptiverse.Family.Persistence;
using Aptiverse.SharedKernel.Time;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Wolverine.EntityFrameworkCore;

namespace Aptiverse.Family.Erasure;

/// <summary>
/// Erasure (POPIA): every link on either side ends (removed by "system", so the other side and Billing hear about it)
/// and is soft deleted, with every invite the user sent or that was addressed to them, their link codes and their
/// failed code attempts. Consent the user gave as a parent and that is still current is withdrawn (an appended row with
/// source "system", and ParentalConsentWithdrawn so Identity withdraws the student's document): nobody is left to stand
/// behind it. Earlier consent rows are kept as evidence of lawful processing (decision 39). Idempotent.
/// </summary>
internal sealed partial class FamilyUserDataEraser(IDbContextOutbox<FamilyDbContext> outbox, IClock clock, ILogger<FamilyUserDataEraser> logger)
{
    private FamilyDbContext Db => outbox.DbContext;

    public async Task EraseAsync(Guid userId, string? email, CancellationToken cancellationToken)
    {
        var now = clock.UtcNow;
        var normalized = string.IsNullOrWhiteSpace(email) ? null : Emails.Normalize(email);

        var links = await Db.Links.Where(l => l.ParentUserId == userId || l.StudentUserId == userId).ToListAsync(cancellationToken);
        foreach (var link in links)
        {
            if (link.Remove(RemovedBy.System, now))
            {
                await outbox.PublishAsync(new FamilyLinkRemoved(link.Id, link.ParentUserId, link.StudentUserId, RemovedBy.System, now));
            }
        }

        var withdrawn = await WithdrawConsentGivenByAsync(userId, now, cancellationToken);

        var invites = await Db.Invites
            .Where(i => i.InviterUserId == userId || i.AcceptedByUserId == userId || (normalized != null && i.InviteeEmail == normalized))
            .ToListAsync(cancellationToken);
        var codes = await Db.LinkCodes.Where(c => c.StudentUserId == userId).ToListAsync(cancellationToken);
        var failures = await Db.LinkCodeFailures.Where(f => f.ParentUserId == userId).ToListAsync(cancellationToken);

        Db.Links.RemoveRange(links);
        Db.Invites.RemoveRange(invites);
        Db.LinkCodes.RemoveRange(codes);
        Db.LinkCodeFailures.RemoveRange(failures);
        await outbox.SaveChangesAndFlushMessagesAsync(cancellationToken);

        LogErased(logger, userId, links.Count, invites.Count, codes.Count, withdrawn);
    }

    private async Task<int> WithdrawConsentGivenByAsync(Guid parentUserId, DateTimeOffset now, CancellationToken cancellationToken)
    {
        var students = await Db.ParentalConsents.AsNoTracking()
            .Where(c => c.ParentUserId == parentUserId && c.Action == ConsentActions.Granted)
            .Select(c => c.StudentUserId)
            .Distinct()
            .ToListAsync(cancellationToken);

        var withdrawn = 0;
        foreach (var studentUserId in students)
        {
            // Only when this parent's grant is still the student's current consent; a later withdrawal or another
            // parent's consent is left alone, which also makes a repeated erasure a no-op.
            var current = await Db.CurrentConsentAsync(studentUserId, cancellationToken);
            if (current is not { IsGrant: true } || current.ParentUserId != parentUserId)
            {
                continue;
            }

            Db.ParentalConsents.Add(ParentalConsentRecord.Withdraw(current, ConsentRecordSources.System, now));
            await outbox.PublishAsync(new ParentalConsentWithdrawn(current.Id, studentUserId, parentUserId, now));
            FamilyMetrics.ConsentChanged(ConsentActions.Withdrawn);
            withdrawn++;
        }

        return withdrawn;
    }

    [LoggerMessage(
        Level = LogLevel.Information,
        Message = "Erased family data of user {UserId}: {Links} links, {Invites} invites, {Codes} link codes, {Consents} consents withdrawn")]
    private static partial void LogErased(ILogger logger, Guid userId, int links, int invites, int codes, int consents);
}
