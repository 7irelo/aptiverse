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

namespace Aptiverse.Progress.Features.UpdateGoal;

internal static class UpdateGoalEndpoint
{
    public const long MaxBodyBytes = 4 * 1024;

    public static void Map(RouteGroupBuilder group)
    {
        group.MapPatch("/goals/{id:guid}", HandleAsync)
            .WithName("updateGoal")
            .WithSummary("Change one of your goals")
            .WithDescription(
                "Requires If-Match with the goal's ETag (428 goal.if_match_required, 412 goal.version_mismatch). " +
                "An achieved goal is locked: only title, description and sort order change (409 goal.locked). A new " +
                "target is checked against a freshly measured baseline.")
            .RequirePermission(Permissions.Progress.ManageGoals)
            .RequireRateLimiting(ProgressRateLimiting.GoalWrite)
            .WithMetadata(new RequestSizeLimitAttribute(MaxBodyBytes))
            .WithValidation<UpdateGoalRequest>()
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .ProducesProblem(StatusCodes.Status403Forbidden)
            .ProducesProblem(StatusCodes.Status404NotFound)
            .ProducesProblem(StatusCodes.Status409Conflict)
            .ProducesProblem(StatusCodes.Status412PreconditionFailed)
            .ProducesProblem(StatusCodes.Status428PreconditionRequired)
            .ProducesProblem(StatusCodes.Status429TooManyRequests);
    }

    private static async Task<Results<Ok<GoalView>, ProblemHttpResult>> HandleAsync(
        Guid id,
        UpdateGoalRequest request,
        [FromHeader(Name = "If-Match")] string? ifMatch,
        ClaimsPrincipal user,
        UpdateGoalHandler handler,
        HttpResponse response,
        CancellationToken cancellationToken)
    {
        var result = await handler.HandleAsync(user.GetRequiredUserId(), id, request, ifMatch, cancellationToken);
        if (result.IsFailure)
        {
            return result.ToProblem();
        }

        response.Headers.ETag = result.Value.ETag;
        return TypedResults.Ok(result.Value.View);
    }
}
