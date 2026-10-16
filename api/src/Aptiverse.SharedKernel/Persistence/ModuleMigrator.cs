using Microsoft.EntityFrameworkCore;

namespace Aptiverse.SharedKernel.Persistence;

/// <summary>Applies one module's EF Core migrations. Only the explicit `migrate` command runs these, never boot.</summary>
public interface IModuleMigrator
{
    string Module { get; }

    Task MigrateAsync(CancellationToken cancellationToken);
}

internal sealed class ModuleMigrator<TContext>(TContext context) : IModuleMigrator
    where TContext : ModuleDbContext
{
    public string Module => typeof(TContext).Name;

    public Task MigrateAsync(CancellationToken cancellationToken) => context.Database.MigrateAsync(cancellationToken);
}
