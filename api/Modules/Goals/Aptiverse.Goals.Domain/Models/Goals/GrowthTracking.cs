using Aptiverse.Api.Data.Abstractions;
using Aptiverse.Goals.Domain.Models.External.Identity;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Goals.Domain.Models.Goals
{
    [Index(nameof(StudentId))]
    // Natural key for the AI growth upsert (ai/app/data/sinks.py): one row per
    // (student, tracking date). UNIQUE so the Python ON CONFLICT path binds.
    [Index(nameof(StudentId), nameof(TrackingDate), IsUnique = true)]
    public class GrowthTracking : IEntityTimestamps
    {
        public long Id { get; set; }
        public long StudentId { get; set; }
        public DateTime TrackingDate { get; set; }
        public decimal AcademicGrowth { get; set; }
        public decimal StudyHabitGrowth { get; set; }
        public decimal EmotionalGrowth { get; set; }
        public decimal OverallGrowth { get; set; }
        public string GrowthFactors { get; set; }
        public string AreasForImprovement { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public virtual Student Student { get; set; }
    }
}
