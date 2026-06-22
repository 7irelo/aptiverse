using Aptiverse.Api.Data.Abstractions;
using Aptiverse.Mastery.Domain.Models.External.AcademicPlanning;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Mastery.Domain.Models.Mastery
{
    // Transactional: created/updated via StudentSubjectAnalyticsService.
    // Implements IEntityTimestamps for automatic audit stamping (additive).
    [Index(nameof(StudentSubjectId))]
    [Index(nameof(TopicId))]
    // Natural key for the AI subject-analytics upsert (ai/app/data/sinks.py):
    // one row per (student-subject, topic). UNIQUE so ON CONFLICT binds.
    [Index(nameof(StudentSubjectId), nameof(TopicId), IsUnique = true)]
    public class StudentSubjectAnalytics : IEntityTimestamps
    {
        public long Id { get; set; }
        public long StudentSubjectId { get; set; }
        public long TopicId { get; set; }
        public int MorningPercentage { get; set; }
        public int AfternoonPercentage { get; set; }
        public int EveningPercentage { get; set; }
        public int Consistency { get; set; }
        public string PreferredDays { get; set; }
        public int SessionLength { get; set; }
        public int ClassesAttended { get; set; }
        public int TotalClasses { get; set; }
        public double AttendanceRate { get; set; }
        public int TextbookUsage { get; set; }
        public int VideoTutorials { get; set; }
        public int PracticeProblems { get; set; }
        public int GroupStudy { get; set; }
        public int OnlinePlatforms { get; set; }
        public int QuestionsAsked { get; set; }
        public int ParticipationRate { get; set; }
        public int ResourceDownloads { get; set; }
        public int ForumActivity { get; set; }
        public double WorkloadThisWeek { get; set; }
        public double StressLevel { get; set; }
        public double SleepQuality { get; set; }
        public double MotivationLevel { get; set; }
        public int Importance { get; set; }
        public double InterestLevel { get; set; }
        // Closed-set conceptually but kept as string: exposed as a string on
        // the DTOs and ReverseMapped by AutoMapper; converting to an enum
        // would require out-of-module Application changes. Stays text.
        public string Alignment { get; set; }

        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        public virtual StudentSubject StudentSubject { get; set; }
        public virtual StudentSubjectTopic Topic { get; set; }
    }
}
