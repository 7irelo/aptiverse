using Aptiverse.Family.Domain;
using Aptiverse.Family.Persistence.Configurations;
using Aptiverse.SharedKernel.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Family.Persistence;

internal sealed class FamilyDbContext(DbContextOptions<FamilyDbContext> options) : ModuleDbContext(options)
{
    public DbSet<FamilyLink> Links => Set<FamilyLink>();

    public DbSet<FamilyInvite> Invites => Set<FamilyInvite>();

    public DbSet<LinkCode> LinkCodes => Set<LinkCode>();

    public DbSet<LinkCodeFailure> LinkCodeFailures => Set<LinkCodeFailure>();

    public DbSet<ParentalConsentRecord> ParentalConsents => Set<ParentalConsentRecord>();

    protected override string Schema => FamilyModule.Schema;

    protected override void ApplyConfigurations(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfiguration(new FamilyLinkConfiguration());
        modelBuilder.ApplyConfiguration(new FamilyInviteConfiguration());
        modelBuilder.ApplyConfiguration(new LinkCodeConfiguration());
        modelBuilder.ApplyConfiguration(new LinkCodeFailureConfiguration());
        modelBuilder.ApplyConfiguration(new ParentalConsentRecordConfiguration());
    }
}
