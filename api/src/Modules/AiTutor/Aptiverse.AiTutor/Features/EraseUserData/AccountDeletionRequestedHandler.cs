using Aptiverse.AiTutor.AiService;
using Aptiverse.Identity.Contracts;
using Microsoft.Extensions.DependencyInjection;
using Wolverine.ErrorHandling;
using Wolverine.Runtime.Handlers;

namespace Aptiverse.AiTutor.Features.EraseUserData;

/// <summary>
/// Erases the user's tutor data when they ask for their account to be deleted (POPIA). Public only because
/// Wolverine generates handler code against it; the work happens in the internal <see cref="UserDataEraser"/>,
/// resolved from a scope because Wolverine cannot inject internal types into a public handler.
/// </summary>
public static class AccountDeletionRequestedHandler
{
    /// <summary>The ai service may be briefly down; keep trying for a few hours before dead lettering.</summary>
    public static void Configure(HandlerChain chain)
    {
        ArgumentNullException.ThrowIfNull(chain);
        chain.OnException<HttpRequestException>()
            .Or<AiServiceException>()
            .Or<TaskCanceledException>()
            .ScheduleRetry(TimeSpan.FromMinutes(1), TimeSpan.FromMinutes(5), TimeSpan.FromMinutes(30), TimeSpan.FromHours(2));
    }

    public static async Task HandleAsync(AccountDeletionRequested message, IServiceScopeFactory scopes, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(message);
        ArgumentNullException.ThrowIfNull(scopes);

        await using var scope = scopes.CreateAsyncScope();
        await scope.ServiceProvider.GetRequiredService<UserDataEraser>().EraseAsync(message.UserId, cancellationToken);
    }
}
