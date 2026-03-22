namespace Aptiverse.Calendar.Application.Reminders.Dtos
{
    public record UpdateReminderDto
    {
        public long CalendarEventId { get; init; }
        public int MinutesBefore { get; init; }
        public string ReminderType { get; init; }
        public bool IsSent { get; init; }
        public DateTime? SentAt { get; init; }
    }
}
