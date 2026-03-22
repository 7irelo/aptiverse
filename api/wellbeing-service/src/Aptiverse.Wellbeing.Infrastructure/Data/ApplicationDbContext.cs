using Aptiverse.Wellbeing.Domain.Models.Wellbeing;
using Aptiverse.Wellbeing.Domain.Models.External.Identity;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Wellbeing.Infrastructure.Data
{
    public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : DbContext(options)
    {
        public DbSet<DiaryEntry> DiaryEntrys { get; set; }
        public DbSet<DiaryGoal> DiaryGoals { get; set; }
        public DbSet<MoodTracking> MoodTrackings { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            ConfigureGhostModels(modelBuilder);
            ConfigureSchema(modelBuilder);
            ConfigureRelationships(modelBuilder);
            ConfigureIndexes(modelBuilder);
        }

        private static void ConfigureGhostModels(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Student>(entity =>
            {
                entity.ToTable("Students", "Identity", t => t.ExcludeFromMigrations());
                entity.HasKey(u => u.Id);
            });
        }

        private static void ConfigureSchema(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<DiaryEntry>(entity => entity.ToTable("DiaryEntrys", "Wellbeing"));
            modelBuilder.Entity<DiaryGoal>(entity => entity.ToTable("DiaryGoals", "Wellbeing"));
            modelBuilder.Entity<MoodTracking>(entity => entity.ToTable("MoodTrackings", "Wellbeing"));
        }

        private static void ConfigureRelationships(ModelBuilder modelBuilder)
        {
            // Configure relationships as needed
        }

        private static void ConfigureIndexes(ModelBuilder modelBuilder)
        {
            // Configure indexes as needed
        }
    }
}
