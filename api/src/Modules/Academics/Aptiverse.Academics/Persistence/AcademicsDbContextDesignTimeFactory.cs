using Aptiverse.SharedKernel.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace Aptiverse.Academics.Persistence;

/// <summary>
/// Used only by dotnet-ef (migrations add, bundle). Reads ConnectionStrings__Aptiverse from the environment.
/// Adding a migration does not need a reachable database, so a local placeholder is used when unset.
/// </summary>
internal sealed class AcademicsDbContextDesignTimeFactory : IDesignTimeDbContextFactory<AcademicsDbContext>
{
    public AcademicsDbContext CreateDbContext(string[] args)
    {
        var connectionString = Environment.GetEnvironmentVariable("ConnectionStrings__Aptiverse")
            ?? "Host=localhost;Port=5433;Database=aptiverse;Username=aptiverse";

        var options = new DbContextOptionsBuilder<AcademicsDbContext>()
            .UseNpgsql(connectionString, npgsql => npgsql.ConfigureModule(AcademicsModule.Schema))
            .Options;

        return new AcademicsDbContext(options);
    }
}
