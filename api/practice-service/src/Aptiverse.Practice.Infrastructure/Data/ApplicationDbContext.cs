using Aptiverse.Practice.Domain.Models.External.AcademicPlanning;
using Aptiverse.Practice.Domain.Models.External.Identity;
using Aptiverse.Practice.Domain.Models.External.PracticeTestGenerator;
using Aptiverse.Practice.Domain.Models.Practice;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Practice.Infrastructure.Data
{
    public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : DbContext(options)
    {
        public DbSet<AnswerSubmission> AnswerSubmissions { get; set; }
        public DbSet<AttemptScoreSummary> AttemptScoreSummaries { get; set; }
        public DbSet<PracticeAttempt> PracticeAttempts { get; set; }
        public DbSet<PracticeAttemptItem> PracticeAttemptItems { get; set; }
        public DbSet<PracticeTest> PracticeTests { get; set; }
        
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            ConfigureGhostModels(modelBuilder);
            ConfigureRelationships(modelBuilder);
            ConfigureIndexes(modelBuilder);
            ConfigureManyToManyRelationships(modelBuilder);
        }

        private static void ConfigureGhostModels (ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Subject>(entity =>
            {
                entity.ToTable("Subjects", "AcademicPlanning", t => t.ExcludeFromMigrations());
                entity.HasKey(u => u.Id);
            });

            modelBuilder.Entity<Topic>(entity =>
            {
                entity.ToTable("Topics", "AcademicPlanning", t => t.ExcludeFromMigrations());
                entity.HasKey(u => u.Id);
            });

            modelBuilder.Entity<Student>(entity =>
            {
                entity.ToTable("Students", "Identity", t => t.ExcludeFromMigrations());
                entity.HasKey(u => u.Id);
            });

            modelBuilder.Entity<GeneratedTest>(entity =>
            {
                entity.ToTable("GeneratedTest", "PracticeTestGenerator", t => t.ExcludeFromMigrations());
                entity.HasKey(u => u.Id);
            });
        }

        private static void ConfigurePracticeSchema(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<AnswerSubmission>(entity => entity.ToTable("AnswerSubmissions", "Practice"));
            modelBuilder.Entity<AttemptScoreSummary>(entity => entity.ToTable("AttemptScoreSummaries", "Practice"));
            modelBuilder.Entity<PracticeAttempt>(entity => entity.ToTable("PracticeAttempts", "Practice"));
            modelBuilder.Entity<PracticeAttemptItem>(entity => entity.ToTable("PracticeAttemptItems", "Practice"));
            modelBuilder.Entity<PracticeTest>(entity => entity.ToTable("PracticeTests", "Practice"));
        }

        private static void ConfigureRelationships(ModelBuilder modelBuilder)
        {
            
        }

        private static void ConfigureIndexes(ModelBuilder modelBuilder)
        {

        }

        private static void ConfigureManyToManyRelationships(ModelBuilder modelBuilder)
        {

        }
    }
}