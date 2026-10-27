using System.Security.Claims;
using Aptiverse.SharedKernel.Authorization;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Routing;

namespace Aptiverse.Practice.Features.GetActiveGeneration;

internal static class GetActiveGenerationEndpoint
{
    public static void Map(RouteGroupBuilder group)
    {
        group.MapGet("/generations/active", HandleAsync)
            .WithName("getActiveGeneration")
            .WithSummary("Your practice test generation in progress, if any")
            .WithDescription("Lets another device recover a generation started elsewhere. 204 when nothing is generating.")
            .RequirePermission(Permissions.Practice.Generate)
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .ProducesProblem(StatusCodes.Status403Forbidden);
    }

    private static async Task<Results<Ok<ActiveGenerationResponse>, NoContent>> HandleAsync(
        ClaimsPrincipal user,
        GetActiveGenerationHandler handler,
        HttpResponse response,
        CancellationToken cancellationToken)
    {
        response.Headers.CacheControl = "no-store";
        var active = await handler.HandleAsync(user.GetRequiredUserId(), cancellationToken);
        return active is null ? TypedResults.NoContent() : TypedResults.Ok(active);
    }
}
