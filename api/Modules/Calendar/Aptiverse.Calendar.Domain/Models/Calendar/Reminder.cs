using Aptiverse.Api.Data.Abstractions;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Calendar.Domain.Models.Calendar
{
    [Index(nameof(CalendarEventId))]
    [Index(nameof(ReminderType))]
    [Index(nameof(IsSent))]
    public class Reminder : IEntityTimestamps
    {
        public long Id { get; set; }
        public long CalendarEventId { get; set; }
        public int MinutesBefore { get; set; }
        public string ReminderType { get; set; } = "Notification";
        public bool IsSent { get; set; }
        public DateTime? SentAt { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public virtual CalendarEvent CalendarEvent { get; set; }
    }
}