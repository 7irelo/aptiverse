namespace Aptiverse.Identity.Features.GetMe;

/// <summary>The signed-in account as the web app needs it. The date of birth is returned to the account holder only.</summary>
/// <param name="Id">The user id.</param>
/// <param name="Name">Display name.</param>
/// <param name="Email">Sign-in email address.</param>
/// <param name="EmailConfirmed">Whether the address has been verified.</param>
/// <param name="PendingEmail">Target of an email change awaiting confirmation; always null until email change ships.</param>
/// <param name="HasPassword">False for Google-only accounts, which see "set a password" instead of "change password".</param>
/// <param name="PhoneNumber">Optional, international format.</param>
/// <param name="DateOfBirth">Students only; returned to the account holder only.</param>
/// <param name="AdultConfirmedAt">When a parent confirmed they are 18 or older; null otherwise.</param>
/// <param name="Roles">"student", "parent" or "admin".</param>
/// <param name="PrimaryRole">Admin over parent over student.</param>
/// <param name="Permissions">Derived from the roles by the server's single role map.</param>
/// <param name="Entitlements">Paid features; empty until billing ships, never null.</param>
/// <param name="IsMinor">Under 18 on today's Johannesburg date; false for parents and admins; null while a student has not given a date of birth.</param>
/// <param name="Onboarding">Onboarding state and study profile.</param>
/// <param name="Consent">The accepted legal versions and whether re-consent is needed.</param>
/// <param name="DeletionRequest">The pending deletion request, if any.</param>
/// <param name="CreatedAt">When the account was created.</param>
internal sealed record MeResponse(
    Guid Id,
    string Name,
    string Email,
    bool EmailConfirmed,
    string? PendingEmail,
    bool HasPassword,
    string? PhoneNumber,
    DateOnly? DateOfBirth,
    DateTimeOffset? AdultConfirmedAt,
    IReadOnlyList<string> Roles,
    string? PrimaryRole,
    IReadOnlyList<string> Permissions,
    IReadOnlyList<string> Entitlements,
    bool? IsMinor,
    OnboardingSummary Onboarding,
    ConsentSummary Consent,
    DeletionRequestSummary? DeletionRequest,
    DateTimeOffset CreatedAt);

/// <param name="Required">True for students and parents until they complete onboarding.</param>
/// <param name="CompletedAt">When onboarding was completed.</param>
/// <param name="EducationLevel">"high_school" or "tertiary"; null for parents and before the student chooses.</param>
/// <param name="Grade">High school grade, 8 to 12.</param>
/// <param name="Curriculum">High school exam body: "nsc" or "ieb".</param>
/// <param name="StudyLevel">Tertiary level: "first_year" to "fourth_year", "honours", "masters" or "phd".</param>
/// <param name="YearOfStudy">Derived from an undergraduate study level; null for postgraduate levels.</param>
/// <param name="Programme">Tertiary programme as the student wrote it.</param>
/// <param name="InstitutionName">School or institution.</param>
/// <param name="DateOfBirth">Students only; returned to the account holder only.</param>
internal sealed record OnboardingSummary(
    bool Required,
    DateTimeOffset? CompletedAt,
    string? EducationLevel,
    int? Grade,
    string? Curriculum,
    string? StudyLevel,
    int? YearOfStudy,
    string? Programme,
    string? InstitutionName,
    DateOnly? DateOfBirth);

/// <param name="TermsVersion">The newest terms version the user accepted, or null.</param>
/// <param name="PrivacyVersion">The newest privacy version the user accepted, or null.</param>
/// <param name="ReconsentRequired">True when either differs from getLegalVersions; show the re-consent screen.</param>
internal sealed record ConsentSummary(string? TermsVersion, string? PrivacyVersion, bool ReconsentRequired);

/// <param name="Id">The pending request.</param>
/// <param name="RequestedAt">When deletion was requested.</param>
/// <param name="ScheduledErasureAt">When erasure starts unless the request is cancelled first.</param>
internal sealed record DeletionRequestSummary(Guid Id, DateTimeOffset RequestedAt, DateTimeOffset? ScheduledErasureAt);
