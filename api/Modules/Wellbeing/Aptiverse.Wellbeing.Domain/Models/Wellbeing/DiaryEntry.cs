namespace Aptiverse.Wellbeing.Domain.Models.Wellbeing
{
    public class DiaryEntry
    {
        public long Id { get; set; }
        public long StudentId { get; set; }
        public string Title { get; set; }
        public string Content { get; set; }
        public string Mood { get; set; }
        public int MoodIntensity { get; set; }
        public string EntryType { get; set; }
        public string Tags { get; set; }
        public bool IsPrivate { get; set; }
        public DateTime EntryDate { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        public string SentimentAnalysis { get; set; }
        public double SentimentScore { get; set; }
        public string KeyThemes { get; set; }
        public string AiInsights { get; set; }
        public bool NeedsFollowUp { get; set; }
        public string FollowUpAction { get; set; }
    }
}