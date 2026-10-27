using System.Globalization;
using Aptiverse.Progress.Persistence;
using Aptiverse.SharedKernel.Persistence;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace Aptiverse.Progress.Features.Common;

internal static class DbErrors
{
    public static bool IsUniqueViolation(DbUpdateException exception, string? constraint = null) =>
        exception?.InnerException is PostgresException { SqlState: PostgresErrorCodes.UniqueViolation } pg
        && (constraint is null || string.Equals(pg.ConstraintName, constraint, StringComparison.Ordinal));
}

/// <summary>
/// Per-user Postgres advisory locks. Every evidence handler and goal write for one student runs under the lock, so
/// concurrent events (API and worker, parallel deliveries) never lose an increment or race a recompute. The lock is
/// session level on a connection opened here, so it survives the transaction the outbox opens inside it.
/// </summary>
internal static class UserLocks
{
    // Keeps the advisory lock keys of this module apart from any other module's.
    private const long Namespace = 0x0050_726F_6772_6573;

    public static long KeyFor(Guid userId)
    {
        Span<byte> bytes = stackalloc byte[16];
        userId.TryWriteBytes(bytes);
        return BitConverter.ToInt64(bytes[..8]) ^ BitConverter.ToInt64(bytes[8..]) ^ Namespace;
    }

    public static async Task<T> RunAsync<T>(ProgressDbContext db, Guid userId, Func<Task<T>> work, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(db);
        ArgumentNullException.ThrowIfNull(work);
        var key = KeyFor(userId);

        await db.Database.OpenConnectionAsync(cancellationToken);
        try
        {
            await db.Database.ExecuteSqlAsync($"SELECT pg_advisory_lock({key})", cancellationToken);
            try
            {
                return await work();
            }
            finally
            {
                await db.Database.ExecuteSqlAsync($"SELECT pg_advisory_unlock({key})", CancellationToken.None);
            }
        }
        finally
        {
            await db.Database.CloseConnectionAsync();
        }
    }

    public static Task RunAsync(ProgressDbContext db, Guid userId, Func<Task> work, CancellationToken cancellationToken) =>
        RunAsync(
            db,
            userId,
            async () =>
            {
                await work();
                return true;
            },
            cancellationToken);
}

/// <summary>Strong ETags over the xmin row version; If-Match is required on goal writes (412 and 428).</summary>
internal static class ETags
{
    public static string Of(ProgressDbContext db, object entity)
    {
        ArgumentNullException.ThrowIfNull(db);
        var version = (uint)db.Entry(entity).Property(ModuleDbContext.ConcurrencyTokenProperty).CurrentValue!;
        return $"\"{version.ToString(CultureInfo.InvariantCulture)}\"";
    }

    /// <summary>Parses a strong or weak ETag this API issued; null when it is not one.</summary>
    public static uint? Parse(string? ifMatch)
    {
        if (string.IsNullOrWhiteSpace(ifMatch))
        {
            return null;
        }

        var value = ifMatch.Trim();
        if (value.StartsWith("W/", StringComparison.Ordinal))
        {
            value = value[2..];
        }

        return value.Length >= 3 && value[0] == '"' && value[^1] == '"'
            && uint.TryParse(value.AsSpan(1, value.Length - 2), NumberStyles.None, CultureInfo.InvariantCulture, out var version)
            ? version
            : null;
    }

    /// <summary>
    /// Checks If-Match against the loaded row and pins the version so a concurrent write in between also fails.
    /// Returns null when the write may go ahead, or the error to answer with.
    /// </summary>
    public static SharedKernel.Results.Error? Check(ProgressDbContext db, object entity, string? ifMatch)
    {
        ArgumentNullException.ThrowIfNull(db);
        if (string.IsNullOrWhiteSpace(ifMatch))
        {
            return Domain.ProgressErrors.IfMatchRequired;
        }

        var entry = db.Entry(entity).Property(ModuleDbContext.ConcurrencyTokenProperty);
        if (Parse(ifMatch) is not { } version || version != (uint)entry.CurrentValue!)
        {
            return Domain.ProgressErrors.VersionMismatch;
        }

        entry.OriginalValue = version;
        return null;
    }
}

/// <summary>Deterministic ids for events that carry none, so the same event always maps to the same evidence key.</summary>
internal static class SourceIds
{
    public static Guid For(Guid entityId, DateTimeOffset? occurredAt, string kind)
    {
        ArgumentNullException.ThrowIfNull(kind);
        var text = string.Create(CultureInfo.InvariantCulture, $"{entityId:N}|{occurredAt?.UtcTicks ?? 0}|{kind}");
        Span<byte> hash = stackalloc byte[32];
        System.Security.Cryptography.SHA256.HashData(System.Text.Encoding.UTF8.GetBytes(text), hash);
        hash[7] = (byte)((hash[7] & 0x0F) | 0x50);
        hash[8] = (byte)((hash[8] & 0x3F) | 0x80);
        return new Guid(hash[..16]);
    }
}
