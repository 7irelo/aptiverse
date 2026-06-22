using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Calendar.Domain.Models.Calendar
{
    [Index(nameof(StudentId))]
    [Index(nameof(StudentId), nameof(StartTime))]
    [Index(nameof(StudentId), nameof(Status))]
    [Index(nameof(EventType))]
    [Index(nameof(Status))]
    [Index(nameof(StartTime))]
    [Index(nameof(RelatedEntityType), nameof(RelatedEntityId))]
    public class CalendarEvent
    {
        public long Id { get; set; }
        public string StudentId { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string EventType { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public bool IsAllDay { get; set; }
        public string Location { get; set; }
        public string RecurrenceRule { get; set; }
        public string Color { get; set; }
        public string Status { get; set; } = "Scheduled";
        public long? RelatedEntityId { get; set; }
        public string RelatedEntityType { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public virtual ICollection<Reminder> Reminders { get; set; }
    }
}