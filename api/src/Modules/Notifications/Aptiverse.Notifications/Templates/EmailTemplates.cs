namespace Aptiverse.Notifications.Templates;

/// <summary>One template: its key, the category that governs it, and the model keys it requires.</summary>
internal sealed record EmailTemplate(string Key, string Category, IReadOnlyList<string> ModelKeys);

/// <summary>Every template the module can render. Each key has subject, text and HTML parts under Templates/.</summary>
internal static class EmailTemplates
{
    public const string SecurityCategory = "security";
    public const string AccountCategory = "account";

    public static readonly EmailTemplate VerifyEmail =
        new("identity.verify_email", AccountCategory, ["name", "link", "expires_at"]);

    public static readonly EmailTemplate ResetPassword =
        new("identity.reset_password", SecurityCategory, ["name", "link", "expires_at"]);

    public static readonly EmailTemplate PasswordChanged =
        new("identity.password_changed", SecurityCategory, ["name", "changed_at", "via_reset", "reset_link"]);

    public static readonly EmailTemplate AccountLocked =
        new("identity.account_locked", SecurityCategory, ["name", "locked_until", "reset_link"]);

    public static readonly EmailTemplate Welcome =
        new("identity.welcome", AccountCategory, ["name", "is_parent", "app_link"]);

    public static readonly EmailTemplate SessionsRevoked =
        new("identity.sessions_revoked", SecurityCategory, ["name", "revoked_at", "device_count", "reason_text", "security_link", "reset_link"]);

    public static IReadOnlyList<EmailTemplate> All { get; } =
        [VerifyEmail, ResetPassword, PasswordChanged, AccountLocked, Welcome, SessionsRevoked];

    public static IReadOnlyList<string> Categories { get; } = [SecurityCategory, AccountCategory];
}
