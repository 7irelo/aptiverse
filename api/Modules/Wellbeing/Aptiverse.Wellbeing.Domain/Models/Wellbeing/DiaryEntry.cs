using Aptiverse.Api.Data.Abstractions;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Wellbeing.Domain.Models.Wellbeing
{
    // A student's journal entry. Transactional (created + edited via the
    // diary service), so it opts into IEntityTimestamps for audit stamping.
    [Index(nameof(StudentId))]
    [Index(nameof(StudentId), nameof(EntryDate))]
    [Index(nameof(EntryType))]
    [Index(nameof(EntryDate))]
    [Index(nameof(NeedsFollowUp))]
    public class DiaryEntry : IEntityTimestamps
    {
        public long Id { get; set; }
        public long StudentId { get; set; }
        public string Title { get; set; }
        public string Content { get; set; }
        // Free-text mood label. Left as string: no documented closed value
        // set exists in the module (DTOs/services pass it through verbatim),
        // so enum-string compatibility with stored values cannot be guaranteed.
        public string Mood { get; set; }
        public int MoodIntensity { get; set; }
        // Free-text entry type. Left as string for the same reason as Mood:
        // no documented value set to map enum member names against.
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
