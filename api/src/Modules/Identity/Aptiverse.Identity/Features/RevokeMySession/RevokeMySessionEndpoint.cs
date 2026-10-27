using System.Security.Claims;
using Aptiverse.Identity.Domain;
using Aptiverse.SharedKernel.Authorization;
using Aptiverse.SharedKernel.Results;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Routing;

namespace Aptiverse.Identity.Features.RevokeMySession;

internal static class RevokeMySessionEndpoint
{
    public static void Map(RouteGroupBuilder group)
    {
        group.MapDelete("/sessions/{id:guid}", HandleAsync)
            .WithName("revokeMySession")
            .WithSummary("Sign one of your devices out")
            .WithDescription(
                "Its refresh token stops working and its access token is refused immediately. Revoking the current session " +
                "is a logout. Idempotent. 404 identity.session_not_found for an unknown id or another user's session.")
            .RequirePermission(Permissions.Account.Manage)
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .ProducesProblem(StatusCodes.Status403Forbidden)
            .ProducesProblem(StatusCodes.Status404NotFound);
    }

    private static async Task<Results<NoContent, ProblemHttpResult>> HandleAsync(
        Guid id,
        ClaimsPrincipal user,
        RevokeMySessionHandler handler,
        HttpContext context,
        CancellationToken cancellationToken)
    {
        var result = await handler.HandleAsync(user.GetRequiredUserId(), user.GetSessionId(), id, RequestInfo.From(context), cancellationToken);
        return result.IsSuccess ? TypedResults.NoContent() : result.ToProblem();
    }
}
