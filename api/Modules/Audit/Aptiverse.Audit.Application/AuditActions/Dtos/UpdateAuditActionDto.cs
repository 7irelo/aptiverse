namespace Aptiverse.Audit.Application.AuditActions.Dtos
{
    public record UpdateAuditActionDto
    {
        public string Name { get; init; }
        public string Description { get; init; }
        public string Category { get; init; }
        public string Severity { get; init; }
        public bool IsActive { get; init; }
    }
}
