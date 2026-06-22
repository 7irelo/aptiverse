// Shared-kernel marker for entities that should be soft-deleted rather than
// physically removed.
//
// Adoption is OPTIONAL and INCREMENTAL. When an entity implements this
// interface two things happen automatically:
//   1. The AuditableEntityInterceptor rewrites any hard delete into a soft
//      delete (sets IsDeleted = true + DeletedAt = UtcNow, and re-marks the
//      tracked entry as Modified instead of Deleted).
//   2. ApplicationDbContext.OnModelCreating installs a global query filter
//      `e => !e.IsDeleted`, so soft-deleted rows are excluded from queries by
//      default. Use IgnoreQueryFilters() to read them back.
//
// IMPORTANT: This is additive. It does NOT create or drop columns on its own —
// the per-module agents add the `IsDeleted` / `DeletedAt` properties (and the
// migration) when an entity adopts the interface.

namespace Aptiverse.Api.Data.Abstractions
{
    public interface ISoftDelete
    {
        bool IsDeleted { get; set; }
        DateTime? DeletedAt { get; set; }
    }
}
