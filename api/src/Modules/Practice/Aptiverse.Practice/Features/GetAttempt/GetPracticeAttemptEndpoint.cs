using System.Security.Claims;
using Aptiverse.Practice.Features.Common;
using Aptiverse.SharedKernel.Authorization;
using Aptiverse.SharedKernel.Results;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Routing;

namespace Aptiverse.Practice.Features.GetAttempt;

internal static class GetPracticeAttemptEndpoint
{
    public static void Map(RouteGroupBuilder group)
    {
        group.MapGet("/attempts/{id:guid}", HandleAsync)
            .WithName("getPracticeAttempt")
            .WithSummary("Get one of your attempts to resume it")
            .WithDescription("While active: questions, saved answers, remainingSeconds and serverNow. Once submitted: status and resultsUrl only.")
            .RequirePermission(Permissions.Practice.Take)
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .ProducesProblem(StatusCodes.Status403Forbidden)
            .ProducesProblem(StatusCodes.Status404NotFound);
    }

    private static async Task<Results<Ok<AttemptState>, ProblemHttpResult>> HandleAsync(
        Guid id,
        ClaimsPrincipal user,
        GetPracticeAttemptHandler handler,
        HttpResponse response,
        CancellationToken cancellationToken)
    {
        response.Headers.CacheControl = "no-store";
        var result = await handler.HandleAsync(user.GetRequiredUserId(), id, cancellationToken);
        return result.IsSuccess ? TypedResults.Ok(result.Value) : result.ToProblem();
    }
}
