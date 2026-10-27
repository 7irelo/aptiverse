using System.Security.Claims;
using Aptiverse.Progress.Features.Common;
using Aptiverse.SharedKernel.Authorization;
using Aptiverse.SharedKernel.Results;
using Aptiverse.SharedKernel.Validation;
using FluentValidation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;

namespace Aptiverse.Progress.Features.ReorderMilestones;

internal static class ReorderMilestonesEndpoint
{
    public const long MaxBodyBytes = 4 * 1024;

    public static void Map(RouteGroupBuilder group)
    {
        group.MapPatch("/goals/{id:guid}/milestones/order", HandleAsync)
            .WithName("reorderGoalMilestones")
            .WithSummary("Reorder the milestones of one of your goals")
            .WithDescription(
                "Send exactly the goal's milestone ids in the new order (400 goal.reorder_mismatch); thresholds must " +
                "still increase in that order (400 goal.invalid_milestones).")
            .RequirePermission(Permissions.Progress.ManageGoals)
            .RequireRateLimiting(ProgressRateLimiting.GoalWrite)
            .WithMetadata(new RequestSizeLimitAttribute(MaxBodyBytes))
            .WithValidation<ReorderMilestonesRequest>()
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .ProducesProblem(StatusCodes.Status403Forbidden)
            .ProducesProblem(StatusCodes.Status404NotFound)
            .ProducesProblem(StatusCodes.Status409Conflict)
            .ProducesProblem(StatusCodes.Status429TooManyRequests);
    }

    private static async Task<Results<Ok<IReadOnlyList<MilestoneView>>, ProblemHttpResult>> HandleAsync(
        Guid id,
        ReorderMilestonesRequest request,
        ClaimsPrincipal user,
        ReorderMilestonesHandler handler,
        HttpResponse response,
        CancellationToken cancellationToken)
    {
        var result = await handler.HandleAsync(user.GetRequiredUserId(), id, request, cancellationToken);
        if (result.IsFailure)
        {
            return result.ToProblem();
        }

        response.Headers.ETag = result.Value.ETag;
        return TypedResults.Ok(result.Value.Value);
    }
}
