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

namespace Aptiverse.Progress.Features.AddMilestone;

internal static class AddMilestoneEndpoint
{
    public const long MaxBodyBytes = 4 * 1024;

    public static void Map(RouteGroupBuilder group)
    {
        group.MapPost("/goals/{id:guid}/milestones", HandleAsync)
            .WithName("addGoalMilestone")
            .WithSummary("Add a milestone to one of your goals")
            .WithDescription(
                "Appended unless a position is given. Thresholds must increase by position and stay below the target " +
                "(400 goal.invalid_milestones); at most 5 (409 goal.milestone_limit); not on a finished goal (409 " +
                "goal.locked). A milestone already passed is marked reached at once. The ETag header is the goal's new version.")
            .RequirePermission(Permissions.Progress.ManageGoals)
            .RequireRateLimiting(ProgressRateLimiting.GoalWrite)
            .WithMetadata(new RequestSizeLimitAttribute(MaxBodyBytes))
            .WithValidation<AddMilestoneRequest>()
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .ProducesProblem(StatusCodes.Status403Forbidden)
            .ProducesProblem(StatusCodes.Status404NotFound)
            .ProducesProblem(StatusCodes.Status409Conflict)
            .ProducesProblem(StatusCodes.Status412PreconditionFailed)
            .ProducesProblem(StatusCodes.Status429TooManyRequests);
    }

    private static async Task<Results<Created<MilestoneView>, ProblemHttpResult>> HandleAsync(
        Guid id,
        AddMilestoneRequest request,
        ClaimsPrincipal user,
        AddMilestoneHandler handler,
        HttpResponse response,
        CancellationToken cancellationToken)
    {
        var result = await handler.HandleAsync(user.GetRequiredUserId(), id, request, cancellationToken);
        if (result.IsFailure)
        {
            return result.ToProblem();
        }

        response.Headers.ETag = result.Value.ETag;
        return TypedResults.Created($"/progress/goals/{id}", result.Value.Value);
    }
}
