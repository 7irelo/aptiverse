using Aptiverse.Identity.Authentication;
using Aptiverse.Identity.Domain;
using Aptiverse.Identity.Features.Common;
using Aptiverse.Identity.Persistence;
using Aptiverse.SharedKernel.Results;
using Aptiverse.SharedKernel.Time;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Aptiverse.Identity.Features.AcceptConsents;

/// <summary>
/// Records acceptance of the current legal versions (re-consent after a change). Idempotent per document and
/// version: an existing row is never duplicated. Marketing consent is the only one that can be withdrawn.
/// </summary>
internal sealed partial class AcceptConsentsHandler(
    IdentityDbContext db,
    IOptions<LegalOptions> legal,
    IClock clock,
    ILogger<AcceptConsentsHandler> logger)
{
    public async Task<Result> HandleAsync(Guid userId, AcceptConsentsRequest request, RequestInfo origin, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);
        var versions = legal.Value;
        if (request.TermsVersion != versions.TermsVersion || request.PrivacyVersion != versions.PrivacyVersion)
        {
            return IdentityErrors.ConsentOutdated;
        }

        var existing = await db.UserConsents
            .Where(c => c.UserId == userId)
            .ToListAsync(cancellationToken);
        var now = clock.UtcNow;

        AddIfMissing(existing, userId, UserConsent.Terms, versions.TermsVersion, origin, now);
        AddIfMissing(existing, userId, UserConsent.Privacy, versions.PrivacyVersion, origin, now);

        var activeMarketing = existing.Where(c => c.DocumentKey == UserConsent.MarketingEmail && c.WithdrawnAt is null).ToList();
        if (request.MarketingEmails == true && activeMarketing.Count == 0)
        {
            db.UserConsents.Add(UserConsent.Create(userId, UserConsent.MarketingEmail, UserConsent.UnversionedDocument, ConsentSources.Reconsent, origin, now));
        }
        else if (request.MarketingEmails == false)
        {
            activeMarketing.ForEach(c => c.Withdraw(now));
        }

        await db.SaveChangesAsync(cancellationToken);
        LogAccepted(logger, userId, versions.TermsVersion, versions.PrivacyVersion);
        return Result.Success();
    }

    private void AddIfMissing(List<UserConsent> existing, Guid userId, string document, string version, RequestInfo origin, DateTimeOffset now)
    {
        if (!existing.Any(c => c.DocumentKey == document && c.DocumentVersion == version))
        {
            db.UserConsents.Add(UserConsent.Create(userId, document, version, ConsentSources.Reconsent, origin, now));
        }
    }

    [LoggerMessage(Level = LogLevel.Information, Message = "User {UserId} accepted terms {TermsVersion} and privacy {PrivacyVersion}")]
    private static partial void LogAccepted(ILogger logger, Guid userId, string termsVersion, string privacyVersion);
}
