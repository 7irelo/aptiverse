using System.Linq.Expressions;
using Aptiverse.SharedKernel.Domain;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.SharedKernel.Persistence;

/// <summary>
/// Base for every module's DbContext: one Postgres schema per module, snake_case names,
/// a soft-delete query filter and xmin optimistic concurrency on every <see cref="Entity"/>.
/// Subclasses apply their own IEntityTypeConfiguration classes explicitly (no assembly scanning).
/// </summary>
public abstract class ModuleDbContext(DbContextOptions options) : DbContext(options)
{
    public const string SoftDeleteFilter = "SoftDelete";
    public const string MigrationsHistoryTable = "__ef_migrations_history";
    public const string ConcurrencyTokenProperty = "Version";

    /// <summary>The Postgres schema this module owns, for example "support".</summary>
    protected abstract string Schema { get; }

    protected abstract void ApplyConfigurations(ModelBuilder modelBuilder);

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        ArgumentNullException.ThrowIfNull(optionsBuilder);
        optionsBuilder.UseSnakeCaseNamingConvention();
        base.OnConfiguring(optionsBuilder);
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        ArgumentNullException.ThrowIfNull(modelBuilder);

        modelBuilder.HasDefaultSchema(Schema);
        ApplyConfigurations(modelBuilder);

        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            if (!typeof(Entity).IsAssignableFrom(entityType.ClrType) || entityType.BaseType is not null)
            {
                continue;
            }

            var builder = modelBuilder.Entity(entityType.ClrType);
            builder.HasKey(nameof(Entity.Id));
            builder.Property(nameof(Entity.Id)).ValueGeneratedNever();
            builder.Ignore(nameof(Entity.IsDeleted));

            // Npgsql maps a uint row version onto the xmin system column: no real column is created.
            builder.Property<uint>(ConcurrencyTokenProperty).IsRowVersion();

            var parameter = Expression.Parameter(entityType.ClrType, "e");
            var filter = Expression.Lambda(
                Expression.Equal(
                    Expression.Property(parameter, nameof(Entity.DeletedAt)),
                    Expression.Constant(null, typeof(DateTimeOffset?))),
                parameter);
            builder.HasQueryFilter(SoftDeleteFilter, filter);
        }

        base.OnModelCreating(modelBuilder);
    }
}
