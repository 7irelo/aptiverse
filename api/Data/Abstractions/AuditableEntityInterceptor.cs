// SaveChanges interceptor that enforces two cross-cutting data-layer policies
// uniformly across every entity, with zero per-entity wiring:
//
//   1. Timestamps (IEntityTimestamps): on insert, stamps CreatedAt + UpdatedAt
//      to DateTime.UtcNow. On update, stamps UpdatedAt to DateTime.UtcNow
//      (CreatedAt is left untouched). All values are UTC.
//
//   2. Soft delete (ISoftDelete): a hard delete (EntityState.Deleted) is
//      rewritten into an update — IsDeleted = true, DeletedAt = UtcNow, and the
//      entry's state is flipped to Modified so the row is preserved. Combined
//      with the global query filter installed in OnModelCreating, the row then
//      simply disappears from normal reads.
//
// Discovery is reflective via the change tracker, so any entity that later
// adopts these interfaces is covered automatically — no registration needed.
//
// Registered against the DbContext in InfrastructureRegistrations and the
// design-time factory.

using Aptiverse.Api.Data.Abstractions;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Diagnostics;

namespace Aptiverse.Api.Data.Abstractions
{
    public sealed class AuditableEntityInterceptor : SaveChangesInterceptor
    {
        public override InterceptionResult<int> SavingChanges(
            DbContextEventData eventData,
            InterceptionResult<int> result)
        {
            ApplyAuditRules(eventData.Context);
            return base.SavingChanges(eventData, result);
        }

        public override ValueTask<InterceptionResult<int>> SavingChangesAsync(
            DbContextEventData eventData,
            InterceptionResult<int> result,
            CancellationToken cancellationToken = default)
        {
            ApplyAuditRules(eventData.Context);
            return base.SavingChangesAsync(eventData, result, cancellationToken);
        }

        private static void ApplyAuditRules(DbContext? context)
        {
            if (context is null) return;

            var now = DateTime.UtcNow;

            foreach (var entry in context.ChangeTracker.Entries())
            {
                // Soft-delete rewrite must run before timestamp stamping so the
                // converted-to-Modified entry also gets its UpdatedAt bumped.
                if (entry is { State: EntityState.Deleted, Entity: ISoftDelete softDelete })
                {
                    entry.State = EntityState.Modified;
                    softDelete.IsDeleted = true;
                    softDelete.DeletedAt = now;
                }

                if (entry.Entity is IEntityTimestamps timestamps)
                {
                    switch (entry.State)
                    {
                        case EntityState.Added:
                            timestamps.CreatedAt = now;
                            timestamps.UpdatedAt = now;
                            break;
                        case EntityState.Modified:
                            timestamps.UpdatedAt = now;
                            // Never let an UPDATE overwrite the original
                            // CreatedAt, even if the caller mutated it.
                            entry.Property(nameof(IEntityTimestamps.CreatedAt)).IsModified = false;
                            break;
                    }
                }
            }
        }
    }
}
