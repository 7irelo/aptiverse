namespace Aptiverse.Identity.Contracts;

// Integration events published by Identity through the transactional outbox. Each carries what a subscriber
// needs (address, display name, links) so no other module ever reads identity tables.

/// <summary>A new account exists. Raised for password and Google sign-ups.</summary>
public sealed record UserRegistered(Guid UserId, string Email, string Name, string Role, DateTimeOffset OccurredAt);

/// <summary>An email verification link should be sent. The link carries a single-use token.</summary>
public sealed record EmailVerificationRequested(
    Guid UserId,
    string Email,
    string Name,
    Uri VerificationUrl,
    DateTimeOffset ExpiresAt,
    DateTimeOffset OccurredAt);

/// <summary>A password reset link should be sent. Raised only for accounts that exist.</summary>
public sealed record PasswordResetRequested(
    Guid UserId,
    string Email,
    string Name,
    Uri ResetUrl,
    DateTimeOffset ExpiresAt,
    DateTimeOffset OccurredAt);

/// <summary>The password changed (by the user or through a reset). Subscribers send a security notice.</summary>
public sealed record PasswordChanged(Guid UserId, string Email, string Name, bool ViaReset, DateTimeOffset OccurredAt);

/// <summary>The user asked for their account and personal information to be deleted (POPIA).</summary>
public sealed record AccountDeletionRequested(Guid UserId, string Email, string Name, DateTimeOffset OccurredAt);

/// <summary>The account holder proved they own the email address.</summary>
public sealed record EmailVerified(Guid UserId, DateTimeOffset OccurredAt);

/// <summary>Repeated failed sign-ins locked the account. Raised once per lockout; subscribers send a security notice.</summary>
public sealed record AccountLockedOut(Guid UserId, string Email, string Name, DateTimeOffset LockedUntil, DateTimeOffset OccurredAt);

/// <summary>
/// A student or parent finished onboarding. Raised once per account. EducationLevel is "high_school" or "tertiary"
/// for students and null for parents; StudyLevel ("first_year" to "phd") is set for tertiary students and Curriculum
/// ("nsc" or "ieb") for high school students. IsMinor is under 18 on today's Johannesburg date, always false for parents.
/// </summary>
public sealed record UserOnboarded(
    Guid UserId,
    string Role,
    string? EducationLevel,
    int? Grade,
    int? YearOfStudy,
    string? StudyLevel,
    string? Curriculum,
    bool IsMinor,
    DateTimeOffset OccurredAt);

/// <summary>A student who had finished onboarding switched between high school and tertiary.</summary>
public sealed record StudentStageChanged(
    Guid UserId,
    string EducationLevel,
    int? Grade,
    int? YearOfStudy,
    string? StudyLevel,
    string? Curriculum,
    DateTimeOffset OccurredAt);

/// <summary>
/// The display name or the age facts changed. Carries the age band ("under_13", "13_to_17", "18_plus" or "unknown"),
/// never the date of birth; AgeBandChanged means parental consent, affiliate and payer rules must be re-evaluated.
/// </summary>
public sealed record UserProfileUpdated(Guid UserId, string Name, string AgeBand, bool AgeBandChanged, DateTimeOffset OccurredAt);

/// <summary>
/// Sessions ended other than by a plain logout; their access tokens stop working. Reason is for example
/// "signed_out_remotely", "password_changed" or "password_reset".
/// </summary>
public sealed record SessionsRevoked(Guid UserId, IReadOnlyList<Guid> SessionIds, string Reason, DateTimeOffset OccurredAt);
