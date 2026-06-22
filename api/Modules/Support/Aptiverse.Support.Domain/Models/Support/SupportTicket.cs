using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Support.Domain.Models.Support
{
    // Closed value sets for a support ticket. The foundation EF convention
    // persists enums AS STRINGS, so the DB columns stay text and the stored
    // values are the PascalCase enum member names below — which match the
    // values this entity already wrote (defaults "Open" / "Medium" / "Web").
    public enum SupportTicketStatus
    {
        Open,
        Pending,
        InProgress,
        Resolved,
        Closed
    }

    public enum SupportTicketPriority
    {
        Low,
        Medium,
        High,
        Urgent
    }

    public enum SupportChannel
    {
        Web,
        Email,
        Phone,
        Chat,
        Mobile
    }

    // Frequently filtered by the agent queue (Status), by owner
    // (StudentId, AssignedToUserId), and by category. Composite
    // (StudentId, Status) matches the "my open tickets" query shape.
    [Index(nameof(StudentId))]
    [Index(nameof(CategoryId))]
    [Index(nameof(AssignedToUserId))]
    [Index(nameof(Status))]
    [Index(nameof(Priority))]
    [Index(nameof(StudentId), nameof(Status))]
    public class SupportTicket
    {
        public long Id { get; set; }
        public long StudentId { get; set; }
        public long CategoryId { get; set; }
        public string Subject { get; set; }
        public string Description { get; set; }
        public SupportTicketPriority Priority { get; set; } = SupportTicketPriority.Medium;
        public SupportTicketStatus Status { get; set; } = SupportTicketStatus.Open;
        public string AssignedToUserId { get; set; }
        public SupportChannel Channel { get; set; } = SupportChannel.Web;
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
