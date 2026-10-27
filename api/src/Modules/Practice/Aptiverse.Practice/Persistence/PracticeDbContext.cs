using Aptiverse.Practice.Domain;
using Aptiverse.Practice.Persistence.Configurations;
using Aptiverse.SharedKernel.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Practice.Persistence;

internal sealed class PracticeDbContext(DbContextOptions<PracticeDbContext> options) : ModuleDbContext(options)
{
    public DbSet<PracticeTest> Tests => Set<PracticeTest>();

    public DbSet<Question> Questions => Set<Question>();

    public DbSet<GenerationJob> GenerationJobs => Set<GenerationJob>();

    public DbSet<Attempt> Attempts => Set<Attempt>();

    public DbSet<Answer> Answers => Set<Answer>();

    public DbSet<AttemptTopicScore> AttemptTopicScores => Set<AttemptTopicScore>();

    protected override string Schema => PracticeModule.Schema;

    protected override void ApplyConfigurations(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfiguration(new PracticeTestConfiguration());
        modelBuilder.ApplyConfiguration(new QuestionConfiguration());
        modelBuilder.ApplyConfiguration(new GenerationJobConfiguration());
        modelBuilder.ApplyConfiguration(new AttemptConfiguration());
        modelBuilder.ApplyConfiguration(new AnswerConfiguration());
        modelBuilder.ApplyConfiguration(new AttemptTopicScoreConfiguration());
    }
}
