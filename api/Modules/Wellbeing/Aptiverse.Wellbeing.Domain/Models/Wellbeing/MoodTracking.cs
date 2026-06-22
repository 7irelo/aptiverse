namespace Aptiverse.Wellbeing.Domain.Models.Wellbeing
{
    public class MoodTracking
    {
        public long Id { get; set; }
        public long StudentId { get; set; }
        public string Mood { get; set; }
        public int MoodScore { get; set; }
        public string EnergyLevel { get; set; }
        public string StressLevel { get; set; }
        public string SleepQuality { get; set; }
        public string Triggers { get; set; }
        public string CopingStrategies { get; set; }
        public string Notes { get; set; }
        public DateTime TrackedAt { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}