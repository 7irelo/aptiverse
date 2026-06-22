namespace Aptiverse.Calendar.Application.Reminders.Dtos
{
    public record ReminderDto
    {
        public long Id { get; init; }
        public long CalendarEventId { get; init; }
        public int MinutesBefore { get; init; }
        public string ReminderType { get; init; }
        public bool IsSent { get; init; }
        public DateTime? SentAt { get; init; }
        public DateTime CreatedAt { get; init; }
    }
}
