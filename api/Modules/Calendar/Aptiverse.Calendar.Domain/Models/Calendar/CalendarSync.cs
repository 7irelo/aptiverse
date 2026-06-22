using Aptiverse.Api.Data.Abstractions;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Calendar.Domain.Models.Calendar
{
    [Index(nameof(StudentId))]
    [Index(nameof(StudentId), nameof(Provider))]
    [Index(nameof(Provider))]
    [Index(nameof(SyncStatus))]
    public class CalendarSync : IEntityTimestamps
    {
        public long Id { get; set; }
        public string StudentId { get; set; }
        public string Provider { get; set; }
        public string ExternalCalendarId { get; set; }
        public string SyncToken { get; set; }
        public DateTime LastSyncedAt { get; set; }
        public string SyncStatus { get; set; } = "Active";
        public string SyncDirection { get; set; } = "Both";
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}