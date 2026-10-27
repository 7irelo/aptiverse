using Aptiverse.Family.Contracts;
using Microsoft.Extensions.DependencyInjection;

namespace Aptiverse.Notifications.Messaging;

// Family email handlers. Public only because Wolverine generates code against them; each resolves the internal
// service from a fresh scope. Transient provider failures are rescheduled by the module's error policy.

/// <summary>Emails a parent's invite to the invited address.</summary>
public static class FamilyInviteSentEmailHandler
{
    public static async Task HandleAsync(FamilyInviteSent message, IServiceScopeFactory scopes, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(message);
        ArgumentNullException.ThrowIfNull(scopes);
        await using var scope = scopes.CreateAsyncScope();
        await scope.ServiceProvider.GetRequiredService<FamilyEmails>().InviteSentAsync(message, cancellationToken);
    }
}

/// <summary>Tells the parent a link was made.</summary>
public static class FamilyLinkCreatedEmailHandler
{
    public static async Task HandleAsync(FamilyLinkCreated message, IServiceScopeFactory scopes, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(message);
        ArgumentNullException.ThrowIfNull(scopes);
        await using var scope = scopes.CreateAsyncScope();
        await scope.ServiceProvider.GetRequiredService<FamilyEmails>().LinkCreatedAsync(message, cancellationToken);
    }
}

/// <summary>Tells the other side a link was removed.</summary>
public static class FamilyLinkRemovedEmailHandler
{
    public static async Task HandleAsync(FamilyLinkRemoved message, IServiceScopeFactory scopes, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(message);
        ArgumentNullException.ThrowIfNull(scopes);
        await using var scope = scopes.CreateAsyncScope();
        await scope.ServiceProvider.GetRequiredService<FamilyEmails>().LinkRemovedAsync(message, cancellationToken);
    }
}
