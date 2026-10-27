namespace Aptiverse.Identity.Contracts;

/// <summary>
/// Read-only view of the study profile a student set during onboarding. Holds no contact details or date of
/// birth, so callers can pass it to other services without leaking personal information.
/// </summary>
public interface IStudentProfileLookup
{
    /// <summary>Null when the user does not exist or has not finished onboarding.</summary>
    Task<StudentProfile?> GetAsync(Guid userId, CancellationToken cancellationToken);
}

/// <param name="EducationLevel">"high_school" or "tertiary", as stored by onboarding.</param>
/// <param name="Grade">High school grade, otherwise null.</param>
/// <param name="YearOfStudy">Tertiary year of study, otherwise null.</param>
/// <param name="Curriculum">High school exam body ("nsc" or "ieb"), otherwise null.</param>
/// <param name="Stage">"high_school" or "university".</param>
/// <param name="Level">Human readable level, for example "Grade 11" or "Year 2".</param>
/// <param name="InstitutionName">The institution a tertiary student named at onboarding, as typed or picked; otherwise null.</param>
public sealed record StudentProfile(
    string EducationLevel,
    int? Grade,
    int? YearOfStudy,
    string? Curriculum,
    string Stage,
    string Level,
    string? InstitutionName);
