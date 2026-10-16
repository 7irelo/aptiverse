using Aptiverse.SharedKernel.Persistence;
using JasperFx.Resources;

namespace Aptiverse.Host.Infrastructure;

/// <summary>
/// `Aptiverse.Host.dll migrate`: applies every module's migrations, creates the Wolverine message storage, then
/// exits. Deployed environments run this as a one-off task before rolling the service.
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

        return 0;
    }
}
