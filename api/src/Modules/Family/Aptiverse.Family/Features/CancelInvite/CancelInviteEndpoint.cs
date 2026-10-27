using System.Security.Claims;
using Aptiverse.SharedKernel.Authorization;
using Aptiverse.SharedKernel.Results;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Routing;

namespace Aptiverse.Family.Features.CancelInvite;

internal static class CancelInviteEndpoint
{
    public static void Map(RouteGroupBuilder group)
    {
        group.MapDelete("/invites/{id:guid}", HandleAsync)
            .WithName("cancelFamilyInvite")
            .WithSummary("Cancel an invite you sent")
            .WithDescription("The emailed link stops working. Cancelling an invite that is no longer pending is 204.")
            .RequirePermission(Permissions.Family.Parent)
            .RequireRateLimiting(FamilyRateLimiting.Write)
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .ProducesProblem(StatusCodes.Status403Forbidden)
            .ProducesProblem(StatusCodes.Status404NotFound)
            .ProducesProblem(StatusCodes.Status429TooManyRequests);
    }

    private static async Task<Results<NoContent, ProblemHttpResult>> HandleAsync(
        Guid id,
        ClaimsPrincipal user,
        CancelInviteHandler handler,
        CancellationToken cancellationToken)
    {
        var result = await handler.HandleAsync(user.GetRequiredUserId(), id, cancellationToken);
        return result.IsSuccess ? TypedResults.NoContent() : result.ToProblem();
    }
}
