using Aptiverse.Moderation.Domain.Models.Moderation;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Moderation.Infrastructure.Data
{
    public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : DbContext(options)
    {
        public DbSet<ContentReport> ContentReports { get; set; }
        public DbSet<ModerationAction> ModerationActions { get; set; }
        public DbSet<ContentFilter> ContentFilters { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            ConfigureSchema(modelBuilder);
            ConfigureRelationships(modelBuilder);
            ConfigureIndexes(modelBuilder);
        }

        private static void ConfigureSchema(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<ContentReport>(entity => entity.ToTable("ContentReports", "Moderation"));
            modelBuilder.Entity<ModerationAction>(entity => entity.ToTable("ModerationActions", "Moderation"));
            modelBuilder.Entity<ContentFilter>(entity => entity.ToTable("ContentFilters", "Moderation"));
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
