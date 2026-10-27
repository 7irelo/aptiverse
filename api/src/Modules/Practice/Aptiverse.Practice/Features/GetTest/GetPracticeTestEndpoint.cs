using System.Security.Claims;
using Aptiverse.SharedKernel.Authorization;
using Aptiverse.SharedKernel.Results;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Routing;

namespace Aptiverse.Practice.Features.GetTest;

internal static class GetPracticeTestEndpoint
{
    public static void Map(RouteGroupBuilder group)
    {
        group.MapGet("/tests/{id:guid}", HandleAsync)
            .WithName("getPracticeTest")
            .WithSummary("Get the instructions of one of your practice tests")
            .WithDescription("Never includes answers. While the test's attempt is active it includes the attempt state for resuming.")
            .RequirePermission(Permissions.Practice.Read)
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .ProducesProblem(StatusCodes.Status403Forbidden)
            .ProducesProblem(StatusCodes.Status404NotFound);
    }

    private static async Task<Results<Ok<PracticeTestInstructions>, ProblemHttpResult>> HandleAsync(
        Guid id,
        ClaimsPrincipal user,
        GetPracticeTestHandler handler,
        HttpResponse response,
        CancellationToken cancellationToken)
    {
        response.Headers.CacheControl = "no-store";
        var result = await handler.HandleAsync(user.GetRequiredUserId(), id, cancellationToken);
        return result.IsSuccess ? TypedResults.Ok(result.Value) : result.ToProblem();
    }
}
