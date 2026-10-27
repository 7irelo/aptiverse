namespace Aptiverse.Identity.Features.SaveOnboardingDetails;

/// <summary>Every field is optional; the ones present must fit the stored education level.</summary>
/// <param name="Grade">High school: 8 to 12.</param>
/// <param name="Curriculum">High school exam body: "nsc" or "ieb".</param>
/// <param name="StudyLevel">Tertiary: "first_year" to "fourth_year", "honours", "masters" or "phd".</param>
/// <param name="Programme">Tertiary, optional: 2 to 160 characters as you would write it.</param>
/// <param name="InstitutionName">Your school or institution, 2 to 200 characters.</param>
/// <param name="DateOfBirth">Age 10 to 80. Set once; a correction goes through support.</param>
internal sealed record SaveOnboardingDetailsRequest(
    int? Grade = null,
    string? Curriculum = null,
    string? StudyLevel = null,
    string? Programme = null,
    string? InstitutionName = null,
    DateOnly? DateOfBirth = null);
