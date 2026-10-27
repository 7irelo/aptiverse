using Aptiverse.Identity.Domain;
using Aptiverse.Identity.Persistence;
using Aptiverse.SharedKernel.Results;
using Aptiverse.SharedKernel.Time;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace Aptiverse.Identity.Authentication;

internal sealed record IssuedOneTimeToken(string Token, Uri Link, DateTimeOffset ExpiresAt);

/// <summary>
/// Single-use emailed tokens stored hashed in Postgres, so they work across instances without shared data
/// protection keys. Issuing a new token for a purpose invalidates the user's older ones.
/// </summary>
internal sealed class OneTimeTokens(IdentityDbContext db, IClock clock, IOptions<AuthOptions> options)
{
    public static readonly Error InvalidToken =
        Error.Validation("identity.token_invalid", "This link is invalid or has expired. Request a new one.");

    /// <summary>Adds the token to the context. The caller saves (together with the event that emails it).</summary>
    public async Task<IssuedOneTimeToken> IssueAsync(Guid userId, string purpose, CancellationToken cancellationToken)
    {
        var now = clock.UtcNow;
        var older = await db.OneTimeTokens
            .Where(t => t.UserId == userId && t.Purpose == purpose && t.ConsumedAt == null)
            .ToListAsync(cancellationToken);
        foreach (var token in older)
        {
            token.Consume(now);
        }

        var settings = options.Value;
        var (lifetime, path) = purpose switch
        {
            TokenPurposes.EmailVerification => (TimeSpan.FromHours(settings.EmailVerificationHours), "verify-email"),
            TokenPurposes.PasswordReset => (TimeSpan.FromMinutes(settings.PasswordResetMinutes), "reset-password"),
            _ => throw new ArgumentOutOfRangeException(nameof(purpose), purpose, "Unknown token purpose."),
        };

        var value = SecureTokens.Create();
        var expiresAt = now + lifetime;
        db.OneTimeTokens.Add(OneTimeToken.Create(userId, purpose, SecureTokens.Hash(value), expiresAt));

        return new IssuedOneTimeToken(value, new Uri(settings.WebAppUrl, $"{path}?token={Uri.EscapeDataString(value)}"), expiresAt);
    }

    /// <summary>When the user's newest token for <paramref name="purpose"/> was issued, or null if none was.</summary>
    public Task<DateTimeOffset?> LastIssuedAtAsync(Guid userId, string purpose, CancellationToken cancellationToken) =>
        db.OneTimeTokens
            .Where(t => t.UserId == userId && t.Purpose == purpose)
            .OrderByDescending(t => t.CreatedAt)
            .Select(t => (DateTimeOffset?)t.CreatedAt)
            .FirstOrDefaultAsync(cancellationToken);

    /// <summary>Marks a valid token consumed and returns its user id. The caller saves.</summary>
    public async Task<Result<Guid>> RedeemAsync(string token, string purpose, CancellationToken cancellationToken)
    {
        var hash = SecureTokens.Hash(token);
        var row = await db.OneTimeTokens.SingleOrDefaultAsync(t => t.TokenHash == hash && t.Purpose == purpose, cancellationToken);
        var now = clock.UtcNow;

        if (row is null || !SecureTokens.HashEquals(row.TokenHash, hash) || row.ConsumedAt is not null || row.ExpiresAt <= now)
        {
            return InvalidToken;
        }

        row.Consume(now);
        return row.UserId;
    }
}
