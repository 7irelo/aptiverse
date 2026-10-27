using System.Security.Claims;
using Aptiverse.Practice.Features.Common;
using Aptiverse.SharedKernel.Authorization;
using Aptiverse.SharedKernel.Results;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Routing;

namespace Aptiverse.Practice.Features.ResumeAttempt;

internal static class ResumePracticeAttemptEndpoint
{
    public static void Map(RouteGroupBuilder group)
    {
        group.MapPost("/attempts/{id:guid}/resume", HandleAsync)
            .WithName("resumePracticeAttempt")
            .WithSummary("Resume a paused attempt")
            .WithDescription("Resuming an attempt that is not paused returns its state.")
            .RequirePermission(Permissions.Practice.Take)
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .ProducesProblem(StatusCodes.Status403Forbidden)
            .ProducesProblem(StatusCodes.Status404NotFound)
            .ProducesProblem(StatusCodes.Status409Conflict);
    }

    private static async Task<Results<Ok<AttemptState>, ProblemHttpResult>> HandleAsync(
        Guid id,
        ClaimsPrincipal user,
        ResumePracticeAttemptHandler handler,
        CancellationToken cancellationToken)
    {
        var result = await handler.HandleAsync(user.GetRequiredUserId(), id, cancellationToken);
        return result.IsSuccess ? TypedResults.Ok(result.Value) : result.ToProblem();
    }
}
