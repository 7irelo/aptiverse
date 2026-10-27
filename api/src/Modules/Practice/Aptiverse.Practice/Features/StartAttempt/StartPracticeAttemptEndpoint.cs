using System.Security.Claims;
using Aptiverse.Practice.Features.Common;
using Aptiverse.SharedKernel.Authorization;
using Aptiverse.SharedKernel.Results;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Routing;

namespace Aptiverse.Practice.Features.StartAttempt;

internal static class StartPracticeAttemptEndpoint
{
    public static void Map(RouteGroupBuilder group)
    {
        group.MapPost("/tests/{id:guid}/attempts", HandleAsync)
            .WithName("startPracticeAttempt")
            .WithSummary("Start your one attempt at a practice test")
            .WithDescription(
                "Call after the student has read the instructions; questions are only ever sent from here on. Any body " +
                "is ignored: times come from the server clock. Each test can be attempted once (409 practice.attempt_exists " +
                "with attemptId) and only one attempt can be active at a time (409 practice.other_attempt_active).")
            .RequirePermission(Permissions.Practice.Take)
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .ProducesProblem(StatusCodes.Status403Forbidden)
            .ProducesProblem(StatusCodes.Status404NotFound)
            .ProducesProblem(StatusCodes.Status409Conflict);
    }

    private static async Task<Results<Created<AttemptState>, ProblemHttpResult>> HandleAsync(
        Guid id,
        ClaimsPrincipal user,
        StartPracticeAttemptHandler handler,
        CancellationToken cancellationToken)
    {
        var result = await handler.HandleAsync(user.GetRequiredUserId(), id, cancellationToken);
        return result.IsSuccess
            ? TypedResults.Created(PracticeUrls.Attempt(result.Value.AttemptId), result.Value)
            : result.ToProblem();
    }
}
