// OPTIONAL convenience base class for entities.
//
// Existing entities do NOT need to derive from this — adoption is purely
// incremental. Deriving from EntityBase<TId> gives an entity a typed Id plus
// the IEntityTimestamps contract for free, which the AuditableEntityInterceptor
// then stamps automatically. An entity that prefers to keep its own shape can
// instead just implement IEntityTimestamps / ISoftDelete directly; both paths
// are picked up identically by the interceptor and the model conventions.

namespace Aptiverse.Api.Data.Abstractions
{
    public abstract class EntityBase<TId> : IEntityTimestamps
    {
        public TId Id { get; set; } = default!;

        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
