using System.Globalization;
using Aptiverse.SharedKernel.Domain;

namespace Aptiverse.Academics.Domain;

/// <summary>
/// One thing a student studies, behind one id for both stages: a CAPS subject for a curriculum and grade (a shared
/// reference row created on first enrolment) or a tertiary course. A course is shared by every student of a
/// catalog institution, so topics emerge across them; without a catalog institution it is private to its owner.
/// </summary>
internal sealed class StudyUnit : Entity
{
    public const int KindMaxLength = 16;
    public const int CurriculumMaxLength = 16;
    public const int NameMaxLength = 160;
    public const int NameMinLength = 2;
    public const int NormalizedKeyMaxLength = 200;
    public const int CourseCodeMaxLength = 32;
    public const int CourseCodeMinLength = 2;
    public const int LevelMaxLength = 24;

    private StudyUnit()
    {
    }

    public string Kind { get; private set; } = StudyUnitKinds.CapsSubject;

    public Guid? CatalogSubjectId { get; private set; }

    public string? CurriculumCode { get; private set; }

    public short? Grade { get; private set; }

    public Guid? InstitutionId { get; private set; }

    /// <summary>Set only for a private course (the student's institution is not in the catalog).</summary>
    public Guid? OwnerUserId { get; private set; }

    public string Name { get; private set; } = string.Empty;

    /// <summary>Natural key that makes the find-or-create of shared units race safe (unique index).</summary>
    public string NormalizedKey { get; private set; } = string.Empty;

    public string? CourseCode { get; private set; }

    public string? Level { get; private set; }

    public bool IsShared => OwnerUserId is null;

    /// <summary>"grade_11" for a CAPS subject, the study level for a course.</summary>
    public string LevelKey => Kind == StudyUnitKinds.CapsSubject
        ? string.Create(CultureInfo.InvariantCulture, $"grade_{Grade}")
        : Level ?? string.Empty;

    public static StudyUnit CreateCaps(Guid subjectId, string subjectSlug, string subjectName, string curriculum, short grade) => new()
    {
        Kind = StudyUnitKinds.CapsSubject,
        CatalogSubjectId = subjectId,
        CurriculumCode = curriculum,
        Grade = grade,
        Name = subjectName,
        NormalizedKey = CapsKey(subjectSlug, curriculum, grade),
    };

    /// <summary>A shared course when <paramref name="institution"/> is set, else private to <paramref name="userId"/>.</summary>
    public static StudyUnit CreateCourse(InstitutionInfo? institution, Guid userId, string name, string? courseCode, string level)
    {
        var cleanName = Slugs.CleanText(name);
        var cleanCode = string.IsNullOrWhiteSpace(courseCode) ? null : Slugs.CleanText(courseCode).ToUpperInvariant();
        return new()
        {
            Kind = StudyUnitKinds.TertiaryCourse,
            InstitutionId = institution?.Id,
            OwnerUserId = institution is null ? userId : null,
            Name = cleanName,
            CourseCode = cleanCode,
            Level = level,
            NormalizedKey = CourseKey(institution, userId, cleanName, cleanCode, level),
        };
    }

    public static string CapsKey(string subjectSlug, string curriculum, short grade) =>
        string.Create(CultureInfo.InvariantCulture, $"{subjectSlug}:{curriculum}:{grade}");

    /// <summary>
    /// The code identifies a course when there is one ("MAM1000W" and "mam 1000w" are one course); otherwise the
    /// slugified name does. Scoped by institution slug for shared courses and by owner id for private ones.
    /// </summary>
    public static string CourseKey(InstitutionInfo? institution, Guid userId, string name, string? courseCode, string level)
    {
        var scope = institution?.Slug ?? userId.ToString("N");
        var identity = !string.IsNullOrWhiteSpace(courseCode) && Slugs.Code(courseCode) is { Length: > 0 } code
            ? "code-" + code
            : "name-" + Slugs.Name(name);
        var key = $"{scope}:{identity}:{level}";
        return key.Length <= NormalizedKeyMaxLength ? key : key[..NormalizedKeyMaxLength];
    }
}
