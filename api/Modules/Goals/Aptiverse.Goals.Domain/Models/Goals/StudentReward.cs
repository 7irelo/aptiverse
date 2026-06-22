using Aptiverse.Api.Data.Abstractions;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Goals.Domain.Models.Goals
{
    [Index(nameof(StudentId))]
    [Index(nameof(RewardId))]
    [Index(nameof(GoalId))]
    [Index(nameof(Status))]
    [Index(nameof(StudentId), nameof(Status))]
    public class StudentReward : IEntityTimestamps
    {
        public long Id { get; set; }

        // Recipient — identity.users.id. Bare string user-id with no enforced FK.
        public string StudentId { get; set; } = "";
        public long RewardId { get; set; }
        public long? GoalId { get; set; }
        public DateTime EarnedAt { get; set; }
        public DateTime? ExpiresAt { get; set; }
        public string Status { get; set; }
        public int PointsEarned { get; set; }
        public string AchievementContext { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public virtual Reward Reward { get; set; }
        public virtual Goal Goal { get; set; }
    }
}
