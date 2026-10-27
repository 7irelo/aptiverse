using Aptiverse.SharedKernel.Results;

namespace Aptiverse.Identity.Features.Common;

/// <summary>Stable error codes of the Identity module. The web app branches on the code, never the text.</summary>
internal static class IdentityErrors
{
    private static readonly string[] RequiredToFinish = ["This is required to finish onboarding."];
    private static readonly string[] ParentsHaveNoStudyDetails = ["Parents do not give study details."];

    public static readonly Error InvalidCredentials =
        Error.Unauthorized("identity.invalid_credentials", "The email or password is incorrect.");

    public static readonly Error EmailTaken = Error.Conflict(
        "identity.email_taken",
        "An account with this email already exists. Sign in or reset your password.");

    public static readonly Error ConsentOutdated = Error.Conflict(
        "identity.consent_outdated",
        "The terms or privacy policy changed. Review the current versions and accept them to continue.");

    public static readonly Error AccountNotFound = Error.NotFound(
        "identity.account_not_found",
        "No Aptiverse account uses this Google address. Create an account first.");

    public static readonly Error GoogleEmailUnverified = Error.Conflict(
        "identity.google_email_unverified",
        "Google has not verified this email address, so it cannot be linked to your account.");

    public static readonly Error UserNotFound = Error.NotFound("identity.user_not_found", "Your account was not found. Please sign in again.");

    // Same answer for "does not exist" and "belongs to someone else", so session ids cannot be probed.
    public static readonly Error SessionNotFound = Error.NotFound("identity.session_not_found", "The session was not found.");

    public static readonly Error ConcurrencyConflict = Error.Conflict(
        "concurrency_conflict",
        "Your profile changed on another device. Reload it and try again.");

    public static readonly Error OnboardingStudentsOnly = Error.Forbidden(
        "identity.onboarding_students_only",
        "Only students choose a level and study details.");

    public static readonly Error OnboardingNotApplicable = Error.Forbidden(
        "identity.onboarding_not_applicable",
        "Onboarding applies to students and parents only.");

    public static readonly Error LevelNotSet = Error.Validation(
        "identity.level_not_set",
        "Choose high school or tertiary first.",
        new Dictionary<string, string[]> { ["educationLevel"] = ["Choose high school or tertiary first."] });

    public static readonly Error DateOfBirthAlreadySet = Error.Conflict(
        "identity.date_of_birth_already_set",
        "Your date of birth is already set. Contact support to correct it.");

    public static readonly Error AdultAlreadyConfirmed = Error.Conflict(
        "identity.adult_already_confirmed",
        "You have already confirmed that you are 18 or older.");

    public static readonly Error ErasureInProgress = Error.Conflict(
        "identity.erasure_in_progress",
        "Your account is already being deleted, so the request can no longer be cancelled.");

    public static Error OnboardingIncomplete(IReadOnlyList<string> missing) =>
        Error.Conflict("identity.onboarding_incomplete", "Some onboarding details are still missing.") with
        {
            ValidationErrors = missing.ToDictionary(field => field, _ => RequiredToFinish),
        };

    public static Error ParentStudyFields(IReadOnlyList<string> fields) =>
        Error.Validation("identity.not_applicable", "Parents do not give study details.", fields.ToDictionary(f => f, _ => ParentsHaveNoStudyDetails));

    public static Error Field(string code, string field, string message) =>
        Error.Validation(code, message, new Dictionary<string, string[]> { [field] = [message] });
}
