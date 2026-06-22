namespace Aptiverse.Support.Domain.Models.Support
{
    public class SupportTicket
    {
        public long Id { get; set; }
        public long StudentId { get; set; }
        public long CategoryId { get; set; }
        public string Subject { get; set; }
        public string Description { get; set; }
        public string Priority { get; set; } = "Medium";
        public string Status { get; set; } = "Open";
        public string AssignedToUserId { get; set; }
        public string Channel { get; set; } = "Web";
        public DateTime? ResolvedAt { get; set; }
        public DateTime? ClosedAt { get; set; }
        public string ResolutionNotes { get; set; }
        public int SatisfactionRating { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public virtual SupportCategory Category { get; set; }
        public virtual ICollection<SupportMessage> Messages { get; set; }
    }
}