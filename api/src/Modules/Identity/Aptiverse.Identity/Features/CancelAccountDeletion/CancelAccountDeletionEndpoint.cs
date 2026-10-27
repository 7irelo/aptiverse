using System.Security.Claims;
using Aptiverse.Identity.Domain;
using Aptiverse.SharedKernel.Authorization;
using Aptiverse.SharedKernel.Results;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Routing;

namespace Aptiverse.Identity.Features.CancelAccountDeletion;

internal static class CancelAccountDeletionEndpoint
{
    public static void Map(RouteGroupBuilder group)
    {
        group.MapDelete("/deletion-request", HandleAsync)
            .WithName("cancelAccountDeletion")
            .WithSummary("Cancel your pending deletion request")
            .WithDescription("Idempotent: 204 also when nothing is pending. 409 identity.erasure_in_progress once erasure has started.")
            .RequirePermission(Permissions.Account.Manage)
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .ProducesProblem(StatusCodes.Status403Forbidden)
            .ProducesProblem(StatusCodes.Status409Conflict);
    }

    private static async Task<Results<NoContent, ProblemHttpResult>> HandleAsync(
        ClaimsPrincipal user,
        CancelAccountDeletionHandler handler,
        HttpContext context,
        CancellationToken cancellationToken)
    {
        var result = await handler.HandleAsync(user.GetRequiredUserId(), RequestInfo.From(context), cancellationToken);
        return result.IsSuccess ? TypedResults.NoContent() : result.ToProblem();
    }
}
