using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Npgsql.EntityFrameworkCore.PostgreSQL.Infrastructure;
using Wolverine.EntityFrameworkCore;

namespace Aptiverse.SharedKernel.Persistence;

public static class PersistenceServiceCollectionExtensions
{
    /// <summary>
    /// Registers a module DbContext against the shared Postgres database, in its own schema and with its own
    /// migrations history table, enrolled in the Wolverine transactional outbox.
    /// </summary>
    public static IServiceCollection AddModuleDbContext<TContext>(this IServiceCollection services, string schema)
        where TContext : ModuleDbContext
    {
        services.AddDbContextWithWolverineIntegration<TContext>((sp, options) =>
        {
            var connectionString = sp.GetRequiredService<IOptions<DatabaseOptions>>().Value.ConnectionString;
            options.UseNpgsql(connectionString, npgsql => npgsql.ConfigureModule(schema));
            options.AddInterceptors(sp.GetRequiredService<AuditableEntityInterceptor>());
        });
        services.AddScoped<IModuleMigrator, ModuleMigrator<TContext>>();

        return services;
    }

    /// <summary>Shared Npgsql settings for runtime and design-time contexts.</summary>
    public static NpgsqlDbContextOptionsBuilder ConfigureModule(this NpgsqlDbContextOptionsBuilder npgsql, string schema)
    {
        ArgumentNullException.ThrowIfNull(npgsql);

        // No EnableRetryOnFailure: retrying strategies reject the explicit transactions the Wolverine outbox opens.
        return npgsql.MigrationsHistoryTable(ModuleDbContext.MigrationsHistoryTable, schema);
    }
}
