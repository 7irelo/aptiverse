namespace Aptiverse.Moderation.Domain.Models.Moderation
{
    public class ContentReport
    {
        public long Id { get; set; }
        public string ReporterUserId { get; set; }
        public string ReportedUserId { get; set; }
        public string ContentType { get; set; }
        public string ContentId { get; set; }
        public string ContentSnapshot { get; set; }
        public string Reason { get; set; }
        public string Description { get; set; }
        public string Status { get; set; } = "Pending";
        public string Severity { get; set; } = "Medium";
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public virtual ICollection<ModerationAction> Actions { get; set; }
    }
}