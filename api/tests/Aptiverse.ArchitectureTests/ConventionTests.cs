using Aptiverse.SharedKernel.Domain;
using Aptiverse.SharedKernel.Persistence;
using FluentValidation;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace Aptiverse.ArchitectureTests;

public sealed class ConventionTests
{
    [Theory]
    [MemberData(nameof(Modules.Names), MemberType = typeof(Modules))]
    public void Every_request_type_has_a_validator(string module)
    {
        var types = Modules.Get(module).Implementation.GetTypes();
        var validated = types
            .SelectMany(t => t.GetInterfaces())
            .Where(i => i.IsGenericType && i.GetGenericTypeDefinition() == typeof(IValidator<>))
            .Select(i => i.GetGenericArguments()[0])
            .ToHashSet();

        var missing = types
            // Request records live in Features/<UseCase>/; a domain entity such as AccountDeletionRequest is not one.
            .Where(t => t.Name.EndsWith("Request", StringComparison.Ordinal) && !t.IsAbstract)
            .Where(t => t.Namespace?.Contains(".Features.", StringComparison.Ordinal) == true)
            .Where(t => !validated.Contains(t))
            .Select(t => t.FullName)
            .ToList();

        Assert.True(missing.Count == 0, $"Request types without a validator: {string.Join(", ", missing)}");
    }

    [Theory]
    [MemberData(nameof(Modules.Names), MemberType = typeof(Modules))]
    public void Every_foreign_key_has_an_index(string module)
    {
        foreach (var context in CreateContexts(module))
        {
            using (context)
            {
                var unindexed = context.Model.GetEntityTypes()
                    .SelectMany(e => e.GetForeignKeys())
                    .Where(fk => !fk.DeclaringEntityType.GetIndexes().Any(ix =>
                        ix.Properties.Take(fk.Properties.Count).SequenceEqual(fk.Properties)))
                    .Select(fk => $"{fk.DeclaringEntityType.ShortName()}({string.Join(", ", fk.Properties.Select(p => p.Name))})")
                    .ToList();

                Assert.True(unindexed.Count == 0, $"Foreign keys without a leading index: {string.Join(", ", unindexed)}");
            }
        }
    }

    [Theory]
    [MemberData(nameof(Modules.Names), MemberType = typeof(Modules))]
    public void Every_entity_uses_the_module_schema_and_derives_from_entity(string module)
    {
        foreach (var context in CreateContexts(module))
        {
            using (context)
            {
                var schema = context.Model.GetDefaultSchema();
                Assert.Equal(Modules.Get(module).ExpectedSchema, schema);

                foreach (var entity in context.Model.GetEntityTypes().Where(e => !e.IsOwned()))
                {
                    Assert.True(typeof(Entity).IsAssignableFrom(entity.ClrType), $"{entity.ClrType.Name} must derive from Entity");
                    Assert.Equal(schema, entity.GetSchema());
                }
            }
        }
    }

    [Fact(Skip = "TODO: enable in Phase 2 once cross-entity user references exist. Rule: every user_id column inside a module is a real FK to that module's user projection.")]
    public void Every_user_reference_is_a_foreign_key()
    {
    }

    private static List<ModuleDbContext> CreateContexts(string module)
    {
        var factories = Modules.Get(module).Implementation.GetTypes()
            .Where(t => !t.IsAbstract && t.GetInterfaces().Any(i =>
                i.IsGenericType && i.GetGenericTypeDefinition() == typeof(IDesignTimeDbContextFactory<>)))
            .ToList();

        Assert.NotEmpty(factories);

        return factories
            .Select(f =>
            {
                var factory = Activator.CreateInstance(f, nonPublic: true)!;
                var create = f.GetMethod(nameof(IDesignTimeDbContextFactory<DbContext>.CreateDbContext))!;
                return (ModuleDbContext)create.Invoke(factory, [Array.Empty<string>()])!;
            })
            .ToList();
    }
}
