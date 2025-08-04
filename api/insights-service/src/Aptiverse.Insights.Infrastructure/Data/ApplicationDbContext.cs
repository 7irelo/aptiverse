using Aptiverse.Insights.Domain.Models.External.AcademicPlanning;
using Aptiverse.Insights.Domain.Models.Insights;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Insights.Infrastructure.Data
{
    public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : DbContext(options)
    {
        public DbSet<ImprovementTip> ImprovementTips { get; set; }
        public DbSet<GradeDistribution> GradeDistributions { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            ConfigureGhostModels(modelBuilder);
            ConfigureInsightsSchema(modelBuilder);
            ConfigureRelationships(modelBuilder);
            ConfigureIndexes(modelBuilder);
            ConfigureManyToManyRelationships(modelBuilder);
        }

        private static void ConfigureGhostModels(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<StudentSubject>(entity =>
            {
                entity.ToTable("StudentSubjects", "Insights", t => t.ExcludeFromMigrations());
                entity.HasKey(u => u.Id);
            });

            modelBuilder.Entity<StudentSubjectTopic>(entity =>
            {
                entity.ToTable("StudentSubjectTopics", "Insights", t => t.ExcludeFromMigrations());
                entity.HasKey(u => u.Id);
            });
        }

        private static void ConfigureInsightsSchema(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<GradeDistribution>(entity => entity.ToTable("GradeDistribution", "Insights"));
            modelBuilder.Entity<ImprovementTip>(entity => entity.ToTable("ImprovementTips", "Insights"));
            
        }

        private static void ConfigureRelationships(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<GradeDistribution>(entity =>
            {
                entity.HasOne<StudentSubject>()
                      .WithMany()
                      .HasForeignKey("StudentSubjectId")
                      .HasConstraintName("FK_GradeDistributions_StudentSubjects_StudentSubjectId")
                      .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<ImprovementTip>(entity =>
            {
                entity.HasOne<StudentSubject>()
                      .WithMany()
                      .HasForeignKey("StudentSubjectId")
                      .HasConstraintName("FK_ImprovementTips_StudentSubjects_StudentSubjectId")
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne<StudentSubjectTopic>()
                      .WithMany()
                      .HasForeignKey("StudentSubjectTopicId")
                      .HasConstraintName("FK_ImprovementTips_StudentSubjectTopics_StudentSubjectTopicId")
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