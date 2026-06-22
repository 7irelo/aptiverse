namespace Aptiverse.Audit.Domain.Models.Audit
{
    public class AuditAction
    {
        public long Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string Category { get; set; }
        public string Severity { get; set; } = "Info";
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public virtual ICollection<AuditLog> AuditLogs { get; set; }
    }
}