using System.Globalization;
using Aptiverse.SharedKernel.Results;

namespace Aptiverse.Family.Domain;

/// <summary>Stable error codes of the Family module (spec error table). The web switches on the code, never the text.</summary>
internal static class FamilyErrors
{
    // Never 403 for someone else's child: the same 404 as an id that does not exist, so ids cannot be probed.
    public static readonly Error ChildNotFound = Error.NotFound("family.child_not_found", "This student is not linked to your account.");

    public static readonly Error ParentNotFound = Error.NotFound("family.parent_not_found", "This parent is not linked to your account.");

    public static readonly Error InviteNotFound = Error.NotFound("family.invite_not_found", "This invite does not exist or is no longer valid.");

    public static readonly Error InviteExpired = Error.Gone("family.invite_expired", "This invite has expired. Ask for a new one.");

    public static readonly Error InviteEmailMismatch = Error.Forbidden(
        "family.invite_email_mismatch",
        "This invite was sent to a different email address than the one on your account.");

    public static readonly Error EmailNotVerified = Error.Forbidden(
        "family.email_not_verified",
        "Verify your email address before linking accounts.");

    public static readonly Error SelfInvite = Error.Validation(
        "family.self_invite",
        "You cannot invite your own email address.",
        new Dictionary<string, string[]> { ["email"] = ["Use your child's email address, not your own."] });

    public static readonly Error AlreadyLinked = Error.Conflict("family.already_linked", "These accounts are already linked.");

    public static readonly Error LinkCodeInvalid = Error.NotFound("family.link_code_invalid", "That code is not valid. Check it with your child and try again.");

    public static readonly Error LinkCodeExpired = Error.Gone("family.link_code_expired", "That code has expired. Ask your child for a new one.");

    public static readonly Error ConsentNotNeeded = Error.Conflict(
        "family.consent_not_needed",
        "Parental consent is only recorded for students under 18.");

    public static readonly Error ConsentAlreadyGranted = Error.Conflict(
        "family.consent_already_granted",
        "Parental consent is already on record for this student.");

    public static readonly Error ConsentNotParent = Error.Forbidden(
        "family.consent_not_parent",
        "Only the parent who gave consent can withdraw it.");

    public static readonly Error ConsentNotFound = Error.NotFound("family.consent_not_found", "No parental consent is on record for this student.");

    public static readonly Error ParentNotAdult = Error.Forbidden(
        "family.parent_not_verified_adult",
        "Only a verified adult parent account can record parental consent.");

    public static Error InviteDuplicate(Guid inviteId) =>
        Error.Conflict("family.invite_duplicate", "You already have a pending invite to this email address. Cancel it before sending another.")
            .With("inviteId", inviteId);

    public static Error ChildLimitReached(int limit) =>
        Error.Conflict(
                "family.limit_reached",
                string.Create(CultureInfo.InvariantCulture, $"Your plan covers at most {limit} linked children. Change your plan to link more."))
            .With("limit", limit);

    public static Error ParentLimitReached(int limit) =>
        Error.Conflict(
                "family.limit_reached",
                string.Create(CultureInfo.InvariantCulture, $"A student can be linked to at most {limit} parents."))
            .With("limit", limit);

    public static Error ConsentVersionOutdated(string current) =>
        Error.Conflict("family.consent_version_outdated", "The parental consent text changed. Read the current version and confirm again.")
            .With("currentVersion", current);

    public static Error TooManyCodeAttempts(TimeSpan retryAfter) =>
        Error.TooManyRequests("family.too_many_attempts", "Too many wrong codes. Try again later.")
            .With("retryAfterSeconds", Math.Max(1, (int)Math.Ceiling(retryAfter.TotalSeconds)));
}
