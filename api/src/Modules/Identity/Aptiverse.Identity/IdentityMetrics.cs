using System.Diagnostics.Metrics;

namespace Aptiverse.Identity;

/// <summary>Identity counters. Tags are low-cardinality values only, never ids, emails or tokens.</summary>
internal static class IdentityMetrics
{
    public const string MeterName = "Aptiverse.Identity";

    private static readonly Meter Meter = new(MeterName);

    private static readonly Counter<long> Registrations =
        Meter.CreateCounter<long>("aptiverse.identity.registrations", description: "Accounts registered");

    private static readonly Counter<long> Logins =
        Meter.CreateCounter<long>("aptiverse.identity.logins", description: "Sign-in attempts by outcome");

    private static readonly Counter<long> Lockouts =
        Meter.CreateCounter<long>("aptiverse.identity.lockouts", description: "Accounts locked by repeated failures");

    private static readonly Counter<long> Refreshes =
        Meter.CreateCounter<long>("aptiverse.identity.refreshes", description: "Refresh token presentations by outcome");

    private static readonly Counter<long> Logouts =
        Meter.CreateCounter<long>("aptiverse.identity.logouts", description: "Sessions ended by logout");

    private static readonly Counter<long> SessionsRevokedCounter =
        Meter.CreateCounter<long>("aptiverse.identity.sessions.revoked", description: "Sessions revoked by reason");

    private static readonly Counter<long> EmailVerifications =
        Meter.CreateCounter<long>("aptiverse.identity.email_verifications", description: "Email verification attempts by outcome");

    private static readonly Counter<long> PasswordResetRequests =
        Meter.CreateCounter<long>("aptiverse.identity.password_reset_requests", description: "Password reset requests");

    private static readonly Counter<long> PasswordResets =
        Meter.CreateCounter<long>("aptiverse.identity.password_resets", description: "Password resets by outcome");

    private static readonly Counter<long> PasswordChanges =
        Meter.CreateCounter<long>("aptiverse.identity.password_changes", description: "Password changes by outcome");

    private static readonly Counter<long> OnboardingCompleted =
        Meter.CreateCounter<long>("aptiverse.identity.onboarding.completed", description: "Onboarding completions");

    private static readonly Counter<long> DeletionRequests =
        Meter.CreateCounter<long>("aptiverse.identity.deletion_requests", description: "Account deletion requests");

    private static readonly Counter<long> DeletionCancellations =
        Meter.CreateCounter<long>("aptiverse.identity.deletion_requests.cancelled", description: "Account deletion requests cancelled");

    public static void Registered(string role) => Registrations.Add(1, new("role", role), new("method", "password"));

    public static void Login(string outcome, string method) => Logins.Add(1, new("outcome", outcome), new("method", method));

    public static void LockedOut() => Lockouts.Add(1);

    public static void Refresh(string outcome) => Refreshes.Add(1, new KeyValuePair<string, object?>("outcome", outcome));

    public static void LoggedOut() => Logouts.Add(1);

    public static void SessionsRevoked(string reason, int count) =>
        SessionsRevokedCounter.Add(count, new KeyValuePair<string, object?>("reason", reason));

    public static void EmailVerification(string outcome) => EmailVerifications.Add(1, new KeyValuePair<string, object?>("outcome", outcome));

    public static void PasswordResetRequested(bool accountFound) =>
        PasswordResetRequests.Add(1, new KeyValuePair<string, object?>("account_found", accountFound));

    public static void PasswordReset(string outcome) => PasswordResets.Add(1, new KeyValuePair<string, object?>("outcome", outcome));

    public static void PasswordChange(string outcome) => PasswordChanges.Add(1, new KeyValuePair<string, object?>("outcome", outcome));

    public static void Onboarded(string role, string? level) =>
        OnboardingCompleted.Add(1, new("role", role), new("level", level ?? "none"));

    public static void DeletionRequested() => DeletionRequests.Add(1);

    public static void DeletionCancelled() => DeletionCancellations.Add(1);
}
