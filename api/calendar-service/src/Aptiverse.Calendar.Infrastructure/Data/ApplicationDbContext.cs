using Aptiverse.Calendar.Domain.Models.Calendar;
using Aptiverse.Calendar.Domain.Models.External.Identity;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Calendar.Infrastructure.Data
{
    public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : DbContext(options)
    {
        public DbSet<CalendarEvent> CalendarEvents { get; set; }
        public DbSet<CalendarSync> CalendarSyncs { get; set; }
        public DbSet<Reminder> Reminders { get; set; }

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
            modelBuilder.Entity<CalendarEvent>(entity => entity.ToTable("CalendarEvents", "Calendar"));
            modelBuilder.Entity<CalendarSync>(entity => entity.ToTable("CalendarSyncs", "Calendar"));
            modelBuilder.Entity<Reminder>(entity => entity.ToTable("Reminders", "Calendar"));
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
