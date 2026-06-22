namespace Aptiverse.Goals.Domain.Models.Goals
{
    public class PointsTransaction
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

        public virtual StudentPoints StudentPoints { get; set; }
        public virtual Goal RelatedGoal { get; set; }
        public virtual Reward RelatedReward { get; set; }
    }
}
