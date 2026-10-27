using Aptiverse.Identity.Authentication;
using Aptiverse.Identity.Contracts;
using Aptiverse.Identity.Domain;
using Aptiverse.Identity.Features.Common;
using Aptiverse.Identity.Persistence;
using Aptiverse.SharedKernel.Results;
using Aptiverse.SharedKernel.Time;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Npgsql;
using Wolverine.EntityFrameworkCore;

namespace Aptiverse.Identity.Features.Register;

/// <summary>
/// Creates a password account with its role, consent evidence and first session, and queues the welcome and
/// verification emails, all in one transaction. A taken email answers 409 (open question 1: accepted, with the
/// strict register limit) because the plan signs the user straight in.
/// </summary>
internal sealed partial class RegisterHandler(
    IDbContextOutbox<IdentityDbContext> outbox,
    UserManager<User> users,
    EmailAddresses emails,
    SessionService sessions,
    OneTimeTokens oneTimeTokens,
    AuthTokensFactory tokens,
    IOptions<LegalOptions> legal,
    IClock clock,
    ILogger<RegisterHandler> logger)
{
    private IdentityDbContext Db => outbox.DbContext;

    public async Task<Result<AuthTokens>> HandleAsync(RegisterRequest request, RequestInfo origin, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);
        var versions = legal.Value;
        if (request.AcceptedTermsVersion != versions.TermsVersion || request.AcceptedPrivacyVersion != versions.PrivacyVersion)
        {
            return IdentityErrors.ConsentOutdated;
        }

        var email = EmailAddresses.Clean(request.Email);
        var normalized = emails.Normalize(email);
        if (await Db.Users.AnyAsync(u => u.NormalizedEmail == normalized, cancellationToken))
        {
            return IdentityErrors.EmailTaken;
        }

        var user = User.Create(email, normalized, request.Name, emailConfirmed: false);
        var hash = await PasswordPolicy.HashAsync(users, user, request.Password, "password");
        if (hash.IsFailure)
        {
            return hash.Error!;
        }

        user.PasswordHash = hash.Value;
        user.AddRole(request.Role);
        Db.Users.Add(user);

        var now = clock.UtcNow;
        Db.UserConsents.Add(UserConsent.Create(user.Id, UserConsent.Terms, versions.TermsVersion, ConsentSources.Register, origin, now));
        Db.UserConsents.Add(UserConsent.Create(user.Id, UserConsent.Privacy, versions.PrivacyVersion, ConsentSources.Register, origin, now));
        if (request.MarketingEmails)
        {
            Db.UserConsents.Add(UserConsent.Create(
                user.Id, UserConsent.MarketingEmail, UserConsent.UnversionedDocument, ConsentSources.Register, origin, now));
        }

        Db.SecurityEvents.Add(SecurityEvent.Create(SecurityEventTypes.Registered, user.Id, null, origin));
        var started = sessions.Start(user, AuthMethods.Password, origin);
        var verification = await oneTimeTokens.IssueAsync(user.Id, TokenPurposes.EmailVerification, cancellationToken);

        await outbox.PublishAsync(new UserRegistered(user.Id, user.Email, user.Name, request.Role, now));
        await outbox.PublishAsync(new EmailVerificationRequested(user.Id, user.Email, user.Name, verification.Link, verification.ExpiresAt, now));

        try
        {
            await outbox.SaveChangesAndFlushMessagesAsync(cancellationToken);
        }
        catch (DbUpdateException ex) when (ex.InnerException is PostgresException { SqlState: PostgresErrorCodes.UniqueViolation })
        {
            // A parallel registration with the same email won the unique index.
            return IdentityErrors.EmailTaken;
        }

        IdentityMetrics.Registered(request.Role);
        LogRegistered(logger, user.Id, request.Role, versions.TermsVersion, versions.PrivacyVersion);
        return tokens.Create(user, started.Session, started.Refresh);
    }

    [LoggerMessage(
        Level = LogLevel.Information,
        Message = "User {UserId} registered as {Role} accepting terms {ConsentTermsVersion} and privacy {ConsentPrivacyVersion}")]
    private static partial void LogRegistered(ILogger logger, Guid userId, string role, string consentTermsVersion, string consentPrivacyVersion);
}
