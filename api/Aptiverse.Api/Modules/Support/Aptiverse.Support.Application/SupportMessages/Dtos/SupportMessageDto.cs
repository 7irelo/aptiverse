namespace Aptiverse.Support.Application.SupportMessages.Dtos
{
    public record SupportMessageDto
    {
        public long Id { get; init; }
        public long TicketId { get; init; }
        public string SenderUserId { get; init; }
        public string SenderRole { get; init; }
        public string Content { get; init; }
        public string AttachmentUrls { get; init; }
        public bool IsInternal { get; init; }
        public DateTime CreatedAt { get; init; }
    }
}
