using Aptiverse.SharedKernel.Persistence;
using Aptiverse.Support.Domain;
using Aptiverse.Support.Persistence.Configurations;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Support.Persistence;

internal sealed class SupportDbContext(DbContextOptions<SupportDbContext> options) : ModuleDbContext(options)
{
    public DbSet<Faq> Faqs => Set<Faq>();

    protected override string Schema => SupportModule.Schema;

    protected override void ApplyConfigurations(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfiguration(new FaqConfiguration());
    }
}
