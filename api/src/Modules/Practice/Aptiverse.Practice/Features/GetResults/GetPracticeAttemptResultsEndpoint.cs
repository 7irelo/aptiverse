using System.Security.Claims;
using Aptiverse.SharedKernel.Authorization;
using Aptiverse.SharedKernel.Results;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Routing;

namespace Aptiverse.Practice.Features.GetResults;

internal static class GetPracticeAttemptResultsEndpoint
{
    public static void Map(RouteGroupBuilder group)
    {
        group.MapGet("/attempts/{id:guid}/results", HandleAsync)
            .WithName("getPracticeAttemptResults")
            .WithSummary("Get the marked paper of one of your attempts")
            .WithDescription("409 practice.results_not_ready while the attempt is in progress or paused.")
            .RequirePermission(Permissions.Practice.Read)
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .ProducesProblem(StatusCodes.Status403Forbidden)
            .ProducesProblem(StatusCodes.Status404NotFound)
            .ProducesProblem(StatusCodes.Status409Conflict);
    }

    private static async Task<Results<Ok<AttemptResults>, ProblemHttpResult>> HandleAsync(
        Guid id,
        ClaimsPrincipal user,
        GetPracticeAttemptResultsHandler handler,
        HttpResponse response,
        CancellationToken cancellationToken)
    {
        response.Headers.CacheControl = "no-store";
        var result = await handler.HandleAsync(user.GetRequiredUserId(), id, cancellationToken);
        return result.IsSuccess ? TypedResults.Ok(result.Value) : result.ToProblem();
    }
}
