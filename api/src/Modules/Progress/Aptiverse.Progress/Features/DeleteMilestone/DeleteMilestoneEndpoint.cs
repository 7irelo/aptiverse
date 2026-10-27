using System.Security.Claims;
using Aptiverse.SharedKernel.Authorization;
using Aptiverse.SharedKernel.Results;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Routing;

namespace Aptiverse.Progress.Features.DeleteMilestone;

internal static class DeleteMilestoneEndpoint
{
    public static void Map(RouteGroupBuilder group)
    {
        group.MapDelete("/goals/{id:guid}/milestones/{milestoneId:guid}", HandleAsync)
            .WithName("deleteGoalMilestone")
            .WithSummary("Delete a milestone of one of your goals")
            .WithDescription("Remaining milestones move up to fill the gap. Deleting one that is already gone is 204.")
            .RequirePermission(Permissions.Progress.ManageGoals)
            .RequireRateLimiting(ProgressRateLimiting.GoalWrite)
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .ProducesProblem(StatusCodes.Status403Forbidden)
            .ProducesProblem(StatusCodes.Status404NotFound)
            .ProducesProblem(StatusCodes.Status409Conflict)
            .ProducesProblem(StatusCodes.Status429TooManyRequests);
    }

    private static async Task<Results<NoContent, ProblemHttpResult>> HandleAsync(
        Guid id,
        Guid milestoneId,
        ClaimsPrincipal user,
        DeleteMilestoneHandler handler,
        CancellationToken cancellationToken)
    {
        var result = await handler.HandleAsync(user.GetRequiredUserId(), id, milestoneId, cancellationToken);
        return result.IsSuccess ? TypedResults.NoContent() : result.ToProblem();
    }
}
