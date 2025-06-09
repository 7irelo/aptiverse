using Aptiverse.Goals.Domain.Models.External.AcademicPlanning;
using Aptiverse.Goals.Domain.Models.External.Identity;

namespace Aptiverse.Goals.Domain.Models.Goals
{
    public class Goal
    {
        public long Id { get; set; }
        public long StudentId { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string GoalType { get; set; }
        public string SubjectId { get; set; }
        public decimal TargetValue { get; set; }
        public decimal CurrentValue { get; set; }
        public string Unit { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime TargetDate { get; set; }
        public string Status { get; set; }
        public int Priority { get; set; }
        public int DifficultyWeight { get; set; }
        public decimal ProgressPercentage => TargetValue > 0 ? (CurrentValue / TargetValue) * 100 : 0;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public virtual Student Student { get; set; }
        public virtual Subject Subject { get; set; }
        public virtual ICollection<GoalMilestone> Milestones { get; set; }
        public virtual ICollection<Reward> PotentialRewards { get; set; }
    }
}
