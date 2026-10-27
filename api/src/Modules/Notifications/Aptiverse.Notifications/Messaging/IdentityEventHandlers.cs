using Aptiverse.Identity.Contracts;
using Microsoft.Extensions.DependencyInjection;

namespace Aptiverse.Notifications.Messaging;

// Wolverine handlers of the Notifications module. They are public only because Wolverine generates code against them;
// each one resolves the internal service that does the work from a fresh scope, because Wolverine cannot inject
// internal types into a public handler. Transient provider failures surface as EmailDeliveryDeferredException, which
// the module's error policy reschedules with backoff.

/// <summary>Emails the verification link.</summary>
public static class EmailVerificationRequestedEmailHandler
{
    public static async Task HandleAsync(EmailVerificationRequested message, IServiceScopeFactory scopes, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(message);
        ArgumentNullException.ThrowIfNull(scopes);
        await using var scope = scopes.CreateAsyncScope();
        await scope.ServiceProvider.GetRequiredService<IdentityEmails>().VerificationRequestedAsync(message, cancellationToken);
    }
}

/// <summary>Emails the password reset link.</summary>
public static class PasswordResetRequestedEmailHandler
{
    public static async Task HandleAsync(PasswordResetRequested message, IServiceScopeFactory scopes, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(message);
        ArgumentNullException.ThrowIfNull(scopes);
        await using var scope = scopes.CreateAsyncScope();
        await scope.ServiceProvider.GetRequiredService<IdentityEmails>().PasswordResetRequestedAsync(message, cancellationToken);
    }
}

/// <summary>Emails the password changed security notice.</summary>
public static class PasswordChangedEmailHandler
{
    public static async Task HandleAsync(PasswordChanged message, IServiceScopeFactory scopes, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(message);
        ArgumentNullException.ThrowIfNull(scopes);
        await using var scope = scopes.CreateAsyncScope();
        await scope.ServiceProvider.GetRequiredService<IdentityEmails>().PasswordChangedAsync(message, cancellationToken);
    }
}

/// <summary>Emails the account locked security notice.</summary>
public static class AccountLockedOutEmailHandler
{
    public static async Task HandleAsync(AccountLockedOut message, IServiceScopeFactory scopes, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(message);
        ArgumentNullException.ThrowIfNull(scopes);
        await using var scope = scopes.CreateAsyncScope();
        await scope.ServiceProvider.GetRequiredService<IdentityEmails>().AccountLockedOutAsync(message, cancellationToken);
    }
}

/// <summary>Emails the welcome message once the address is verified.</summary>
public static class EmailVerifiedEmailHandler
{
    public static async Task HandleAsync(EmailVerified message, IServiceScopeFactory scopes, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(message);
        ArgumentNullException.ThrowIfNull(scopes);
        await using var scope = scopes.CreateAsyncScope();
        await scope.ServiceProvider.GetRequiredService<IdentityEmails>().EmailVerifiedAsync(message, cancellationToken);
    }
}

/// <summary>Emails a security notice when devices were signed out by anything but the user's own sign out or a password change.</summary>
public static class SessionsRevokedEmailHandler
{
    public static async Task HandleAsync(SessionsRevoked message, IServiceScopeFactory scopes, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(message);
        ArgumentNullException.ThrowIfNull(scopes);
        await using var scope = scopes.CreateAsyncScope();
        await scope.ServiceProvider.GetRequiredService<IdentityEmails>().SessionsRevokedAsync(message, cancellationToken);
    }
}
