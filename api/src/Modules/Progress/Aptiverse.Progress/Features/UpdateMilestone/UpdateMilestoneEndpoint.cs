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

namespace Aptiverse.Progress.Features.UpdateMilestone;

internal static class UpdateMilestoneEndpoint
{
    public const long MaxBodyBytes = 4 * 1024;

    public static void Map(RouteGroupBuilder group)
    {
        group.MapPatch("/goals/{id:guid}/milestones/{milestoneId:guid}", HandleAsync)
            .WithName("updateGoalMilestone")
            .WithSummary("Change a milestone of one of your goals")
            .WithDescription(
                "Requires If-Match with the goal's ETag. A reached milestone keeps its threshold (409 " +
                "goal.milestone_reached). The ETag header is the goal's new version.")
            .RequirePermission(Permissions.Progress.ManageGoals)
            .RequireRateLimiting(ProgressRateLimiting.GoalWrite)
            .WithMetadata(new RequestSizeLimitAttribute(MaxBodyBytes))
            .WithValidation<UpdateMilestoneRequest>()
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .ProducesProblem(StatusCodes.Status403Forbidden)
            .ProducesProblem(StatusCodes.Status404NotFound)
            .ProducesProblem(StatusCodes.Status409Conflict)
            .ProducesProblem(StatusCodes.Status412PreconditionFailed)
            .ProducesProblem(StatusCodes.Status428PreconditionRequired)
            .ProducesProblem(StatusCodes.Status429TooManyRequests);
    }

    private static async Task<Results<Ok<MilestoneView>, ProblemHttpResult>> HandleAsync(
        Guid id,
        Guid milestoneId,
        UpdateMilestoneRequest request,
        [FromHeader(Name = "If-Match")] string? ifMatch,
        ClaimsPrincipal user,
        UpdateMilestoneHandler handler,
        HttpResponse response,
        CancellationToken cancellationToken)
    {
        var result = await handler.HandleAsync(user.GetRequiredUserId(), id, milestoneId, request, ifMatch, cancellationToken);
        if (result.IsFailure)
        {
            return result.ToProblem();
        }

        response.Headers.ETag = result.Value.ETag;
        return TypedResults.Ok(result.Value.Value);
    }
}
