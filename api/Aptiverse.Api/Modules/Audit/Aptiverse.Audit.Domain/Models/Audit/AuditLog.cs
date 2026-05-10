namespace Aptiverse.Audit.Domain.Models.Audit
{
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