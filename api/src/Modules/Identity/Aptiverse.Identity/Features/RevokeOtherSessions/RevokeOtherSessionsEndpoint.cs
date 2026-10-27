using System.Security.Claims;
using Aptiverse.Identity.Domain;
using Aptiverse.SharedKernel.Authorization;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Routing;

namespace Aptiverse.Identity.Features.RevokeOtherSessions;

internal static class RevokeOtherSessionsEndpoint
{
    public static void Map(RouteGroupBuilder group)
    {
        group.MapPost("/sessions/revoke-others", HandleAsync)
            .WithName("revokeOtherSessions")
            .WithSummary("Sign out every other device")
            .WithDescription("Keeps the session making the request. Idempotent; returns how many sessions were signed out.")
            .RequirePermission(Permissions.Account.Manage)
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .ProducesProblem(StatusCodes.Status403Forbidden);
    }

    private static async Task<Ok<RevokeOtherSessionsResponse>> HandleAsync(
        ClaimsPrincipal user,
        RevokeOtherSessionsHandler handler,
        HttpContext context,
        CancellationToken cancellationToken) =>
        TypedResults.Ok(await handler.HandleAsync(user.GetRequiredUserId(), user.GetSessionId(), RequestInfo.From(context), cancellationToken));
}
