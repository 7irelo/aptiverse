using Aptiverse.AiTutor.Domain;
using Aptiverse.AiTutor.Persistence.Configurations;
using Aptiverse.SharedKernel.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.AiTutor.Persistence;

internal sealed class AiTutorDbContext(DbContextOptions<AiTutorDbContext> options) : ModuleDbContext(options)
{
    public DbSet<Conversation> Conversations => Set<Conversation>();

    public DbSet<Message> Messages => Set<Message>();

    protected override string Schema => AiTutorModule.Schema;

    protected override void ApplyConfigurations(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfiguration(new ConversationConfiguration());
        modelBuilder.ApplyConfiguration(new MessageConfiguration());
    }
}
