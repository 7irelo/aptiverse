namespace Aptiverse.Wellbeing.Application.MoodTrackings.Dtos
{
    public record MoodTrackingDto
    {
        public long Id { get; init; }
        public string StudentId { get; init; }
        public string Mood { get; init; }
        public int MoodScore { get; init; }
        public string EnergyLevel { get; init; }
        public string StressLevel { get; init; }
        public string SleepQuality { get; init; }
        public string Triggers { get; init; }
        public string CopingStrategies { get; init; }
        public string Notes { get; init; }
        public DateTime TrackedAt { get; init; }
        public DateTime CreatedAt { get; init; }
    }
}
