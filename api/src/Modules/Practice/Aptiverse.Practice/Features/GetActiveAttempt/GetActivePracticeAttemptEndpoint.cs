using System.Security.Claims;
using Aptiverse.SharedKernel.Authorization;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Routing;

namespace Aptiverse.Practice.Features.GetActiveAttempt;

internal static class GetActivePracticeAttemptEndpoint
{
    public static void Map(RouteGroupBuilder group)
    {
        group.MapGet("/attempts/active", HandleAsync)
            .WithName("getActivePracticeAttempt")
            .WithSummary("Your practice test in progress, if any")
            .WithDescription("For the \"test in progress\" banner. 204 when there is none.")
            .RequirePermission(Permissions.Practice.Take)
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .ProducesProblem(StatusCodes.Status403Forbidden);
    }

    private static async Task<Results<Ok<ActiveAttemptView>, NoContent>> HandleAsync(
        ClaimsPrincipal user,
        GetActivePracticeAttemptHandler handler,
        HttpResponse response,
        CancellationToken cancellationToken)
    {
        response.Headers.CacheControl = "no-store";
        var view = await handler.HandleAsync(user.GetRequiredUserId(), cancellationToken);
        return view is null ? TypedResults.NoContent() : TypedResults.Ok(view);
    }
}
