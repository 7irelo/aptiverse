using Aptiverse.Marketplace.Domain.Models.External.AcademicPlanning;
using Aptiverse.Marketplace.Domain.Models.External.Booking;
using Aptiverse.Marketplace.Domain.Models.External.Identity;
using Aptiverse.Marketplace.Domain.Models.Marketplace;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Marketplace.Infrastructure.Data
{
    public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : DbContext(options)
    {
        public DbSet<Course> Courses { get; set; }
        public DbSet<CourseModule> CourseModules { get; set; }
        public DbSet<ModuleLesson> ModuleLessons { get; set; }
        public DbSet<CourseEnrollment> CourseEnrollments { get; set; }
        public DbSet<Resource> Resources { get; set; }
        public DbSet<ResourceDownload> ResourceDownloads { get; set; }
        public DbSet<Tutor> Tutors { get; set; }
        public DbSet<TutorSubject> TutorSubjects { get; set; }

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
            modelBuilder.Entity<Subject>(entity =>
            {
                entity.ToTable("Subjects", "AcademicPlanning", t => t.ExcludeFromMigrations());
                entity.HasKey(u => u.Id);
            });

            modelBuilder.Entity<TutorAvailability>(entity =>
            {
                entity.ToTable("TutorAvailability", "Booking", t => t.ExcludeFromMigrations());
                entity.HasKey(u => u.Id);
            });

            modelBuilder.Entity<TutorStudent>(entity =>
            {
                entity.ToTable("TutorStudent", "Booking", t => t.ExcludeFromMigrations());
                entity.HasKey(u => u.Id);
            });

            modelBuilder.Entity<User>(entity =>
            {
                entity.ToTable("Users", "Identity", t => t.ExcludeFromMigrations());
                entity.HasKey(u => u.Id);
            });
        }

        private static void ConfigureStudentSchema(ModelBuilder modelBuilder)
        {


            modelBuilder.Entity<Course>(entity => entity.ToTable("Course", "Marketplace"));
            modelBuilder.Entity<CourseEnrollment>(entity => entity.ToTable("CourseEnrollments", "Marketplace"));
            modelBuilder.Entity<CourseModule>(entity => entity.ToTable("CourseModules", "Marketplace"));
            modelBuilder.Entity<ModuleLesson>(entity => entity.ToTable("ModuleLessons", "Marketplace"));
            modelBuilder.Entity<Resource>(entity => entity.ToTable("Resources", "Marketplace"));
            modelBuilder.Entity<ResourceDownload>(entity => entity.ToTable("ResourceDownloads", "Marketplace"));
            modelBuilder.Entity<Tutor>(entity => entity.ToTable("Tutors", "Marketplace"));
            modelBuilder.Entity<TutorSubject>(entity => entity.ToTable("TutorSubjects", "Marketplace"));
        }

        private static void ConfigureRelationships(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Course>(entity =>
            {
                entity.HasOne<User>()
                      .WithMany()
                      .HasForeignKey("UserId")
                      .HasConstraintName("FK_Courses_Users_UserId")
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne<Tutor>()
                      .WithMany()
                      .HasForeignKey("TutorId")
                      .HasConstraintName("FK_Courses_Tutors_TutorId")
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