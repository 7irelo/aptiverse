using Aptiverse.FeatureFlags.Domain.Models.FeatureFlags;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.FeatureFlags.Infrastructure.Data
{
    public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : DbContext(options)
    {
        public DbSet<FeatureFlag> FeatureFlags { get; set; }
        public DbSet<FeatureFlagRule> FeatureFlagRules { get; set; }
        public DbSet<FeatureFlagEvaluation> FeatureFlagEvaluations { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            ConfigureSchema(modelBuilder);
            ConfigureRelationships(modelBuilder);
            ConfigureIndexes(modelBuilder);
        }

        private static void ConfigureSchema(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<FeatureFlag>(entity => entity.ToTable("FeatureFlags", "FeatureFlags"));
            modelBuilder.Entity<FeatureFlagRule>(entity => entity.ToTable("FeatureFlagRules", "FeatureFlags"));
            modelBuilder.Entity<FeatureFlagEvaluation>(entity => entity.ToTable("FeatureFlagEvaluations", "FeatureFlags"));
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
