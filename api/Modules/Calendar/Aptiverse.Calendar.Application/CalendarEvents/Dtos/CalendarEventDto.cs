namespace Aptiverse.Calendar.Application.CalendarEvents.Dtos
{
    public record CalendarEventDto
    {
        public long Id { get; init; }
        public long StudentId { get; init; }
        public string Title { get; init; }
        public string Description { get; init; }
        public string EventType { get; init; }
        public DateTime StartTime { get; init; }
        public DateTime EndTime { get; init; }
        public bool IsAllDay { get; init; }
        public string Location { get; init; }
        public string RecurrenceRule { get; init; }
        public string Color { get; init; }
        public string Status { get; init; }
        public long? RelatedEntityId { get; init; }
        public string RelatedEntityType { get; init; }
        public DateTime CreatedAt { get; init; }
        public DateTime UpdatedAt { get; init; }
    }
}
