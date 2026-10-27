using System.Security.Claims;
using Aptiverse.SharedKernel.Authorization;
using Aptiverse.SharedKernel.Results;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;

namespace Aptiverse.Progress.Features.AbandonGoal;

internal static class AbandonGoalEndpoint
{
    public static void Map(RouteGroupBuilder group)
    {
        group.MapDelete("/goals/{id:guid}", HandleAsync)
            .WithName("abandonGoal")
            .WithSummary("Abandon or remove one of your goals")
            .WithDescription(
                "An open goal becomes abandoned and stays in your history; a finished goal (achieved, expired or " +
                "abandoned) is removed from the list. Requires If-Match with the goal's ETag. Removing it again is 204.")
            .RequirePermission(Permissions.Progress.ManageGoals)
            .RequireRateLimiting(ProgressRateLimiting.GoalWrite)
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .ProducesProblem(StatusCodes.Status403Forbidden)
            .ProducesProblem(StatusCodes.Status404NotFound)
            .ProducesProblem(StatusCodes.Status412PreconditionFailed)
            .ProducesProblem(StatusCodes.Status428PreconditionRequired)
            .ProducesProblem(StatusCodes.Status429TooManyRequests);
    }

    private static async Task<Results<NoContent, ProblemHttpResult>> HandleAsync(
        Guid id,
        [FromHeader(Name = "If-Match")] string? ifMatch,
        ClaimsPrincipal user,
        AbandonGoalHandler handler,
        CancellationToken cancellationToken)
    {
        var result = await handler.HandleAsync(user.GetRequiredUserId(), id, ifMatch, cancellationToken);
        return result.IsSuccess ? TypedResults.NoContent() : result.ToProblem();
    }
}
