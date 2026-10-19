using Aptiverse.SharedKernel.Domain;

namespace Aptiverse.Identity.Domain;

/// <summary>
/// One link in a session's refresh chain. Only the SHA-256 hash is stored. A token is consumed when rotated;
/// presenting a consumed token again is reuse and revokes the whole family (the session).
/// </summary>
internal sealed class RefreshToken : Entity
{
    public const int HashLength = 64;

    private RefreshToken()
    {
    }

    public Guid UserId { get; private set; }

    public Guid SessionId { get; private set; }

    public string TokenHash { get; private set; } = string.Empty;

    public DateTimeOffset ExpiresAt { get; private set; }

    public DateTimeOffset? ConsumedAt { get; private set; }

    public DateTimeOffset? RevokedAt { get; private set; }

    public static RefreshToken Create(Guid userId, Guid sessionId, string tokenHash, DateTimeOffset expiresAt) =>
        new() { UserId = userId, SessionId = sessionId, TokenHash = tokenHash, ExpiresAt = expiresAt };

    public void Consume(DateTimeOffset now) => ConsumedAt ??= now;

    public void Revoke(DateTimeOffset now) => RevokedAt ??= now;
}
