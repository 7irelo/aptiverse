using Aptiverse.Family.Contracts;
using Aptiverse.Identity.Contracts;
using Microsoft.Extensions.DependencyInjection;

namespace Aptiverse.Identity.Messaging;

// Wolverine handlers of the Identity module. They are public only because Wolverine generates code against them;
// each one resolves the internal service that does the work from a fresh scope, because Wolverine cannot inject
// internal types into a public handler.

/// <summary>Emails a password reset link when the account exists.</summary>
public static class IssuePasswordResetHandler
{
    public static async Task HandleAsync(IssuePasswordReset message, IServiceScopeFactory scopes, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(message);
        ArgumentNullException.ThrowIfNull(scopes);
        await using var scope = scopes.CreateAsyncScope();
        await scope.ServiceProvider.GetRequiredService<PasswordResetIssuer>().IssueAsync(message, cancellationToken);
    }
}

/// <summary>Emails a fresh verification link when the account exists and is unverified.</summary>
public static class IssueEmailVerificationHandler
{
    public static async Task HandleAsync(IssueEmailVerification message, IServiceScopeFactory scopes, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(message);
        ArgumentNullException.ThrowIfNull(scopes);
        await using var scope = scopes.CreateAsyncScope();
        await scope.ServiceProvider.GetRequiredService<EmailVerificationIssuer>().IssueAsync(message.NormalizedEmail, cancellationToken);
    }
}

/// <summary>Ends a deletion request's cooling-off period: approves it and starts erasure, unless it was cancelled.</summary>
public static class ProcessScheduledErasureHandler
{
    public static async Task HandleAsync(ProcessScheduledErasure message, IServiceScopeFactory scopes, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(message);
        ArgumentNullException.ThrowIfNull(scopes);
        await using var scope = scopes.CreateAsyncScope();
        await scope.ServiceProvider.GetRequiredService<ScheduledErasureProcessor>().ProcessAsync(message.RequestId, cancellationToken);
    }
}

/// <summary>Records the parental_consent document Family's consent stands for, so a minor may pay.</summary>
public static class IdentityParentalConsentGrantedHandler
{
    public static async Task HandleAsync(ParentalConsentGranted message, IServiceScopeFactory scopes, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(message);
        ArgumentNullException.ThrowIfNull(scopes);
        await using var scope = scopes.CreateAsyncScope();
        await scope.ServiceProvider.GetRequiredService<ParentalConsentRecorder>().GrantedAsync(message, cancellationToken);
    }
}

/// <summary>Withdraws the student's parental_consent document when the consenting parent withdraws.</summary>
public static class IdentityParentalConsentWithdrawnHandler
{
    public static async Task HandleAsync(ParentalConsentWithdrawn message, IServiceScopeFactory scopes, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(message);
        ArgumentNullException.ThrowIfNull(scopes);
        await using var scope = scopes.CreateAsyncScope();
        await scope.ServiceProvider.GetRequiredService<ParentalConsentRecorder>().WithdrawnAsync(message, cancellationToken);
    }
}
