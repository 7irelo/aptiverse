using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Audit.Domain.Models.Audit
{
    // Append-only audit trail row. Written once when an auditable
    // action occurs and read back by admin trail views, never updated.
    // Intentionally does NOT adopt IEntityTimestamps (it is immutable;
    // CreatedAt is the only time it cares about and is set on insert).
    //
    // Indexed for the common query shapes: by user, by action (FK), by
    // the (EntityType, EntityId) target of the change, by correlation
    // id for request tracing, and by service for per-service filtering.
    [Index(nameof(ActionId))]
    [Index(nameof(UserId), nameof(CreatedAt))]
    [Index(nameof(EntityType), nameof(EntityId))]
    [Index(nameof(CorrelationId))]
    [Index(nameof(ServiceName))]
    public class AuditLog
    {
        public long Id { get; set; }
        public string UserId { get; set; }
        public string UserEmail { get; set; }
        public string UserRole { get; set; }
        public long ActionId { get; set; }
        public string EntityType { get; set; }
        public string EntityId { get; set; }
        public string ServiceName { get; set; }
        public string OldValues { get; set; }
        public string NewValues { get; set; }
        public string IpAddress { get; set; }
        public string UserAgent { get; set; }
        public string CorrelationId { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public virtual AuditAction Action { get; set; }
    }
}
