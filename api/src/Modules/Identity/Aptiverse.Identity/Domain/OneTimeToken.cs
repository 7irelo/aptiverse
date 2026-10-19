using Aptiverse.SharedKernel.Domain;

namespace Aptiverse.Identity.Domain;

/// <summary>A single-use emailed token (verification or password reset). Only the SHA-256 hash is stored.</summary>
internal sealed class OneTimeToken : Entity
{
    public const int PurposeMaxLength = 32;

    private OneTimeToken()
    {
    }

    public Guid UserId { get; private set; }

    public string Purpose { get; private set; } = string.Empty;

    public string TokenHash { get; private set; } = string.Empty;

    public DateTimeOffset ExpiresAt { get; private set; }

    public DateTimeOffset? ConsumedAt { get; private set; }

    public static OneTimeToken Create(Guid userId, string purpose, string tokenHash, DateTimeOffset expiresAt) =>
        new() { UserId = userId, Purpose = purpose, TokenHash = tokenHash, ExpiresAt = expiresAt };

    public void Consume(DateTimeOffset now) => ConsumedAt ??= now;
}

internal static class TokenPurposes
{
    public const string EmailVerification = "email_verification";
    public const string PasswordReset = "password_reset";

    public static IReadOnlyList<string> All { get; } = [EmailVerification, PasswordReset];
}
