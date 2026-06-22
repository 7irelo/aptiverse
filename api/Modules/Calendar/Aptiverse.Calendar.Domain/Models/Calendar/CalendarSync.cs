namespace Aptiverse.Calendar.Domain.Models.Calendar
{
    public class CalendarSync
    {
        public long Id { get; set; }
        public long StudentId { get; set; }
        public string Provider { get; set; }
        public string ExternalCalendarId { get; set; }
        public string SyncToken { get; set; }
        public DateTime LastSyncedAt { get; set; }
        public string SyncStatus { get; set; } = "Active";
        public string SyncDirection { get; set; } = "Both";
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}