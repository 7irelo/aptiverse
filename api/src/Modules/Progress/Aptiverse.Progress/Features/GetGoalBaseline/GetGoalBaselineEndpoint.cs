using System.Security.Claims;
using Aptiverse.SharedKernel.Authorization;
using Aptiverse.SharedKernel.Results;
using Aptiverse.SharedKernel.Validation;
using FluentValidation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Routing;

namespace Aptiverse.Progress.Features.GetGoalBaseline;

internal static class GetGoalBaselineEndpoint
{
    public static void Map(RouteGroupBuilder group)
    {
        group.MapGet("/goals/baseline", HandleAsync)
            .WithName("getGoalBaseline")
            .WithSummary("Where you are now, for the goal form")
            .WithDescription(
                "The baseline a new goal would be measured against and the smallest target the baseline rule accepts. " +
                "Count goals count from today, so their baseline is 0. A null baseline means no evidence yet.")
            .RequirePermission(Permissions.Progress.ManageGoals)
            .WithValidation<GetGoalBaselineRequest>()
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .ProducesProblem(StatusCodes.Status403Forbidden)
            .ProducesProblem(StatusCodes.Status404NotFound);
    }

    private static async Task<Results<Ok<GoalPreview>, ProblemHttpResult>> HandleAsync(
        [AsParameters] GetGoalBaselineRequest request,
        ClaimsPrincipal user,
        GetGoalBaselineHandler handler,
        CancellationToken cancellationToken)
    {
        var result = await handler.HandleAsync(user.GetRequiredUserId(), request, cancellationToken);
        return result.IsSuccess ? TypedResults.Ok(result.Value) : result.ToProblem();
    }
}
