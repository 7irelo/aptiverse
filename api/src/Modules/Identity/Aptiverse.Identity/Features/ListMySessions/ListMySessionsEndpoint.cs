using System.Security.Claims;
using Aptiverse.SharedKernel.Authorization;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Routing;

namespace Aptiverse.Identity.Features.ListMySessions;

internal static class ListMySessionsEndpoint
{
    public static void Map(RouteGroupBuilder group)
    {
        group.MapGet("/sessions", HandleAsync)
            .WithName("listMySessions")
            .WithSummary("Your signed-in devices")
            .WithDescription("Active sessions only, newest activity first, at most 50. current marks the one making this request.")
            .RequirePermission(Permissions.Account.Manage)
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .ProducesProblem(StatusCodes.Status403Forbidden);
    }

    private static async Task<Ok<IReadOnlyList<SessionView>>> HandleAsync(
        ClaimsPrincipal user,
        ListMySessionsHandler handler,
        CancellationToken cancellationToken) =>
        TypedResults.Ok(await handler.HandleAsync(user.GetRequiredUserId(), user.GetSessionId(), cancellationToken));
}
