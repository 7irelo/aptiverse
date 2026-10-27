namespace Aptiverse.Identity.Features.CompleteOnboarding;

/// <summary>
/// Every field is optional: missing ones fall back to the saved draft, and the merged profile must be complete.
/// Students send their study details and date of birth; parents send only adultConfirmed.
/// </summary>
/// <param name="EducationLevel">Students: "high_school" or "tertiary".</param>
/// <param name="Grade">High school: 8 to 12.</param>
/// <param name="Curriculum">High school exam body: "nsc" or "ieb".</param>
/// <param name="StudyLevel">Tertiary: "first_year" to "fourth_year", "honours", "masters" or "phd".</param>
/// <param name="Programme">Tertiary, optional: 2 to 160 characters.</param>
/// <param name="InstitutionName">Students: school or institution, 2 to 200 characters.</param>
/// <param name="DateOfBirth">Students: age 10 to 80. Set once.</param>
/// <param name="AdultConfirmed">Parents: must be true, confirming you are 18 or older.</param>
internal sealed record CompleteOnboardingRequest(
    string? EducationLevel = null,
    int? Grade = null,
    string? Curriculum = null,
    string? StudyLevel = null,
    string? Programme = null,
    string? InstitutionName = null,
    DateOnly? DateOfBirth = null,
    bool? AdultConfirmed = null);
