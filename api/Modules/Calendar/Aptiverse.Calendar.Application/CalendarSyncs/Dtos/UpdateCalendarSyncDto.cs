namespace Aptiverse.Calendar.Application.CalendarSyncs.Dtos
{
    public record UpdateCalendarSyncDto
    {
        public long StudentId { get; init; }
        public string Provider { get; init; }
        public string ExternalCalendarId { get; init; }
        public string SyncToken { get; init; }
        public DateTime LastSyncedAt { get; init; }
        public string SyncStatus { get; init; }
        public string SyncDirection { get; init; }
    }
}
