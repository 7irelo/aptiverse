using Aptiverse.Goals.Domain.Models.External.Entitlements;

namespace Aptiverse.Goals.Domain.Models.Goals
{
    public class Reward
    {
        public long Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string RewardType { get; set; }
        public int PointsCost { get; set; }
        public int DifficultyTier { get; set; }
        public bool IsActive { get; set; } = true;
        public int StockQuantity { get; set; } = -1;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public virtual ICollection<RewardFeature> RewardFeatures { get; set; }
        public virtual ICollection<StudentReward> StudentRewards { get; set; }
        public virtual ICollection<Goal> ApplicableGoals { get; set; }
    }
}
