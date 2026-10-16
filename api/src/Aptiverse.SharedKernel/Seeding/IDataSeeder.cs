namespace Aptiverse.SharedKernel.Seeding;

/// <summary>Idempotent reference or demo data, run only by the explicit `seed` command, never on boot.</summary>
public interface IDataSeeder
{
    Task SeedAsync(CancellationToken cancellationToken);
}
