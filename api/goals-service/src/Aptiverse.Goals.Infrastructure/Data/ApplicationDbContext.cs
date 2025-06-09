using Aptiverse.Goals.Domain.Models.External.AcademicPlanning;
using Aptiverse.Goals.Domain.Models.External.Entitlements;
using Aptiverse.Goals.Domain.Models.External.Identity;
using Aptiverse.Goals.Domain.Models.Goals;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Goals.Infrastructure.Data
{
    public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : DbContext(options)
    {
        public DbSet<Goal> Goals { get; set; }
        public DbSet<GoalMilestone> GoalMilestones { get; set; }
        public DbSet<GrowthTracking> GrowthTrackings { get; set; }
        public DbSet<PointsTransaction> PointsTransactions { get; set; }
        public DbSet<Reward> Rewards { get; set; }
        public DbSet<StudentPoints> StudentPoints { get; set; }
        public DbSet<StudentReward> StudentRewards { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            ConfigureGhostModels(modelBuilder);
            ConfigureGoalsSchema(modelBuilder);
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

            modelBuilder.Entity<RewardFeature>(entity =>
            {
                entity.ToTable("RewardFeatures", "Entitlements", t => t.ExcludeFromMigrations());
                entity.HasKey(u => u.Id);
            });

            modelBuilder.Entity<Student>(entity =>
            {
                entity.ToTable("Students", "Identity", t => t.ExcludeFromMigrations());
                entity.HasKey(u => u.Id);
            });
        }

        private static void ConfigureGoalsSchema(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Goal>(entity => entity.ToTable("Goals", "Goals"));
            modelBuilder.Entity<Reward>(entity => entity.ToTable("Rewards", "Goals"));
            modelBuilder.Entity<RewardFeature>(entity => entity.ToTable("RewardFeatures", "Goals"));
            modelBuilder.Entity<GrowthTracking>(entity => entity.ToTable("GrowthTrackings", "Goals"));
            modelBuilder.Entity<GoalMilestone>(entity => entity.ToTable("GoalMilestones", "Goals"));
            modelBuilder.Entity<StudentReward>(entity => entity.ToTable("StudentRewards", "Goals"));
            modelBuilder.Entity<StudentPoints>(entity => entity.ToTable("StudentPoints", "Goals"));
            modelBuilder.Entity<PointsTransaction>(entity => entity.ToTable("PointsTransactions", "Goals"));
        }
        private static void ConfigureRelationships(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Goal>(entity =>
            {
                entity.HasOne<Student>()
                      .WithMany()
                      .HasForeignKey("StudentId")
                      .HasConstraintName("FK_Goals_Students_StudentId")
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne<Subject>()
                      .WithMany()
                      .HasForeignKey("SubjectId")
                      .HasConstraintName("FK_Goals_Subjects_SubjectId")
                      .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<GoalMilestone>(entity =>
            {
                entity.HasOne<Goal>()
                      .WithMany()
                      .HasForeignKey("GoalId")
                      .HasConstraintName("FK_GoalMilestones_Goals_GoalId")
                      .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<GrowthTracking>(entity =>
            {
                entity.HasOne<Student>()
                      .WithMany()
                      .HasForeignKey("StudentId")
                      .HasConstraintName("FK_GrowthTrackings_Students_StudentId")
                      .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<PointsTransaction>(entity =>
            {
                entity.HasOne<StudentPoints>()
                      .WithMany()
                      .HasForeignKey("StudentPointsId")
                      .HasConstraintName("FK_PointsTransactions_StudentPoints_StudentPointsId")
                      .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<PointsTransaction>(entity =>
            {
                entity.HasOne<Goal>()
                      .WithMany()
                      .HasForeignKey("GoalId")
                      .HasConstraintName("FK_PointsTransactions_Goals_GoalId")
                      .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<PointsTransaction>(entity =>
            {
                entity.HasOne<Reward>()
                      .WithMany()
                      .HasForeignKey("RewardId")
                      .HasConstraintName("FK_PointsTransactions_Rewards_RewardId")
                      .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<StudentPoints>(entity =>
            {
                entity.HasOne<Student>()
                      .WithMany()
                      .HasForeignKey("StudentId")
                      .HasConstraintName("FK_StudentPoints_Students_StudentId")
                      .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<StudentReward>(entity =>
            {
                entity.HasOne<Student>()
                      .WithMany()
                      .HasForeignKey("StudentId")
                      .HasConstraintName("FK_StudentRewards_Students_StudentId")
                      .OnDelete(DeleteBehavior.Cascade);
            });
            modelBuilder.Entity<StudentReward>(entity =>
            {
                entity.HasOne<Reward>()
                      .WithMany()
                      .HasForeignKey("RewardId")
                      .HasConstraintName("FK_StudentRewards_Rewards_RewardId")
                      .OnDelete(DeleteBehavior.Cascade);
            });
            modelBuilder.Entity<StudentReward>(entity =>
            {
                entity.HasOne<Goal>()
                      .WithMany()
                      .HasForeignKey("GoalId")
                      .HasConstraintName("FK_StudentRewards_Goals_GoalId")
                      .OnDelete(DeleteBehavior.Cascade);
            });
        }

        private static void ConfigureIndexes(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Goal>(entity =>
            {
                entity.HasIndex(g => new { g.StudentId, g.Status }, "IX_Goals_StudentId_Status");
            });

            modelBuilder.Entity<StudentReward>(entity =>
            {
                entity.HasIndex(sr => new { sr.StudentId, sr.Status }, "IX_StudentRewards_StudentId_Status");
            });

            modelBuilder.Entity<GrowthTracking>(entity =>
            {
                entity.HasIndex(gt => new { gt.StudentId, gt.TrackingDate }, "IX_GrowthTracking_StudentId_TrackingDate");
            });
        }

        private static void ConfigureManyToManyRelationships(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Reward>(entity =>
            {
                entity.HasMany(r => r.ApplicableGoals)
                      .WithMany(g => g.PotentialRewards)
                      .UsingEntity<Dictionary<string, object>>(
                          "GoalRewards",
                          j => j.HasOne<Goal>()
                                .WithMany()
                                .HasForeignKey("GoalId")
                                .HasConstraintName("FK_GoalRewards_Goals_GoalId")
                                .OnDelete(DeleteBehavior.Cascade),

                          j => j.HasOne<Reward>()
                                .WithMany()
                                .HasForeignKey("RewardId")
                                .HasConstraintName("FK_GoalRewards_Rewards_RewardId")
                                .OnDelete(DeleteBehavior.Cascade),

                          j =>
                          {
                              j.ToTable("GoalRewards", "Goals");
                              j.HasKey("RewardId", "GoalId");
                              j.HasIndex("GoalId");
                              j.HasIndex("RewardId");
                          }
                      );
            });
        }
    }
}