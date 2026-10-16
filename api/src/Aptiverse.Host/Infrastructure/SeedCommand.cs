using Aptiverse.SharedKernel.Seeding;

namespace Aptiverse.Host.Infrastructure;

/// <summary>`dotnet run --project src/Aptiverse.Host -- seed`: runs every module seeder once, then exits.</summary>
internal static class SeedCommand
{
    public const string Name = "seed";

    public static async Task<int> RunAsync(WebApplication app)
    {
        var logger = app.Services.GetRequiredService<ILoggerFactory>().CreateLogger(nameof(SeedCommand));

        await using var scope = app.Services.CreateAsyncScope();
        foreach (var seeder in scope.ServiceProvider.GetServices<IDataSeeder>())
        {
            logger.LogInformation("Running seeder {Seeder}", seeder.GetType().Name);
            await seeder.SeedAsync(CancellationToken.None);
        }

        return 0;
    }
}
