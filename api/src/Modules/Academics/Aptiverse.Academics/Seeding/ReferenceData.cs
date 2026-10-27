using System.Text.Json;

namespace Aptiverse.Academics.Seeding;

internal sealed record CurriculumData(string Code, string Name, string ShortName, string? Description);

internal sealed record SubjectData(string Slug, string Code, string Name, string Category, string? LanguageType, string? Description);

internal sealed record CurriculumSubjectData(string Curriculum, string Subject, short MinGrade, short MaxGrade, bool IsCompulsory, string? Notes);

internal sealed record InstitutionData(string Slug, string Name, string? ShortName, string Type, string? Province);

/// <summary>
/// The reference data files under Data/catalog, embedded in the assembly. Ported from the old app's catalog
/// seeder (43f9faa) as data only; Grades 8 and 9 Senior Phase subjects were added for decision 26.
/// </summary>
internal sealed record ReferenceData(
    IReadOnlyList<CurriculumData> Curricula,
    IReadOnlyList<SubjectData> Subjects,
    IReadOnlyList<CurriculumSubjectData> CurriculumSubjects,
    IReadOnlyList<InstitutionData> Institutions)
{
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web)
    {
        UnmappedMemberHandling = System.Text.Json.Serialization.JsonUnmappedMemberHandling.Disallow,
    };

    public static ReferenceData Load() => new(
        Read<CurriculumData>("curricula.json"),
        Read<SubjectData>("subjects.json"),
        Read<CurriculumSubjectData>("curriculum-subjects.json"),
        Read<InstitutionData>("institutions.json"));

    private static List<T> Read<T>(string file)
    {
        var name = $"Aptiverse.Academics.Data.catalog.{file}";
        using var stream = typeof(ReferenceData).Assembly.GetManifestResourceStream(name)
            ?? throw new InvalidOperationException($"Embedded reference data {name} is missing.");
        return JsonSerializer.Deserialize<List<T>>(stream, Json)
            ?? throw new InvalidOperationException($"Embedded reference data {name} is empty.");
    }
}
