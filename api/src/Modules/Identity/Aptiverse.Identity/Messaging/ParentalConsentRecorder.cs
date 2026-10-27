using Aptiverse.Family.Contracts;
using Aptiverse.Identity.Domain;
using Aptiverse.Identity.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Aptiverse.Identity.Messaging;

/// <summary>
/// Keeps the student's parental_consent document in step with Family's consent evidence. Family decides who may
/// consent (a linked, verified adult parent of a minor); Identity only records the outcome, which is what
/// <see cref="Contracts.IPayerEligibilityLookup"/> and so Billing read. Both directions are idempotent.
/// </summary>
internal sealed partial class ParentalConsentRecorder(IdentityDbContext db, ILogger<ParentalConsentRecorder> logger)
{
    public async Task GrantedAsync(ParentalConsentGranted message, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(message);
        if (!await db.Users.AnyAsync(u => u.Id == message.StudentUserId, cancellationToken))
        {
            return;
        }

        var active = await db.UserConsents.AnyAsync(
            c => c.UserId == message.StudentUserId && c.DocumentKey == UserConsent.ParentalConsent && c.WithdrawnAt == null,
            cancellationToken);
        if (active)
        {
            return;
        }

        db.UserConsents.Add(UserConsent.Create(
            message.StudentUserId,
            UserConsent.ParentalConsent,
            Clip(message.DocumentVersion, UserConsent.DocumentVersionMaxLength),
            ConsentSources.Family,
            new RequestInfo(message.IpAddress, message.UserAgent),
            message.OccurredAt));
        await db.SaveChangesAsync(cancellationToken);
        LogRecorded(logger, message.StudentUserId, message.ParentUserId);
    }

    public async Task WithdrawnAsync(ParentalConsentWithdrawn message, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(message);
        var active = await db.UserConsents
            .Where(c => c.UserId == message.StudentUserId && c.DocumentKey == UserConsent.ParentalConsent && c.WithdrawnAt == null)
            .ToListAsync(cancellationToken);
        if (active.Count == 0)
        {
            return;
        }

        active.ForEach(c => c.Withdraw(message.OccurredAt));
        await db.SaveChangesAsync(cancellationToken);
        LogWithdrawn(logger, message.StudentUserId, message.ParentUserId);
    }

    private static string Clip(string value, int max) => value.Length <= max ? value : value[..max];

    [LoggerMessage(Level = LogLevel.Information, Message = "Recorded parental consent for student {UserId} given by parent {ParentId}")]
    private static partial void LogRecorded(ILogger logger, Guid userId, Guid parentId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Withdrew parental consent for student {UserId} at the request of parent {ParentId}")]
    private static partial void LogWithdrawn(ILogger logger, Guid userId, Guid parentId);
}
