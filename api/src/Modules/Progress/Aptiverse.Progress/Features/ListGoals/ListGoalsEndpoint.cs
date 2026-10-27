using System.Security.Claims;
using Aptiverse.Progress.Features.Common;
using Aptiverse.SharedKernel.Authorization;
using Aptiverse.SharedKernel.Paging;
using Aptiverse.SharedKernel.Validation;
using FluentValidation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Routing;

namespace Aptiverse.Progress.Features.ListGoals;

internal static class ListGoalsEndpoint
{
    public static void Map(RouteGroupBuilder group)
    {
        group.MapGet("/goals", HandleAsync)
            .WithName("listGoals")
            .WithSummary("List your goals")
            .WithDescription("In your display order. status=active also returns at-risk goals. Progress is null until there is evidence.")
            .RequirePermission(Permissions.Progress.Read)
            .WithValidation<ListGoalsRequest>()
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .ProducesProblem(StatusCodes.Status403Forbidden);
    }

    private static async Task<Ok<PagedResult<GoalSummary>>> HandleAsync(
        [AsParameters] ListGoalsRequest request,
        ClaimsPrincipal user,
        ListGoalsHandler handler,
        CancellationToken cancellationToken) =>
        TypedResults.Ok(await handler.HandleAsync(user.GetRequiredUserId(), request, cancellationToken));
}
