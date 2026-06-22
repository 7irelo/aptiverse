// Shared-kernel marker for entities that track creation / update timestamps.
//
// Adoption is OPTIONAL and INCREMENTAL: an entity opts in simply by
// implementing this interface (or deriving from EntityBase<TId>). Once it
// does, the AuditableEntityInterceptor stamps CreatedAt on insert and
// UpdatedAt on insert + every update — both in UTC. No per-entity wiring
// required; the interceptor discovers implementers reflectively at SaveChanges.

namespace Aptiverse.Api.Data.Abstractions
{
    public interface IEntityTimestamps
    {
        DateTime CreatedAt { get; set; }
        DateTime UpdatedAt { get; set; }
    }
}
