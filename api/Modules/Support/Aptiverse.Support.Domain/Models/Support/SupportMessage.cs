using Aptiverse.Api.Data.Abstractions;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Support.Domain.Models.Support
{
    // A single message in a ticket thread. Read back ordered by CreatedAt
    // and always filtered by the owning TicketId, so that FK is the hot
    // index. SenderUserId is indexed for "messages by this agent" lookups.
    [Index(nameof(TicketId))]
    [Index(nameof(SenderUserId))]
    [Index(nameof(TicketId), nameof(CreatedAt))]
    public class SupportMessage : IEntityTimestamps
    {
        public long Id { get; set; }
        public long TicketId { get; set; }
        public string SenderUserId { get; set; }
        // Identity role string (e.g. the JWT role of the sender). Left as
        // free-text rather than an enum because it mirrors the auth role
        // catalog, which is owned outside this module and can grow without
        // a Support migration.
        public string SenderRole { get; set; }
        public string Content { get; set; }
        public string AttachmentUrls { get; set; }
        public bool IsInternal { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public virtual SupportTicket Ticket { get; set; }
    }
}
