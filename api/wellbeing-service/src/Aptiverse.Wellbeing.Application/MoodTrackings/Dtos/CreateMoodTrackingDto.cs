namespace Aptiverse.Wellbeing.Application.MoodTrackings.Dtos
{
    public record CreateMoodTrackingDto
    {
        public long StudentId { get; init; }
        public string Mood { get; init; }
        public int MoodScore { get; init; }
        public string EnergyLevel { get; init; }
        public string StressLevel { get; init; }
        public string SleepQuality { get; init; }
        public string Triggers { get; init; }
        public string CopingStrategies { get; init; }
        public string Notes { get; init; }
        public DateTime TrackedAt { get; init; }
    }
}
