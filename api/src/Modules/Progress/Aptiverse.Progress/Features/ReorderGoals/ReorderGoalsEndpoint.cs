using System.Security.Claims;
using Aptiverse.SharedKernel.Authorization;
using Aptiverse.SharedKernel.Results;
using Aptiverse.SharedKernel.Validation;
using FluentValidation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;

namespace Aptiverse.Progress.Features.ReorderGoals;

internal static class ReorderGoalsEndpoint
{
    public const long MaxBodyBytes = 4 * 1024;

    public static void Map(RouteGroupBuilder group)
    {
        group.MapPatch("/goals/reorder", HandleAsync)
            .WithName("reorderGoals")
            .WithSummary("Reorder your open goals")
            .WithDescription("Send exactly your active and at-risk goal ids in display order (400 goal.reorder_mismatch). Idempotent.")
            .RequirePermission(Permissions.Progress.ManageGoals)
            .RequireRateLimiting(ProgressRateLimiting.GoalWrite)
            .WithMetadata(new RequestSizeLimitAttribute(MaxBodyBytes))
            .WithValidation<ReorderGoalsRequest>()
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .ProducesProblem(StatusCodes.Status403Forbidden)
            .ProducesProblem(StatusCodes.Status429TooManyRequests);
    }

    private static async Task<Results<NoContent, ProblemHttpResult>> HandleAsync(
        ReorderGoalsRequest request,
        ClaimsPrincipal user,
        ReorderGoalsHandler handler,
        CancellationToken cancellationToken)
    {
        var result = await handler.HandleAsync(user.GetRequiredUserId(), request, cancellationToken);
        return result.IsSuccess ? TypedResults.NoContent() : result.ToProblem();
    }
}
