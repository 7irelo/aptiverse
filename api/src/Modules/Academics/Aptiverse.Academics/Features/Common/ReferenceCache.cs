using System.ComponentModel;
using Aptiverse.Academics.Domain;
using Aptiverse.Academics.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Hybrid;

namespace Aptiverse.Academics.Features.Common;

/// <summary>One active CAPS subject offered by a curriculum, with its grade range.</summary>
[ImmutableObject(true)]
internal sealed record CatalogEntry(
    Guid SubjectId,
    string Slug,
    string Code,
    string Name,
    string Category,
    string? LanguageType,
    bool IsCompulsory,
    short MinGrade,
    short MaxGrade);

/// <summary>
/// The catalog and institution lists are small, read on every onboarding screen and change only through the
/// seeder, so they are cached whole for an hour and filtered in memory. The seeder evicts them by tag.
/// </summary>
internal sealed class ReferenceCache(HybridCache cache, AcademicsDbContext db)
{
    public const string Tag = "academics-reference";

    private static readonly HybridCacheEntryOptions EntryOptions = new()
    {
        Expiration = TimeSpan.FromHours(1),
        LocalCacheExpiration = TimeSpan.FromHours(1),
    };

    private static readonly string[] Tags = [Tag];

    public async Task<IReadOnlyList<CatalogEntry>> GetCatalogAsync(string curriculum, CancellationToken cancellationToken) =>
        await cache.GetOrCreateAsync(
            $"academics:catalog:{curriculum}",
            (db, curriculum),
            static async (state, ct) => await LoadCatalogAsync(state.db, state.curriculum, ct),
            EntryOptions,
            Tags,
            cancellationToken);

    public async Task<IReadOnlyList<InstitutionInfo>> GetInstitutionsAsync(CancellationToken cancellationToken) =>
        await cache.GetOrCreateAsync(
            "academics:institutions",
            db,
            static async (db, ct) => await LoadInstitutionsAsync(db, ct),
            EntryOptions,
            Tags,
            cancellationToken);

    /// <summary>
    /// The catalog institution a profile names. Onboarding stores the picked or typed name, so this matches the
    /// name, short name or slug exactly (ignoring case); anything else is treated as not in the catalog.
    /// </summary>
    public async Task<InstitutionInfo?> FindInstitutionAsync(string? nameOrShortName, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(nameOrShortName))
        {
            return null;
        }

        var wanted = Slugs.CleanText(nameOrShortName);
        var institutions = await GetInstitutionsAsync(cancellationToken);
        return institutions.FirstOrDefault(i =>
            string.Equals(i.Name, wanted, StringComparison.OrdinalIgnoreCase)
            || string.Equals(i.ShortName, wanted, StringComparison.OrdinalIgnoreCase)
            || string.Equals(i.Slug, wanted, StringComparison.OrdinalIgnoreCase));
    }

    public ValueTask EvictAsync(CancellationToken cancellationToken) => cache.RemoveByTagAsync(Tag, cancellationToken);

    private static async Task<List<CatalogEntry>> LoadCatalogAsync(AcademicsDbContext db, string curriculum, CancellationToken cancellationToken) =>
        await (from cs in db.CurriculumSubjects.AsNoTracking()
               join c in db.Curricula.AsNoTracking() on cs.CurriculumId equals c.Id
               join s in db.CatalogSubjects.AsNoTracking() on cs.SubjectId equals s.Id
               where c.Code == curriculum && s.IsActive
               select new CatalogEntry(s.Id, s.Slug, s.Code, s.Name, s.Category, s.LanguageType, cs.IsCompulsory, cs.MinGrade, cs.MaxGrade))
            .ToListAsync(cancellationToken);

    private static async Task<List<InstitutionInfo>> LoadInstitutionsAsync(AcademicsDbContext db, CancellationToken cancellationToken) =>
        await db.Institutions.AsNoTracking()
            .Where(i => i.IsActive)
            .OrderBy(i => i.Name)
            .Select(i => new InstitutionInfo(i.Id, i.Slug, i.Name, i.ShortName, i.Type, i.Province))
            .ToListAsync(cancellationToken);
}
