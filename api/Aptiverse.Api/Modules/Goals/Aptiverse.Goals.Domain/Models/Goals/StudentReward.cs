using Aptiverse.Goals.Domain.Models.External.Identity;

namespace Aptiverse.Goals.Domain.Models.Goals
{
    public class StudentReward
    {
        public long Id { get; set; }
        public long StudentId { get; set; }
        public long RewardId { get; set; }
        public long? GoalId { get; set; }
        public DateTime EarnedAt { get; set; }
        public DateTime? ExpiresAt { get; set; }
        public string Status { get; set; }
        public int PointsEarned { get; set; }
        public string AchievementContext { get; set; }

        public virtual Student Student { get; set; }
        public virtual Reward Reward { get; set; }
        public virtual Goal Goal { get; set; }
    }
}
