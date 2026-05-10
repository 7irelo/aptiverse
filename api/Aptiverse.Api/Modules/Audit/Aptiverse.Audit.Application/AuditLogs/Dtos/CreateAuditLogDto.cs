namespace Aptiverse.Audit.Application.AuditLogs.Dtos
{
    public record CreateAuditLogDto
    {
        public string UserId { get; init; }
        public string UserEmail { get; init; }
        public string UserRole { get; init; }
        public long ActionId { get; init; }
        public string EntityType { get; init; }
        public string EntityId { get; init; }
        public string ServiceName { get; init; }
        public string OldValues { get; init; }
        public string NewValues { get; init; }
        public string IpAddress { get; init; }
        public string UserAgent { get; init; }
        public string CorrelationId { get; init; }
    }
}
