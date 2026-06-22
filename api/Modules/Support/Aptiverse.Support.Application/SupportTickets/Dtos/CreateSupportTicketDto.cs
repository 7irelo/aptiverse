namespace Aptiverse.Support.Application.SupportTickets.Dtos
{
    public record CreateSupportTicketDto
    {
        public long StudentId { get; init; }
        public long CategoryId { get; init; }
        public string Subject { get; init; }
        public string Description { get; init; }
        public string Priority { get; init; }
        public string Status { get; init; }
        public string AssignedToUserId { get; init; }
        public string Channel { get; init; }
        public DateTime? ResolvedAt { get; init; }
        public DateTime? ClosedAt { get; init; }
        public string ResolutionNotes { get; init; }
        public int SatisfactionRating { get; init; }
    }
}
