namespace Aptiverse.Calendar.Domain.Models.Calendar
{
    public class Reminder
    {
        public long Id { get; set; }
        public long CalendarEventId { get; set; }
        public int MinutesBefore { get; set; }
        public string ReminderType { get; set; } = "Notification";
        public bool IsSent { get; set; }
        public DateTime? SentAt { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public virtual CalendarEvent CalendarEvent { get; set; }
    }
}