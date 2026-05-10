// Aptiverse.Api unified ApplicationDbContext.
//
// Replaces 15 per-module DbContext classes with one. Entity discovery is
// done via reflection — every public class in `Aptiverse.*.Domain.Models`
// (or `Aptiverse.Domain.Models` for auth) that isn't abstract gets registered
// as an EF entity. Conventions handle keys + relationships; per-module
// custom Fluent API is intentionally not preserved (this is a fresh start).
//
// To customise an entity later, add an `IEntityTypeConfiguration<T>` next
// to the entity class — `ApplyConfigurationsFromAssembly` picks it up.

using System.Reflection;
using Aptiverse.Domain.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Api.Data
{
    public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : IdentityDbContext<User>(options)
    {
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Auth Identity tables — match the layout from the original
            // auth-provider DbContext so the schema is stable.
            modelBuilder.Entity<User>(b => b.ToTable("Users", "Identity"));
            modelBuilder.Entity<IdentityRole>(b => b.ToTable("Roles", "Identity"));
            modelBuilder.Entity<IdentityUserRole<string>>(b => b.ToTable("UserRoles", "Identity"));
            modelBuilder.Entity<IdentityUserClaim<string>>(b => b.ToTable("UserClaims", "Identity"));
            modelBuilder.Entity<IdentityUserLogin<string>>(b => b.ToTable("UserLogins", "Identity"));
            modelBuilder.Entity<IdentityRoleClaim<string>>(b => b.ToTable("RoleClaims", "Identity"));
            modelBuilder.Entity<IdentityUserToken<string>>(b => b.ToTable("UserTokens", "Identity"));

            // Auto-discover all module entities. Each entity class lives at
            // `Aptiverse.{Module}.Domain.Models.*` (or under a `Models`
            // subfolder of Domain). Anything that is a public, concrete,
            // non-Identity class with no explicit registration above is
            // brought in here.
            var assembly = typeof(ApplicationDbContext).Assembly;
            var entityTypes = assembly.GetTypes()
                .Where(t =>
                    t.IsClass &&
                    !t.IsAbstract &&
                    !t.IsGenericType &&
                    t.Namespace is not null &&
                    t.Namespace.StartsWith("Aptiverse.") &&
                    (t.Namespace.EndsWith(".Domain.Models") ||
                     t.Namespace.Contains(".Domain.Models.")))
                .Where(t => t != typeof(User))                       // already registered
                .Where(t => !typeof(IdentityUser).IsAssignableFrom(t)) // skip identity sub-classes
                .Where(t => t.GetProperties(BindingFlags.Public | BindingFlags.Instance).Length > 0) // skip empty placeholder classes
                .Distinct();

            foreach (var t in entityTypes)
            {
                var builder = modelBuilder.Entity(t);

                // Module-prefix the table name so entities with identical
                // class names across modules (Assessment, Goal, Subject,
                // Student, ...) don't collide on a single table.
                var module = ModuleNameFor(t);
                if (module is not null)
                {
                    builder.ToTable($"{module}_{t.Name}");
                }
            }

            // Apply the missing-key heuristic to any entity (whether we
            // explicitly registered it or it came in via a navigation
            // property). Without this, EF refuses to build the model for
            // join tables that lack an `Id` column.
            foreach (var entityType in modelBuilder.Model.GetEntityTypes().ToList())
            {
                var clr = entityType.ClrType;
                if (clr is null) continue;
                if (entityType.FindPrimaryKey() is not null) continue;
                if (typeof(IdentityUser).IsAssignableFrom(clr)) continue;

                var props = clr.GetProperties(BindingFlags.Public | BindingFlags.Instance);
                var hasId = props.Any(p =>
                    string.Equals(p.Name, "Id", StringComparison.Ordinal) ||
                    string.Equals(p.Name, clr.Name + "Id", StringComparison.Ordinal));
                if (hasId) continue;

                var fkProps = props
                    .Where(p => p.Name.EndsWith("Id", StringComparison.Ordinal) &&
                                (p.PropertyType == typeof(long) ||
                                 p.PropertyType == typeof(int) ||
                                 p.PropertyType == typeof(string) ||
                                 p.PropertyType == typeof(Guid)))
                    .Take(2)
                    .ToList();

                if (fkProps.Count == 2)
                {
                    modelBuilder.Entity(clr).HasKey(fkProps.Select(p => p.Name).ToArray());
                }
                else
                {
                    modelBuilder.Entity(clr).HasNoKey();
                }
            }

            // Future: add IEntityTypeConfiguration<T> classes for custom
            // Fluent API — they'll be discovered here.
            modelBuilder.ApplyConfigurationsFromAssembly(assembly);
        }

        // Extract the module name from a type's namespace.
        // `Aptiverse.Goals.Domain.Models.Goal` → `Goals`
        // `Aptiverse.Api.Domain.Models.X` → `Entitlements` (special-case;
        //   the entitlements module legacy uses `Aptiverse.Api.*`)
        // `Aptiverse.AcademicPlanning.Domain.Models.X` → `AcademicPlanning`
        private static string? ModuleNameFor(Type t)
        {
            var ns = t.Namespace;
            if (ns is null || !ns.StartsWith("Aptiverse.", StringComparison.Ordinal)) return null;

            // Auth lives at Aptiverse.Domain.Models — not "Aptiverse.<Module>.Domain.Models"
            if (ns.StartsWith("Aptiverse.Domain", StringComparison.Ordinal)) return "Auth";

            var parts = ns.Split('.');
            if (parts.Length < 2) return null;
            var moduleSegment = parts[1];

            return moduleSegment switch
            {
                "Api" => "Entitlements",
                _ => moduleSegment,
            };
        }
    }
}
