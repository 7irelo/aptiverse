using Aptiverse.SharedKernel.Domain;

namespace Aptiverse.Identity.Domain;

/// <summary>Append-only audit row for security relevant activity. Readable by admins only.</summary>
internal sealed class SecurityEvent : Entity
{
    public const int TypeMaxLength = 48;
    public const int DetailMaxLength = 500;

    private SecurityEvent()
    {
    }

    public Guid? UserId { get; private set; }

    public string Type { get; private set; } = string.Empty;

    public string? Email { get; private set; }

    public string? IpAddress { get; private set; }

    public string? UserAgent { get; private set; }

    public string? Detail { get; private set; }

    public static SecurityEvent Create(string type, Guid? userId, string? email, RequestInfo request, string? detail = null) => new()
    {
        Type = type,
        UserId = userId,
        Email = email is { Length: > User.EmailMaxLength } ? email[..User.EmailMaxLength] : email,
        IpAddress = request.IpAddress,
        UserAgent = request.UserAgent,
        Detail = detail is { Length: > DetailMaxLength } ? detail[..DetailMaxLength] : detail,
    };
}

internal static class SecurityEventTypes
{
    public const string Registered = "registered";
    public const string LoginSucceeded = "login_succeeded";
    public const string LoginFailed = "login_failed";
    public const string Lockout = "lockout";
    public const string Logout = "logout";
    public const string SessionRevoked = "session_revoked";
    public const string RefreshReuseDetected = "refresh_reuse_detected";
    public const string EmailVerified = "email_verified";
    public const string PasswordChanged = "password_changed";
    public const string PasswordResetRequested = "password_reset_requested";
    public const string PasswordReset = "password_reset";
    public const string GoogleLinked = "google_linked";
    public const string AccountDeletionRequested = "account_deletion_requested";
    public const string AccountDeletionCancelled = "account_deletion_cancelled";
    public const string DateOfBirthSet = "date_of_birth_set";
    public const string AdultConfirmed = "adult_confirmed";

    public static IReadOnlyList<string> All { get; } =
    [
        Registered, LoginSucceeded, LoginFailed, Lockout, Logout, SessionRevoked, RefreshReuseDetected, EmailVerified,
        PasswordChanged, PasswordResetRequested, PasswordReset, GoogleLinked, AccountDeletionRequested,
        AccountDeletionCancelled, DateOfBirthSet, AdultConfirmed,
    ];
}
