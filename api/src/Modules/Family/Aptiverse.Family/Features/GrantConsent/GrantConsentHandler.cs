using Aptiverse.Family.Contracts;
using Aptiverse.Family.Domain;
using Aptiverse.Family.Features.Common;
using Aptiverse.Family.Persistence;
using Aptiverse.Identity.Contracts;
using Aptiverse.SharedKernel.Authorization;
using Aptiverse.SharedKernel.Results;
using Aptiverse.SharedKernel.Time;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Wolverine.EntityFrameworkCore;

namespace Aptiverse.Family.Features.GrantConsent;

/// <summary>Who asked, from where: kept as evidence on the consent row.</summary>
internal sealed record RequestOrigin(string? IpAddress, string? UserAgent);

/// <summary>
/// A linked, verified adult parent records parental consent for a minor (POPIA section 35). The row here is the
/// append-only evidence; ParentalConsentGranted makes Identity record the parental_consent document that Billing's
/// payer check reads, so the two modules never share a table.
/// </summary>
internal sealed partial class GrantConsentHandler(
    IDbContextOutbox<FamilyDbContext> outbox,
    IUserDirectory directory,
    IPayerEligibilityLookup ages,
    IClock clock,
    IOptions<FamilyOptions> options,
    ILogger<GrantConsentHandler> logger)
{
    private FamilyDbContext Db => outbox.DbContext;

    public async Task<Result<ConsentView>> HandleAsync(
        Guid parentUserId,
        Guid studentUserId,
        GrantConsentRequest request,
        RequestOrigin origin,
        CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);
        ArgumentNullException.ThrowIfNull(origin);
        if (await Db.ActiveLinkAsync(parentUserId, studentUserId, cancellationToken) is null)
        {
            return FamilyErrors.ChildNotFound;
        }

        var parent = await directory.GetContactAsync(parentUserId, cancellationToken);
        var parentAge = await ages.GetAsync(parentUserId, cancellationToken);
        if (parent is not { EmailVerified: true } || !parent.Roles.Contains(Roles.Parent) || parentAge?.IsMinor != false)
        {
            return FamilyErrors.ParentNotAdult;
        }

        var version = options.Value.ParentalConsentVersion;
        if (!string.Equals(request.DocumentVersion, version, StringComparison.Ordinal))
        {
            return FamilyErrors.ConsentVersionOutdated(version);
        }

        // An unknown date of birth is treated as a minor, the same fail-closed reading Billing uses.
        var studentAge = await ages.GetAsync(studentUserId, cancellationToken);
        if (studentAge is null)
        {
            return FamilyErrors.ChildNotFound;
        }

        if (studentAge.IsMinor == false)
        {
            return FamilyErrors.ConsentNotNeeded;
        }

        return await FamilyLocks.RunAsync<Result<ConsentView>>(Db, studentUserId, async () =>
        {
            var current = await Db.CurrentConsentAsync(studentUserId, cancellationToken);
            if (current is { IsGrant: true })
            {
                return current.ParentUserId == parentUserId
                    ? ConsentView.Of(studentAge.IsMinor, current, parentUserId)
                    : FamilyErrors.ConsentAlreadyGranted;
            }

            var now = clock.UtcNow;
            var record = ParentalConsentRecord.Grant(studentUserId, parentUserId, version, origin.IpAddress, origin.UserAgent, now);
            Db.ParentalConsents.Add(record);
            await outbox.PublishAsync(new ParentalConsentGranted(
                record.Id, studentUserId, parentUserId, version, record.IpAddress, record.UserAgent, now));
            await outbox.SaveChangesAndFlushMessagesAsync(cancellationToken);

            FamilyMetrics.ConsentChanged(ConsentActions.Granted);
            LogGranted(logger, parentUserId, studentUserId, version);
            return ConsentView.Of(studentAge.IsMinor, record, parentUserId);
        }, cancellationToken);
    }

    [LoggerMessage(Level = LogLevel.Information, Message = "Parent {UserId} granted parental consent for student {StudentId} (version {DocumentVersion})")]
    private static partial void LogGranted(ILogger logger, Guid userId, Guid studentId, string documentVersion);
}
