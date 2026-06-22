using Aptiverse.Api.Data.Abstractions;
using Aptiverse.Goals.Domain.Models.External.Identity;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Goals.Domain.Models.Goals
{
    [Index(nameof(StudentId))]
    [Index(nameof(CurrentRank))]
    public class StudentPoints : IEntityTimestamps
    {
        public long Id { get; set; }
        public long StudentId { get; set; }
        public int TotalPoints { get; set; }
        public int AvailablePoints { get; set; }
        public int UsedPoints { get; set; }
        public int Level { get; set; } = 1;
        public string CurrentRank { get; set; } = "Beginner";
        public DateTime LastUpdated { get; set; } = DateTime.UtcNow;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public virtual Student Student { get; set; }
        public virtual ICollection<PointsTransaction> Transactions { get; set; }
    }
}
