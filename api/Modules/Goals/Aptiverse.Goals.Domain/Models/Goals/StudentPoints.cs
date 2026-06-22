using Aptiverse.Goals.Domain.Models.External.Identity;

namespace Aptiverse.Goals.Domain.Models.Goals
{
    public class StudentPoints
    {
        public long Id { get; set; }
        public long StudentId { get; set; }
        public int TotalPoints { get; set; }
        public int AvailablePoints { get; set; }
        public int UsedPoints { get; set; }
        public int Level { get; set; } = 1;
        public string CurrentRank { get; set; } = "Beginner";
        public DateTime LastUpdated { get; set; } = DateTime.UtcNow;

        public virtual Student Student { get; set; }
        public virtual ICollection<PointsTransaction> Transactions { get; set; }
    }
}
