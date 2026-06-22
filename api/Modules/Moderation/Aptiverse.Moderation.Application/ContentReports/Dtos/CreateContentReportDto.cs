namespace Aptiverse.Moderation.Application.ContentReports.Dtos
{
    public record CreateContentReportDto
    {
        public string ReporterUserId { get; init; }
        public string ReportedUserId { get; init; }
        public string ContentType { get; init; }
        public string ContentId { get; init; }
        public string ContentSnapshot { get; init; }
        public string Reason { get; init; }
        public string Description { get; init; }
        public string Status { get; init; }
        public string Severity { get; init; }
    }
}
