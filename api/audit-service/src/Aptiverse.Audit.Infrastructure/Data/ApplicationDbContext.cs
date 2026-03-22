using Aptiverse.Audit.Domain.Models.Audit;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Audit.Infrastructure.Data
{
    public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : DbContext(options)
    {
        public DbSet<AuditLog> AuditLogs { get; set; }
        public DbSet<AuditAction> AuditActions { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            ConfigureSchema(modelBuilder);
            ConfigureRelationships(modelBuilder);
            ConfigureIndexes(modelBuilder);
        }

        private static void ConfigureSchema(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<AuditLog>(entity => entity.ToTable("AuditLogs", "Audit"));
            modelBuilder.Entity<AuditAction>(entity => entity.ToTable("AuditActions", "Audit"));
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
