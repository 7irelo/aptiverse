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

namespace Aptiverse.Progress.Features.CreateGoal;

internal static class CreateGoalEndpoint
{
    public const long MaxBodyBytes = 4 * 1024;

    public static void Map(RouteGroupBuilder group)
    {
        group.MapPost("/goals", HandleAsync)
            .WithName("createGoal")
            .WithSummary("Create a goal measured from your own work")
            .WithDescription(
                "Count goals count work from now. Threshold goals must aim above where you are now: a target at or " +
                "below the measured baseline is refused with 409 goal.target_not_above_baseline (baseline extension). " +
                "Optional Idempotency-Key header (8 to 64 letters, digits, dashes or underscores): a replay returns the " +
                "original goal. The ETag header is the version for If-Match on later changes.")
            .RequirePermission(Permissions.Progress.ManageGoals)
            .RequireRateLimiting(ProgressRateLimiting.GoalCreate)
            .WithMetadata(new RequestSizeLimitAttribute(MaxBodyBytes))
            .WithValidation<CreateGoalRequest>()
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .ProducesProblem(StatusCodes.Status403Forbidden)
            .ProducesProblem(StatusCodes.Status404NotFound)
            .ProducesProblem(StatusCodes.Status409Conflict)
            .ProducesProblem(StatusCodes.Status429TooManyRequests);
    }

    private static async Task<Results<Created<GoalView>, ProblemHttpResult>> HandleAsync(
        CreateGoalRequest request,
        [FromHeader(Name = "Idempotency-Key")] string? idempotencyKey,
        ClaimsPrincipal user,
        CreateGoalHandler handler,
        HttpResponse response,
        CancellationToken cancellationToken)
    {
        var result = await handler.HandleAsync(user.GetRequiredUserId(), request, idempotencyKey, cancellationToken);
        if (result.IsFailure)
        {
            return result.ToProblem();
        }

        response.Headers.ETag = result.Value.ETag;
        return TypedResults.Created($"/progress/goals/{result.Value.View.Id}", result.Value.View);
    }
}
