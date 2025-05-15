using Aptiverse.Booking.Domain.Models.Booking;
using Aptiverse.Booking.Domain.Models.External.Identity;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Booking.Infrastructure.Data
{
    public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : DbContext(options)
    {
        public DbSet<TutorAvailability> TutorAvailabilities { get; set; }
        public DbSet<TutorStudent> TutorStudents { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            ConfigureGhostModels(modelBuilder);
            ConfigureStudentSchema(modelBuilder);
            ConfigureRelationships(modelBuilder);
            ConfigureIndexes(modelBuilder);
            ConfigureManyToManyRelationships(modelBuilder);
        }

        private static void ConfigureGhostModels(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Student>(entity =>
            {
                entity.ToTable("Students", "Identity", t => t.ExcludeFromMigrations());
                entity.HasKey(u => u.Id);
            });

            modelBuilder.Entity<Tutor>(entity =>
            {
                entity.ToTable("Tutors", "Identity", t => t.ExcludeFromMigrations());
                entity.HasKey(u => u.Id);
            });
        }

        private static void ConfigureStudentSchema(ModelBuilder modelBuilder)
        {


            modelBuilder.Entity<TutorAvailability>(entity => entity.ToTable("TutorAvailability", "Booking"));
            modelBuilder.Entity<TutorStudent>(entity => entity.ToTable("TutorStudents", "Booking"));
        }

        private static void ConfigureRelationships(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<TutorAvailability>(entity =>
            {
                entity.HasOne<Tutor>()
                      .WithMany()
                      .HasForeignKey("TutorId")
                      .HasConstraintName("FK_TutorAvailability_Tutors_TutorId")
                      .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<TutorStudent>(entity =>
            {
                entity.HasOne<Student>()
                      .WithMany()
                      .HasForeignKey("StudentId")
                      .HasConstraintName("FK_TutorStudent_Students_StudentId")
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne<Tutor>()
                      .WithMany()
                      .HasForeignKey("TutorId")
                      .HasConstraintName("FK_TutorStudent_Tutors_TutorId")
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