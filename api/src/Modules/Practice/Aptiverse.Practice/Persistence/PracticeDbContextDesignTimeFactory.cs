using Aptiverse.SharedKernel.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace Aptiverse.Practice.Persistence;

/// <summary>
/// Used only by dotnet-ef (migrations add, bundle). Reads ConnectionStrings__Aptiverse from the environment.
/// Adding a migration does not need a reachable database, so a local placeholder is used when unset.
/// </summary>
internal sealed class PracticeDbContextDesignTimeFactory : IDesignTimeDbContextFactory<PracticeDbContext>
{
    public PracticeDbContext CreateDbContext(string[] args)
    {
        var connectionString = Environment.GetEnvironmentVariable("ConnectionStrings__Aptiverse")
            ?? "Host=localhost;Port=5433;Database=aptiverse;Username=aptiverse";

        var options = new DbContextOptionsBuilder<PracticeDbContext>()
            .UseNpgsql(connectionString, npgsql => npgsql.ConfigureModule(PracticeModule.Schema))
            .Options;

        return new PracticeDbContext(options);
    }
}
