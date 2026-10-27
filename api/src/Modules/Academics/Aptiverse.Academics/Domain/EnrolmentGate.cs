using System.ComponentModel;
using Aptiverse.Identity.Contracts;

namespace Aptiverse.Academics.Domain;

/// <summary>A catalog institution as cached for reads; immutable so the cache can hand out one instance.</summary>
[ImmutableObject(true)]
internal sealed record InstitutionInfo(Guid Id, string Slug, string Name, string? ShortName, string Type, string? Province);

/// <summary>
/// Who the caller is for academics: their onboarding profile from Identity and, for a tertiary student, the catalog
/// institution their profile names (null when it is not in the catalog). Built on the server only; no request field
/// can change it.
/// </summary>
internal sealed record StudentContext(Guid UserId, StudentProfile Profile, InstitutionInfo? Institution)
{
    public bool IsHighSchool =>
        Profile.Stage == Stages.HighSchool
        && Profile.Grade is >= CurriculumSubject.MinGradeAllowed and <= CurriculumSubject.MaxGradeAllowed
        && Profile.Curriculum is not null
        && Curricula.All.Contains(Profile.Curriculum);

    public bool IsTertiary => Profile.Stage == Stages.University;
}

/// <summary>
/// The single enrolment rule for both stages: a high school student (onboarding complete) may enrol only in CAPS
/// subjects of their own curriculum and grade, a tertiary student only in courses (shared ones of their own catalog
/// institution, or private ones they own). A student is never both. Parents, admins and students who have not
/// finished onboarding have no profile and can never enrol.
/// </summary>
internal static class EnrolmentGate
{
    public static bool CanEnrol(StudentContext? student, StudyUnit unit)
    {
        ArgumentNullException.ThrowIfNull(unit);

        if (student is null)
        {
            return false;
        }

        if (student.IsHighSchool)
        {
            return unit.Kind == StudyUnitKinds.CapsSubject
                && unit.CurriculumCode == student.Profile.Curriculum
                && unit.Grade == student.Profile.Grade;
        }

        if (student.IsTertiary)
        {
            return unit.Kind == StudyUnitKinds.TertiaryCourse
                && (unit.OwnerUserId is { } owner
                    ? owner == student.UserId && unit.InstitutionId is null
                    : unit.InstitutionId is { } institutionId && institutionId == student.Institution?.Id);
        }

        return false;
    }
}
