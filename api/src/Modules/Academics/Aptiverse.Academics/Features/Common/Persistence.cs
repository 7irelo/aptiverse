using Aptiverse.Academics.Domain;
using Aptiverse.Academics.Persistence;
using Aptiverse.SharedKernel.Persistence;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace Aptiverse.Academics.Features.Common;

internal static class DbErrors
{
    public static bool IsUniqueViolation(DbUpdateException exception) =>
        exception?.InnerException is PostgresException { SqlState: PostgresErrorCodes.UniqueViolation };
}

/// <summary>An enrolment the caller owns, with its unit.</summary>
internal sealed record OwnedEnrolment(Enrolment Enrolment, StudyUnit Unit);

/// <summary>
/// Loads and creates the rows behind units. Every enrolment read filters by the caller's user id, so another
/// user's enrolment id behaves exactly like one that does not exist.
/// </summary>
internal sealed class UnitStore(AcademicsDbContext db)
{
    /// <summary>Tracked, for writes. Enrolments hidden by a stage change are treated as missing.</summary>
    public async Task<OwnedEnrolment?> LoadOwnedAsync(Guid userId, Guid enrolmentId, CancellationToken cancellationToken)
    {
        var row = await (from e in db.Enrolments
                         join u in db.StudyUnits on e.StudyUnitId equals u.Id
                         where e.Id == enrolmentId && e.UserId == userId && e.Status != EnrolmentStatuses.StageMismatch
                         select new { e, u })
            .SingleOrDefaultAsync(cancellationToken);

        return row is null ? null : new OwnedEnrolment(row.e, row.u);
    }

    public async Task<bool> WasDeletedByOwnerAsync(Guid userId, Guid enrolmentId, CancellationToken cancellationToken) =>
        await db.Enrolments
            .IgnoreQueryFilters([ModuleDbContext.SoftDeleteFilter])
            .AnyAsync(e => e.Id == enrolmentId && e.UserId == userId && e.DeletedAt != null, cancellationToken);

    public async Task<int> CountActiveAsync(Guid userId, CancellationToken cancellationToken) =>
        await db.Enrolments.CountAsync(e => e.UserId == userId && e.Status == EnrolmentStatuses.Active, cancellationToken);

    public async Task<int> NextDisplayOrderAsync(Guid userId, CancellationToken cancellationToken)
    {
        var count = await db.Enrolments.CountAsync(e => e.UserId == userId, cancellationToken);
        return Math.Min(count, Enrolment.MaxDisplayOrder);
    }

    /// <summary>
    /// Returns the shared unit with the candidate's natural key, creating it when it does not exist. Two students
    /// creating the same unit at once both end up with the one row: the loser of the unique index re-reads it.
    /// Saves immediately; a shared reference row on its own is harmless if the enrolment then fails.
    /// </summary>
    public async Task<StudyUnit> FindOrCreateAsync(StudyUnit candidate, CancellationToken cancellationToken)
    {
        var existing = await db.StudyUnits.SingleOrDefaultAsync(u => u.NormalizedKey == candidate.NormalizedKey, cancellationToken);
        if (existing is not null)
        {
            return existing;
        }

        db.StudyUnits.Add(candidate);
        try
        {
            await db.SaveChangesAsync(cancellationToken);
            return candidate;
        }
        catch (DbUpdateException ex) when (DbErrors.IsUniqueViolation(ex))
        {
            db.Entry(candidate).State = EntityState.Detached;
            return await db.StudyUnits.SingleAsync(u => u.NormalizedKey == candidate.NormalizedKey, cancellationToken);
        }
    }
}
