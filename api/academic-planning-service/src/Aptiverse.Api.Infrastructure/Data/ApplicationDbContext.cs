using Aptiverse.AcademicPlanning.Domain.Models.AcademicPlanning;
using Aptiverse.AcademicPlanning.Domain.Models.External.Identity;
using Aptiverse.AcademicPlanning.Domain.Models.External.Insights;
using Aptiverse.AcademicPlanning.Domain.Models.External.Mastery;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.AcademicPlanning.Infrastructure.Data
{
    public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : DbContext(options)
    {
        public DbSet<Subject> Subjects { get; set; }
        public DbSet<StudentSubject> StudentSubjects { get; set; }
        public DbSet<Topic> Topics { get; set; }
        public DbSet<StudentSubjectTopic> StudentSubjectTopics { get; set; }
        public DbSet<Assessment> Assessments { get; set; }
        public DbSet<AssessmentBreakdown> AssessmentBreakdowns { get; set; }
        public DbSet<StudySession> StudySessions { get; set; }
        public DbSet<WeeklyStudyHour> WeeklyStudyHours { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            ConfigureGhostModels(modelBuilder);
            ConfigureStudentSchema(modelBuilder);
            ConfigureManyToManyRelationships(modelBuilder);
        }

        private static void ConfigureGhostModels(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Student>(entity =>
            {
                entity.ToTable("Students", "Identity", t => t.ExcludeFromMigrations());
                entity.HasKey(u => u.Id);
            });
        }

        private static void ConfigureStudentSchema(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Subject>(entity => entity.ToTable("Subjects", "AcademicPlanning"));
            modelBuilder.Entity<Topic>(entity => entity.ToTable("Topics", "AcademicPlanning"));
            modelBuilder.Entity<Assessment>(entity => entity.ToTable("Assessments", "AcademicPlanning"));
            modelBuilder.Entity<StudySession>(entity => entity.ToTable("StudySessions", "AcademicPlanning"));
            modelBuilder.Entity<StudentSubject>(entity => entity.ToTable("StudentSubjects", "AcademicPlanning"));
            modelBuilder.Entity<StudentSubjectAnalytics>(entity => entity.ToTable("StudentSubjectAnalytics", "AcademicPlanning"));
            modelBuilder.Entity<StudentSubjectTopic>(entity => entity.ToTable("StudentSubjectTopics", "AcademicPlanning"));
            modelBuilder.Entity<AssessmentBreakdown>(entity => entity.ToTable("AssessmentBreakdowns", "AcademicPlanning"));
            modelBuilder.Entity<WeeklyStudyHour>(entity => entity.ToTable("WeeklyStudyHours", "AcademicPlanning"));
            modelBuilder.Entity<ImprovementTip>(entity => entity.ToTable("ImprovementTips", "AcademicPlanning"));
            modelBuilder.Entity<KnowledgeGap>(entity => entity.ToTable("KnowledgeGaps", "AcademicPlanning"));
        }

        private static void ConfigureManyToManyRelationships(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<StudentSubjectTopic>(entity =>
            {
                entity.HasKey(sst => new { sst.StudentSubjectId, sst.TopicId });
            });
        }
    }
}