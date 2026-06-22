using Aptiverse.Goals.Domain.Models.External.Identity;

namespace Aptiverse.Goals.Domain.Models.Goals
{
    public class GrowthTracking
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

        public virtual Student Student { get; set; }
    }
}
