using Aptiverse.Family.Domain;
using Aptiverse.Family.Persistence;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace Aptiverse.Family.Features.Common;

internal static class DbErrors
{
    public static bool IsUniqueViolation(DbUpdateException exception, string? constraint = null) =>
        exception?.InnerException is PostgresException { SqlState: PostgresErrorCodes.UniqueViolation } pg
        && (constraint is null || string.Equals(pg.ConstraintName, constraint, StringComparison.Ordinal));
}

/// <summary>
/// Per-user Postgres advisory locks. Every link creation for one parent runs under the parent's lock, so two accepts at the
/// same moment cannot both pass the child limit; a student's code issue runs under the student's. The lock is session level on a connection opened here, so it
/// survives the transaction the outbox opens inside it.
/// </summary>
internal static class FamilyLocks
{
    // Keeps the advisory lock keys of this module apart from any other module's.
    private const long Namespace = 0x0046_616D_696C_7900;

    public static long KeyFor(Guid userId)
    {
        Span<byte> bytes = stackalloc byte[16];
        userId.TryWriteBytes(bytes);
        return BitConverter.ToInt64(bytes[..8]) ^ BitConverter.ToInt64(bytes[8..]) ^ Namespace;
    }

    public static async Task<T> RunAsync<T>(FamilyDbContext db, Guid userId, Func<Task<T>> work, CancellationToken cancellationToken)
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

/// <summary>Queries every family read and write starts from, so the "active link of the caller" rule lives in one place.</summary>
internal static class FamilyQueries
{
    /// <summary>
    /// The single place a parent read resolves a child: the caller's active link to that student, or null. Callers
    /// answer null with <see cref="FamilyErrors.ChildNotFound"/> (404), never 403.
    /// </summary>
    public static Task<FamilyLink?> ActiveLinkAsync(this FamilyDbContext db, Guid parentUserId, Guid studentUserId, CancellationToken cancellationToken) =>
        db.Links.SingleOrDefaultAsync(
            l => l.ParentUserId == parentUserId && l.StudentUserId == studentUserId && l.Status == LinkStatuses.Active,
            cancellationToken);

    /// <summary>The student's current consent row (the latest one), or null.</summary>
    public static Task<ParentalConsentRecord?> CurrentConsentAsync(this FamilyDbContext db, Guid studentUserId, CancellationToken cancellationToken) =>
        db.ParentalConsents.AsNoTracking()
            .Where(c => c.StudentUserId == studentUserId)
            .OrderByDescending(c => c.OccurredAt)
            .ThenByDescending(c => c.Id)
            .FirstOrDefaultAsync(cancellationToken);
}
