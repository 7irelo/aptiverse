using Aptiverse.Api.Data.Abstractions;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Goals.Domain.Models.Goals
{
    [Index(nameof(StudentPointsId))]
    [Index(nameof(RelatedGoalId))]
    [Index(nameof(RelatedRewardId))]
    [Index(nameof(TransactionType))]
    [Index(nameof(Source))]
    [Index(nameof(StudentPointsId), nameof(TransactionType))]
    public class PointsTransaction : IEntityTimestamps
    {
        public long Id { get; set; }
        public long StudentPointsId { get; set; }
        public int Points { get; set; }
        public string TransactionType { get; set; }
        public string Source { get; set; }
        public long? RelatedGoalId { get; set; }
        public long? RelatedRewardId { get; set; }
        public string Description { get; set; }
        public DateTime TransactionDate { get; set; } = DateTime.UtcNow;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public virtual StudentPoints StudentPoints { get; set; }
        public virtual Goal RelatedGoal { get; set; }
        public virtual Reward RelatedReward { get; set; }
    }
}
