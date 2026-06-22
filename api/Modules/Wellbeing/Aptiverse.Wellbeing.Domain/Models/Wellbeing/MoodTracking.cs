using Aptiverse.Api.Data.Abstractions;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Wellbeing.Domain.Models.Wellbeing
{
    // A student's point-in-time mood check-in. Transactional and editable
    // (MoodTrackingService.UpdateAsync), so it opts into IEntityTimestamps.
    // Previously had only CreatedAt; UpdatedAt is added (additive column) so
    // the interceptor can stamp edits.
    [Index(nameof(StudentId))]
    [Index(nameof(StudentId), nameof(TrackedAt))]
    [Index(nameof(TrackedAt))]
    public class MoodTracking : IEntityTimestamps
    {
        public long Id { get; set; }
        public long StudentId { get; set; }
        // Free-text mood/level labels below are left as string: no documented
        // closed value set exists in the module (DTOs/services pass them
        // through verbatim), so enum-string compatibility with stored values
        // cannot be guaranteed.
        public string Mood { get; set; }
        public int MoodScore { get; set; }
        public string EnergyLevel { get; set; }
        public string StressLevel { get; set; }
        public string SleepQuality { get; set; }
        public string Triggers { get; set; }
        public string CopingStrategies { get; set; }
        public string Notes { get; set; }
        public DateTime TrackedAt { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
