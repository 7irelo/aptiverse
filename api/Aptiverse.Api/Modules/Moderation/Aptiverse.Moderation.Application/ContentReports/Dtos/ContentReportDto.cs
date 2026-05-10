namespace Aptiverse.Moderation.Application.ContentReports.Dtos
{
    public record ContentReportDto
    {
        public long Id { get; init; }
        public string ReporterUserId { get; init; }
        public string ReportedUserId { get; init; }
        public string ContentType { get; init; }
        public string ContentId { get; init; }
        public string ContentSnapshot { get; init; }
        public string Reason { get; init; }
        public string Description { get; init; }
        public string Status { get; init; }
        public string Severity { get; init; }
        public DateTime CreatedAt { get; init; }
        public DateTime UpdatedAt { get; init; }
    }
}
