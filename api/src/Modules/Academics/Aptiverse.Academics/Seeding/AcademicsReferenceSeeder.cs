using Aptiverse.Academics.Domain;
using Aptiverse.Academics.Features.Common;
using Aptiverse.Academics.Persistence;
using Aptiverse.SharedKernel.Seeding;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Aptiverse.Academics.Seeding;

/// <summary>
/// Upserts curricula, CAPS subjects, curriculum mappings and institutions from the embedded data files, matched by
/// slug or natural key. Never deletes: subjects and institutions missing from the files are deactivated, so existing
/// enrolments keep pointing at them. Running it twice changes nothing the second time.
/// </summary>
internal sealed partial class AcademicsReferenceSeeder(
    AcademicsDbContext db,
    ReferenceCache reference,
    ILogger<AcademicsReferenceSeeder> logger) : IDataSeeder
{
    public async Task SeedAsync(CancellationToken cancellationToken)
    {
        var data = ReferenceData.Load();

        var curricula = await UpsertCurriculaAsync(data, cancellationToken);
        var subjects = await UpsertSubjectsAsync(data, cancellationToken);
        await UpsertMappingsAsync(data, curricula, subjects, cancellationToken);
        await UpsertInstitutionsAsync(data, cancellationToken);

        await db.SaveChangesAsync(cancellationToken);
        await reference.EvictAsync(cancellationToken);
    }

    private async Task<Dictionary<string, Curriculum>> UpsertCurriculaAsync(ReferenceData data, CancellationToken cancellationToken)
    {
        var existing = await db.Curricula.ToDictionaryAsync(c => c.Code, StringComparer.Ordinal, cancellationToken);
        var (inserted, updated) = (0, 0);
        foreach (var row in data.Curricula)
        {
            if (existing.TryGetValue(row.Code, out var curriculum))
            {
                updated += curriculum.Update(row.Name, row.ShortName, row.Description) ? 1 : 0;
                continue;
            }

            curriculum = Curriculum.Create(row.Code, row.Name, row.ShortName, row.Description);
            db.Curricula.Add(curriculum);
            existing[row.Code] = curriculum;
            inserted++;
        }

        LogUpserted(logger, "curricula", inserted, updated, 0);
        return existing;
    }

    private async Task<Dictionary<string, CatalogSubject>> UpsertSubjectsAsync(ReferenceData data, CancellationToken cancellationToken)
    {
        var existing = await db.CatalogSubjects.ToDictionaryAsync(s => s.Slug, StringComparer.Ordinal, cancellationToken);
        var (inserted, updated, deactivated) = (0, 0, 0);
        foreach (var row in data.Subjects)
        {
            if (existing.TryGetValue(row.Slug, out var subject))
            {
                updated += subject.Update(row.Code, row.Name, row.Category, row.LanguageType, row.Description) ? 1 : 0;
                continue;
            }

            subject = CatalogSubject.Create(row.Slug, row.Code, row.Name, row.Category, row.LanguageType, row.Description);
            db.CatalogSubjects.Add(subject);
            existing[row.Slug] = subject;
            inserted++;
        }

        var wanted = data.Subjects.Select(s => s.Slug).ToHashSet(StringComparer.Ordinal);
        foreach (var subject in existing.Values.Where(s => !wanted.Contains(s.Slug)))
        {
            deactivated += subject.Deactivate() ? 1 : 0;
        }

        LogUpserted(logger, "catalog subjects", inserted, updated, deactivated);
        return existing;
    }

    private async Task UpsertMappingsAsync(
        ReferenceData data,
        Dictionary<string, Curriculum> curricula,
        Dictionary<string, CatalogSubject> subjects,
        CancellationToken cancellationToken)
    {
        var existing = await db.CurriculumSubjects.ToDictionaryAsync(cs => (cs.CurriculumId, cs.SubjectId), cancellationToken);
        var (inserted, updated) = (0, 0);
        foreach (var row in data.CurriculumSubjects)
        {
            var curriculum = curricula[row.Curriculum];
            var subject = subjects[row.Subject];
            if (existing.TryGetValue((curriculum.Id, subject.Id), out var mapping))
            {
                updated += mapping.Update(row.MinGrade, row.MaxGrade, row.IsCompulsory, row.Notes) ? 1 : 0;
                continue;
            }

            mapping = CurriculumSubject.Create(curriculum.Id, subject.Id, row.MinGrade, row.MaxGrade, row.IsCompulsory, row.Notes);
            db.CurriculumSubjects.Add(mapping);
            existing[(curriculum.Id, subject.Id)] = mapping;
            inserted++;
        }

        LogUpserted(logger, "curriculum subjects", inserted, updated, 0);
    }

    private async Task UpsertInstitutionsAsync(ReferenceData data, CancellationToken cancellationToken)
    {
        var existing = await db.Institutions.ToDictionaryAsync(i => i.Slug, StringComparer.Ordinal, cancellationToken);
        var (inserted, updated, deactivated) = (0, 0, 0);
        foreach (var row in data.Institutions)
        {
            if (existing.TryGetValue(row.Slug, out var institution))
            {
                updated += institution.Update(row.Name, row.ShortName, row.Type, row.Province) ? 1 : 0;
                continue;
            }

            db.Institutions.Add(Institution.Create(row.Slug, row.Name, row.ShortName, row.Type, row.Province));
            inserted++;
        }

        var wanted = data.Institutions.Select(i => i.Slug).ToHashSet(StringComparer.Ordinal);
        foreach (var institution in existing.Values.Where(i => !wanted.Contains(i.Slug)))
        {
            deactivated += institution.Deactivate() ? 1 : 0;
        }

        LogUpserted(logger, "institutions", inserted, updated, deactivated);
    }

    [LoggerMessage(Level = LogLevel.Information, Message = "Academics seed: {Entity} {Inserted} inserted, {Updated} updated, {Deactivated} deactivated")]
    private static partial void LogUpserted(ILogger logger, string entity, int inserted, int updated, int deactivated);
}
