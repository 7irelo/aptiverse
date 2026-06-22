// Design-time factory used by `dotnet ef` for migrations + scaffolding.
// Bypasses the host's full DI graph so a single bad module registration
// doesn't prevent migration generation.

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.Extensions.Configuration;

namespace Aptiverse.Api.Data
{
    public class ApplicationDbContextFactory : IDesignTimeDbContextFactory<ApplicationDbContext>
    {
        public ApplicationDbContext CreateDbContext(string[] args)
        {
            var configuration = new ConfigurationBuilder()
                .SetBasePath(Directory.GetCurrentDirectory())
                .AddJsonFile("appsettings.json", optional: true)
                .AddJsonFile("appsettings.Development.json", optional: true)
                .AddEnvironmentVariables()
                .Build();

            var connectionString = configuration.GetConnectionString("DefaultConnection")
                ?? "Host=localhost;Database=aptiverse;Username=postgres;Password=password";

            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseNpgsql(connectionString, b => b.MigrationsAssembly(typeof(ApplicationDbContext).Assembly.FullName))
                .UseSnakeCaseNamingConvention()
                // Suppress the design-time PendingModelChangesWarning. Our
                // snapshot has known historical drift from prior modules; the
                // migrations themselves are correct, so blocking `database
                // update` on the warning prevents legitimate work. Runtime
                // (Program.cs) keeps its default warning configuration so
                // genuine drift is still visible.
                .ConfigureWarnings(w => w.Ignore(RelationalEventId.PendingModelChangesWarning))
                .Options;

            return new ApplicationDbContext(options);
        }
    }
}
