using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Moderation.Domain.Models.Moderation
{
    // Moderation queue rows are filtered by reporter/reported user, by
    // the content being reported, and by workflow status/severity. The
    // (Status, Severity) composite matches the common queue view that
    // lists open reports ordered by how serious they are.
    [Index(nameof(ReporterUserId))]
    [Index(nameof(ReportedUserId))]
    [Index(nameof(ContentType), nameof(ContentId))]
    [Index(nameof(Status))]
    [Index(nameof(Severity))]
    [Index(nameof(Status), nameof(Severity))]
    public class ContentReport
    {
        public long Id { get; set; }
        public string ReporterUserId { get; set; }
        public string ReportedUserId { get; set; }

        // Cross-module reference to the kind of content reported
        // (Post, Comment, Message, ...). Open/extensible across modules,
        // so kept as free-text string.
        public string ContentType { get; set; }

        public string ContentId { get; set; }
        public string ContentSnapshot { get; set; }

        // Free-text-ish reason supplied by the reporter. Kept as string.
        public string Reason { get; set; }

        public string Description { get; set; }

        // Workflow state. Persisted as text; member names match the
        // stored "Pending"/"Reviewing"/"Resolved"/"Dismissed" values.
        public ModerationReportStatus Status { get; set; } = ModerationReportStatus.Pending;

        // Persisted as text; member names match "Low"/"Medium"/"High"/"Critical".
        public ModerationSeverity Severity { get; set; } = ModerationSeverity.Medium;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public virtual ICollection<ModerationAction> Actions { get; set; }
    }
}
