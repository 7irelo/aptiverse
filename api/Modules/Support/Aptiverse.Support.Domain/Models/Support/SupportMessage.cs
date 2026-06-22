namespace Aptiverse.Support.Domain.Models.Support
{
    public class SupportMessage
    {
        public long Id { get; set; }
        public long TicketId { get; set; }
        public string SenderUserId { get; set; }
        public string SenderRole { get; set; }
        public string Content { get; set; }
        public string AttachmentUrls { get; set; }
        public bool IsInternal { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public virtual SupportTicket Ticket { get; set; }
    }
}