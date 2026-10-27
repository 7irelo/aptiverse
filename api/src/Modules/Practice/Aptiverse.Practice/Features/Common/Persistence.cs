using System.Data.Common;
using Aptiverse.Practice.Domain;
using Aptiverse.Practice.Persistence;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace Aptiverse.Practice.Features.Common;

internal static class DbErrors
{
    public static bool IsUniqueViolation(DbUpdateException exception) =>
        exception?.InnerException is PostgresException { SqlState: PostgresErrorCodes.UniqueViolation };

    public static bool IsUniqueViolation(DbUpdateException exception, string constraint) =>
        exception?.InnerException is PostgresException { SqlState: PostgresErrorCodes.UniqueViolation } pg
        && string.Equals(pg.ConstraintName, constraint, StringComparison.Ordinal);

    /// <summary>Database failures that mean "could not check", as opposed to bugs.</summary>
    public static bool IsUnavailable(Exception exception) =>
        exception is DbException or DbUpdateException or InvalidOperationException or TimeoutException;
}

/// <summary>
/// Per-user Postgres advisory locks. The lock is session level on a connection the caller opened, so it survives the
/// transaction the Wolverine outbox opens and commits inside it.
/// </summary>
internal static class AdvisoryLocks
{
    // Keeps the advisory lock keys of this module apart from any other module's.
    private const long Namespace = 0x0050_7261_6374_6963;

    public static long KeyFor(Guid userId)
    {
        Span<byte> bytes = stackalloc byte[16];
        userId.TryWriteBytes(bytes);
        return BitConverter.ToInt64(bytes[..8]) ^ BitConverter.ToInt64(bytes[8..]) ^ Namespace;
    }

    /// <summary>Runs <paramref name="work"/> while holding the user's lock on an explicitly opened connection.</summary>
    public static async Task<T> WithUserLockAsync<T>(PracticeDbContext db, Guid userId, Func<Task<T>> work, CancellationToken cancellationToken)
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
}

/// <summary>Owner-filtered loads. Every read takes the caller's user id, so another user's row is simply absent.</summary>
internal static class OwnedQueries
{
    public static Task<PracticeTest?> TestAsync(this PracticeDbContext db, Guid userId, Guid testId, CancellationToken cancellationToken) =>
        db.Tests.SingleOrDefaultAsync(t => t.Id == testId && t.UserId == userId, cancellationToken);

    public static Task<Attempt?> AttemptAsync(this PracticeDbContext db, Guid userId, Guid attemptId, CancellationToken cancellationToken) =>
        db.Attempts.SingleOrDefaultAsync(a => a.Id == attemptId && a.UserId == userId, cancellationToken);
}
