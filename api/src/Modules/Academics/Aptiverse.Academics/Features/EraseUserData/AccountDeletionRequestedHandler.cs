using Aptiverse.Identity.Contracts;
using Microsoft.Extensions.DependencyInjection;

namespace Aptiverse.Academics.Features.EraseUserData;

/// <summary>
/// Erases the user's academic records when they ask for their account to be deleted (POPIA). Public only because
/// Wolverine generates handler code against it; the work happens in the internal <see cref="AcademicsUserDataEraser"/>,
/// resolved from a scope because Wolverine cannot inject internal types into a public handler.
/// </summary>
public static class AccountDeletionRequestedHandler
{
    public static async Task HandleAsync(AccountDeletionRequested message, IServiceScopeFactory scopes, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(message);
        ArgumentNullException.ThrowIfNull(scopes);

        await using var scope = scopes.CreateAsyncScope();
        await scope.ServiceProvider.GetRequiredService<AcademicsUserDataEraser>().EraseAsync(message.UserId, cancellationToken);
    }
}
