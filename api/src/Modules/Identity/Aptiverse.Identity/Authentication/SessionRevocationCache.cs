using Aptiverse.Identity.Persistence;
using Aptiverse.SharedKernel.Time;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Hybrid;

namespace Aptiverse.Identity.Authentication;

/// <summary>
/// Answers "is this session still active?" for every authenticated request, so logout and remote sign-out
/// stop access tokens immediately instead of after their 15 minutes. Entries live briefly in HybridCache and
/// are evicted on revocation. With several API instances and no shared L2 cache, another instance can trust
/// a revoked session for at most <see cref="EntryLifetime"/>.
/// </summary>
internal sealed class SessionRevocationCache(HybridCache cache, IdentityDbContext db, IClock clock)
{
    public static readonly TimeSpan EntryLifetime = TimeSpan.FromSeconds(30);

    private static readonly HybridCacheEntryOptions EntryOptions = new()
    {
        Expiration = EntryLifetime,
        LocalCacheExpiration = EntryLifetime,
    };

    public ValueTask<bool> IsActiveAsync(Guid sessionId, CancellationToken cancellationToken) =>
        cache.GetOrCreateAsync(
            Key(sessionId),
            (db, sessionId, now: clock.UtcNow),
            static async (state, ct) => await state.db.Sessions
                .AsNoTracking()
                .AnyAsync(s => s.Id == state.sessionId && s.RevokedAt == null && s.ExpiresAt > state.now, ct),
            EntryOptions,
            cancellationToken: cancellationToken);

    public async Task EvictAsync(IEnumerable<Guid> sessionIds)
    {
        ArgumentNullException.ThrowIfNull(sessionIds);
        foreach (var id in sessionIds)
        {
            await cache.RemoveAsync(Key(id));
        }
    }

    private static string Key(Guid sessionId) => $"identity:session-active:{sessionId:N}";
}
