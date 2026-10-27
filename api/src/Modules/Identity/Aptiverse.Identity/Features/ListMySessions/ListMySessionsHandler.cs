using Aptiverse.Identity.Persistence;
using Aptiverse.SharedKernel.Time;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Identity.Features.ListMySessions;

/// <param name="Id">The session id; revoke it with revokeMySession.</param>
/// <param name="AuthMethod">"password" or "google".</param>
/// <param name="DeviceLabel">Browser and OS family, for example "Chrome on Android".</param>
/// <param name="IpAddressMasked">The last seen address with its host part zeroed.</param>
/// <param name="CreatedAt">When the device signed in.</param>
/// <param name="LastSeenAt">The last token refresh from the device.</param>
/// <param name="ExpiresAt">When the session ends at the latest.</param>
/// <param name="Current">True for the session making this request.</param>
internal sealed record SessionView(
    Guid Id,
    string AuthMethod,
    string DeviceLabel,
    string? IpAddressMasked,
    DateTimeOffset CreatedAt,
    DateTimeOffset LastSeenAt,
    DateTimeOffset ExpiresAt,
    bool Current);

internal sealed class ListMySessionsHandler(IdentityDbContext db, IClock clock)
{
    public const int MaxSessions = 50;

    public async Task<IReadOnlyList<SessionView>> HandleAsync(Guid userId, Guid? currentSessionId, CancellationToken cancellationToken)
    {
        var now = clock.UtcNow;
        var rows = await db.Sessions.AsNoTracking()
            .Where(s => s.UserId == userId && s.RevokedAt == null && s.ExpiresAt > now)
            .OrderByDescending(s => s.LastSeenAt)
            .Take(MaxSessions)
            .ToListAsync(cancellationToken);

        return rows
            .Select(s => new SessionView(
                s.Id,
                s.AuthMethod,
                SessionDisplay.DeviceLabel(s.UserAgent),
                SessionDisplay.MaskIp(s.IpAddress),
                s.CreatedAt,
                s.LastSeenAt,
                s.ExpiresAt,
                s.Id == currentSessionId))
            .ToList();
    }
}
