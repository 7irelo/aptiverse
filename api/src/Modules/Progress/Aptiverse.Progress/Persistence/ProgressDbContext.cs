using Aptiverse.Progress.Domain;
using Aptiverse.Progress.Persistence.Configurations;
using Aptiverse.SharedKernel.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Progress.Persistence;

internal sealed class ProgressDbContext(DbContextOptions<ProgressDbContext> options) : ModuleDbContext(options)
{
    public DbSet<Goal> Goals => Set<Goal>();

    public DbSet<Milestone> Milestones => Set<Milestone>();

    public DbSet<GoalEvidence> GoalEvidence => Set<GoalEvidence>();

    public DbSet<MasteryObservation> MasteryObservations => Set<MasteryObservation>();

    public DbSet<TopicMastery> TopicMastery => Set<TopicMastery>();

    public DbSet<PracticeResult> PracticeResults => Set<PracticeResult>();

    public DbSet<AssessmentRecord> AssessmentRecords => Set<AssessmentRecord>();

    public DbSet<JourneyEvent> JourneyEvents => Set<JourneyEvent>();

    protected override string Schema => ProgressModule.Schema;

    protected override void ApplyConfigurations(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfiguration(new GoalConfiguration());
        modelBuilder.ApplyConfiguration(new MilestoneConfiguration());
        modelBuilder.ApplyConfiguration(new GoalEvidenceConfiguration());
        modelBuilder.ApplyConfiguration(new MasteryObservationConfiguration());
        modelBuilder.ApplyConfiguration(new TopicMasteryConfiguration());
        modelBuilder.ApplyConfiguration(new PracticeResultConfiguration());
        modelBuilder.ApplyConfiguration(new AssessmentRecordConfiguration());
        modelBuilder.ApplyConfiguration(new JourneyEventConfiguration());
    }
}
