using Aptiverse.SharedKernel.Persistence;
using JasperFx.Resources;
using Microsoft.Extensions.Options;

namespace Aptiverse.Host.Infrastructure;

/// <summary>
/// `Aptiverse.Host.dll migrate`: applies every module's migrations, creates the Wolverine message storage, grants
/// the runtime database role access to what now exists, then exits. Deployed environments run this as a one-off
/// task before rolling the service, connected as the user that owns the schemas.
/// </summary>
internal static class MigrateCommand
{
    public const string Name = "migrate";

    public static async Task<int> RunAsync(WebApplication app)
    {
        var logger = app.Services.GetRequiredService<ILoggerFactory>().CreateLogger(nameof(MigrateCommand));

        await using (var scope = app.Services.CreateAsyncScope())
        {
            foreach (var migrator in scope.ServiceProvider.GetServices<IModuleMigrator>())
            {
                logger.LogInformation("Migrating {Module}", migrator.Module);
                await migrator.MigrateAsync(CancellationToken.None);
            }
        }

        logger.LogInformation("Creating Wolverine message storage");
        await app.SetupResources();

        var runtimeRole = app.Configuration.GetSection(RuntimeDatabaseRole.SectionName).Get<RuntimeDatabaseRole>() ?? new();
        if (runtimeRole.IsConfigured)
        {
            var connectionString = app.Services.GetRequiredService<IOptions<DatabaseOptions>>().Value.ConnectionString;
            var schemas = await runtimeRole.EnsureAsync(connectionString, CancellationToken.None);
            logger.LogInformation("Runtime role {Role} granted DML on {Schemas}", runtimeRole.Username, string.Join(", ", schemas));
        }
        else
        {
            // Local compose runs everything as one user. Deployed environments always set the runtime role.
            logger.LogInformation("No Database:Runtime role configured; skipping runtime grants");
        }

        return 0;
    }
}
