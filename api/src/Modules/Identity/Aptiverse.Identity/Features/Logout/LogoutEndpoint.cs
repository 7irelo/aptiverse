using System.Security.Claims;
using Aptiverse.Identity.Domain;
using Aptiverse.SharedKernel.Authorization;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Routing;

namespace Aptiverse.Identity.Features.Logout;

internal static class LogoutEndpoint
{
    public static void Map(RouteGroupBuilder group)
    {
        group.MapPost("/logout", HandleAsync)
            .WithName("logout")
            .WithSummary("Sign out of the current session")
            .WithDescription(
                "Ends the session named by the access token: its refresh token stops working and the access token is refused " +
                "immediately. The web BFF then discards the tokens it holds. Idempotent; no body.")
            .RequireAuthorization()
            .ProducesProblem(StatusCodes.Status401Unauthorized);
    }

    private static async Task<NoContent> HandleAsync(
        ClaimsPrincipal user,
        LogoutHandler handler,
        HttpContext context,
        CancellationToken cancellationToken)
    {
        await handler.HandleAsync(user.GetRequiredUserId(), user.GetSessionId(), RequestInfo.From(context), cancellationToken);
        return TypedResults.NoContent();
    }
}
