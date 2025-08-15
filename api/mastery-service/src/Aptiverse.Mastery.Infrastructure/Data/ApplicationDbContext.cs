using Aptiverse.Mastery.Domain.Models.External.AcademicPlanning;
using Aptiverse.Mastery.Domain.Models.Mastery;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Mastery.Infrastructure.Data
{
    public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : DbContext(options)
    {
        public DbSet<StudentSubjectAnalytics> StudentSubjectAnalytics { get; set; }
        public DbSet<KnowledgeGap> KnowledgeGaps { get; set; }
        public DbSet<TopicMastery> TopicMasteries { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            ConfigureGhostModels(modelBuilder);
            ConfigureMaterySchema(modelBuilder);
            ConfigureRelationships(modelBuilder);
            ConfigureIndexes(modelBuilder);
            ConfigureManyToManyRelationships(modelBuilder);
        }

        private static void ConfigureGhostModels(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<StudentSubject>(entity =>
            {
                entity.ToTable("StudentSubjects", "AcademicPlanning", t => t.ExcludeFromMigrations());
                entity.HasKey(u => u.Id);
            });

            modelBuilder.Entity<StudentSubjectTopic>(entity =>
            {
                entity.ToTable("StudentSubjectTopic", "AcademicPlanning", t => t.ExcludeFromMigrations());
                entity.HasKey(u => u.Id);
            });
        }

        private static void ConfigureMaterySchema(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<KnowledgeGap>(entity => entity.ToTable("KnowledgeGaps", "Mastery"));
            modelBuilder.Entity<StudentSubjectAnalytics>(entity => entity.ToTable("StudentSubjectAnalytics", "Mastery"));
            modelBuilder.Entity<TopicMastery>(entity => entity.ToTable("TopicMasteries", "Mastery"));
        }

        private static void ConfigureRelationships(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<KnowledgeGap>(entity =>
            {
                entity.HasOne<StudentSubject>()
                      .WithMany()
                      .HasForeignKey("StudentSubjectId")
                      .HasConstraintName("FK_KnowledgeGaps_StudentSubjects_StudentSubjectId")
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne<StudentSubjectTopic>()
                      .WithMany()
                      .HasForeignKey("StudentSubjectTopicId")
                      .HasConstraintName("FK_StudentSubjectTopics_StudentSubjectTopics_StudentSubjectTopicId")
                      .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<StudentSubjectAnalytics>(entity =>
            {
                entity.HasOne<StudentSubject>()
                      .WithMany()
                      .HasForeignKey("StudentSubjectId")
                      .HasConstraintName("FK_StudentSubjectAnalytics_StudentSubjects_StudentSubjectId")
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne<StudentSubjectTopic>()
                      .WithMany()
                      .HasForeignKey("StudentSubjectTopicId")
                      .HasConstraintName("FK_StudentSubjectAnalytics_StudentSubjectTopics_StudentSubjectTopicId")
                      .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<TopicMastery>(entity =>
            {
                entity.HasOne<StudentSubject>()
                      .WithMany()
                      .HasForeignKey("StudentSubjectId")
                      .HasConstraintName("FK_TopicMasteries_StudentSubjects_StudentSubjectId")
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne<StudentSubjectTopic>()
                      .WithMany()
                      .HasForeignKey("StudentSubjectTopicId")
                      .HasConstraintName("FK_TopicMasteries_StudentSubjectTopics_StudentSubjectTopicId")
                      .OnDelete(DeleteBehavior.Restrict);
            });
        }

        private static void ConfigureIndexes(ModelBuilder modelBuilder)
        {
            
        }

        private static void ConfigureManyToManyRelationships(ModelBuilder modelBuilder)
        {

        }
    }
}