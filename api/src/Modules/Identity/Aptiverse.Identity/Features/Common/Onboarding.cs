using Aptiverse.Identity.Domain;
using Aptiverse.SharedKernel.Results;

namespace Aptiverse.Identity.Features.Common;

/// <summary>Where onboarding stands. missing lists what completion still needs, keyed like the request fields.</summary>
/// <param name="EducationLevel">"high_school" or "tertiary"; null for parents and before the student chooses.</param>
/// <param name="Grade">High school grade, 8 to 12.</param>
/// <param name="Curriculum">High school exam body: "nsc" or "ieb".</param>
/// <param name="StudyLevel">Tertiary level: "first_year" to "fourth_year", "honours", "masters" or "phd".</param>
/// <param name="YearOfStudy">Derived from an undergraduate study level; null for postgraduate levels.</param>
/// <param name="Programme">Tertiary programme as the student wrote it.</param>
/// <param name="InstitutionName">School or institution.</param>
/// <param name="DateOfBirth">Students only; set once.</param>
/// <param name="CompletedAt">When onboarding was completed; null while it is a draft.</param>
/// <param name="Missing">For example ["grade", "dateOfBirth"]; empty when completion would succeed.</param>
internal sealed record OnboardingState(
    string? EducationLevel,
    int? Grade,
    string? Curriculum,
    string? StudyLevel,
    int? YearOfStudy,
    string? Programme,
    string? InstitutionName,
    DateOnly? DateOfBirth,
    DateTimeOffset? CompletedAt,
    IReadOnlyList<string> Missing);

internal static class Onboarding
{
    public static OnboardingState State(User user, bool adultConfirmed)
    {
        ArgumentNullException.ThrowIfNull(user);
        return new OnboardingState(
            user.EducationLevel,
            user.Grade,
            user.Curriculum,
            user.StudyLevel,
            user.YearOfStudy,
            user.Programme,
            user.InstitutionName,
            user.DateOfBirth,
            user.OnboardingCompletedAt,
            Missing(user, adultConfirmed));
    }

    /// <summary>What a complete profile still lacks for the user's role and stage.</summary>
    public static IReadOnlyList<string> Missing(User user, bool adultConfirmed)
    {
        ArgumentNullException.ThrowIfNull(user);
        var missing = new List<string>();
        if (user.IsStudent)
        {
            if (user.EducationLevel is null)
            {
                missing.Add("educationLevel");
            }
            else if (user.EducationLevel == EducationLevels.HighSchool)
            {
                AddIf(missing, user.Grade is null, "grade");
                AddIf(missing, user.Curriculum is null, "curriculum");
            }
            else
            {
                AddIf(missing, user.StudyLevel is null, "studyLevel");
            }

            AddIf(missing, user.EducationLevel is not null && user.InstitutionName is null, "institutionName");
            AddIf(missing, user.DateOfBirth is null, "dateOfBirth");
        }
        else if (user.IsParent)
        {
            AddIf(missing, !adultConfirmed && user.OnboardingCompletedAt is null, "adultConfirmed");
        }

        return missing;
    }

    /// <summary>
    /// Field errors for details that do not belong to the stage: a high school student has no study level or
    /// programme, a tertiary student has no grade or exam body. Null when everything present fits.
    /// </summary>
    public static Error? StageMismatch(string educationLevel, int? grade, string? curriculum, string? studyLevel, string? programme)
    {
        var errors = new Dictionary<string, string[]>();
        if (educationLevel == EducationLevels.HighSchool)
        {
            AddIf(errors, studyLevel is not null, "studyLevel", "Study level applies to tertiary students only.");
            AddIf(errors, programme is not null, "programme", "Programme applies to tertiary students only.");
        }
        else
        {
            AddIf(errors, grade is not null, "grade", "Grade applies to high school students only.");
            AddIf(errors, curriculum is not null, "curriculum", "Curriculum applies to high school students only.");
        }

        return errors.Count == 0
            ? null
            : Error.Validation("identity.stage_mismatch", "Some details do not apply to your level of study.", errors);
    }

    private static void AddIf(List<string> missing, bool condition, string field)
    {
        if (condition)
        {
            missing.Add(field);
        }
    }

    private static void AddIf(Dictionary<string, string[]> errors, bool condition, string field, string message)
    {
        if (condition)
        {
            errors[field] = [message];
        }
    }
}
