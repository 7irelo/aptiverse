using System.Security.Claims;
using Aptiverse.SharedKernel.Authorization;
using Aptiverse.SharedKernel.Results;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Routing;

namespace Aptiverse.Practice.Features.GetTestStatus;

internal static class GetPracticeTestStatusEndpoint
{
    public static void Map(RouteGroupBuilder group)
    {
        group.MapGet("/tests/{id:guid}/status", HandleAsync)
            .WithName("getPracticeTestStatus")
            .WithSummary("Poll the generation status of one of your practice tests")
            .RequirePermission(Permissions.Practice.Read)
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .ProducesProblem(StatusCodes.Status403Forbidden)
            .ProducesProblem(StatusCodes.Status404NotFound);
    }

    private static async Task<Results<Ok<GenerationStatusResponse>, ProblemHttpResult>> HandleAsync(
        Guid id,
        ClaimsPrincipal user,
        GetPracticeTestStatusHandler handler,
        HttpResponse response,
        CancellationToken cancellationToken)
    {
        response.Headers.CacheControl = "no-store";
        var result = await handler.HandleAsync(user.GetRequiredUserId(), id, cancellationToken);
        return result.IsSuccess ? TypedResults.Ok(result.Value) : result.ToProblem();
    }
}
