using System.Security.Claims;
using Aptiverse.SharedKernel.Authorization;
using Aptiverse.SharedKernel.Results;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Routing;

namespace Aptiverse.Practice.Features.ArchiveTest;

internal static class ArchivePracticeTestEndpoint
{
    public static void Map(RouteGroupBuilder group)
    {
        group.MapDelete("/tests/{id:guid}", HandleAsync)
            .WithName("archivePracticeTest")
            .WithSummary("Remove one of your practice tests")
            .WithDescription(
                "A test you attempted is archived and stays in your history; one you never attempted is deleted. " +
                "409 practice.attempt_active while its attempt is in progress.")
            .RequirePermission(Permissions.Practice.Generate)
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .ProducesProblem(StatusCodes.Status403Forbidden)
            .ProducesProblem(StatusCodes.Status404NotFound)
            .ProducesProblem(StatusCodes.Status409Conflict);
    }

    private static async Task<Results<NoContent, ProblemHttpResult>> HandleAsync(
        Guid id,
        ClaimsPrincipal user,
        ArchivePracticeTestHandler handler,
        CancellationToken cancellationToken)
    {
        var result = await handler.HandleAsync(user.GetRequiredUserId(), id, cancellationToken);
        return result.IsSuccess ? TypedResults.NoContent() : result.ToProblem();
    }
}
