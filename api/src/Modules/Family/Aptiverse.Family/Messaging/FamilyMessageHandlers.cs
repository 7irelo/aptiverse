using Aptiverse.Family.Erasure;
using Aptiverse.Identity.Contracts;
using Microsoft.Extensions.DependencyInjection;

namespace Aptiverse.Family.Messaging;

// Wolverine handlers of the Family module. They are public only because Wolverine generates code against them; each
// one resolves the internal service that does the work from a fresh scope, because Wolverine cannot inject internal
// types into a public handler. Every one is safe to run more than once for the same message.

/// <summary>Ends the user's links and deletes their invites and codes when they ask for their account to be deleted (POPIA).</summary>
public static class FamilyAccountDeletionRequestedHandler
{
    public static async Task HandleAsync(AccountDeletionRequested message, IServiceScopeFactory scopes, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(message);
        ArgumentNullException.ThrowIfNull(scopes);
        await using var scope = scopes.CreateAsyncScope();
        await scope.ServiceProvider.GetRequiredService<FamilyUserDataEraser>().EraseAsync(message.UserId, message.Email, cancellationToken);
    }
}
