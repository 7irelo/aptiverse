namespace Aptiverse.Moderation.Domain.Models.Moderation
{
    public class ModerationAction
    {
        public long Id { get; set; }
        public long ContentReportId { get; set; }
        public string ModeratorUserId { get; set; }
        public string ActionType { get; set; }
        public string Reason { get; set; }
        public string Notes { get; set; }
        public bool IsAutomated { get; set; }
        public DateTime? ExpiresAt { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public virtual ContentReport ContentReport { get; set; }
    }
}