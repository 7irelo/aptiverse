using System.Security.Claims;
using Aptiverse.SharedKernel.Authorization;
using Aptiverse.SharedKernel.Results;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Routing;

namespace Aptiverse.Identity.Features.GetMe;

internal static class GetMeEndpoint
{
    public static void Map(RouteGroupBuilder group)
    {
        // Any signed-in caller, no permission: a user with a broken role map can still see who they are.
        group.MapGet(string.Empty, HandleAsync)
            .WithName("getMe")
            .WithSummary("Your account: profile, roles, permissions and onboarding state")
            .WithDescription("Permissions come from the server's role map; the web app gates navigation on them. Never cached.")
            .RequireAuthorization()
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .ProducesProblem(StatusCodes.Status404NotFound);
    }

    private static async Task<Results<Ok<MeResponse>, ProblemHttpResult>> HandleAsync(
        ClaimsPrincipal user,
        GetMeHandler handler,
        CancellationToken cancellationToken)
    {
        var result = await handler.HandleAsync(user.GetRequiredUserId(), user.GetSessionId(), cancellationToken);
        return result.IsSuccess ? TypedResults.Ok(result.Value) : result.ToProblem();
    }
}
