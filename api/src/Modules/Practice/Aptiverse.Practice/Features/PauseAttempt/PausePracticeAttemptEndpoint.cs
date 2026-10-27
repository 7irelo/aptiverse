using System.Security.Claims;
using Aptiverse.Practice.Features.Common;
using Aptiverse.SharedKernel.Authorization;
using Aptiverse.SharedKernel.Results;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Routing;

namespace Aptiverse.Practice.Features.PauseAttempt;

internal static class PausePracticeAttemptEndpoint
{
    public static void Map(RouteGroupBuilder group)
    {
        group.MapPost("/attempts/{id:guid}/pause", HandleAsync)
            .WithName("pausePracticeAttempt")
            .WithSummary("Pause an untimed attempt")
            .WithDescription("Timed tests cannot pause (409 practice.pause_not_allowed). Pausing a paused attempt returns its state.")
            .RequirePermission(Permissions.Practice.Take)
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .ProducesProblem(StatusCodes.Status403Forbidden)
            .ProducesProblem(StatusCodes.Status404NotFound)
            .ProducesProblem(StatusCodes.Status409Conflict);
    }

    private static async Task<Results<Ok<AttemptState>, ProblemHttpResult>> HandleAsync(
        Guid id,
        ClaimsPrincipal user,
        PausePracticeAttemptHandler handler,
        CancellationToken cancellationToken)
    {
        var result = await handler.HandleAsync(user.GetRequiredUserId(), id, cancellationToken);
        return result.IsSuccess ? TypedResults.Ok(result.Value) : result.ToProblem();
    }
}
