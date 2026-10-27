using System.Security.Claims;
using Aptiverse.SharedKernel.Authorization;
using Aptiverse.SharedKernel.Results;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Routing;

namespace Aptiverse.Family.Features.GetChildSummary;

internal static class GetChildSummaryEndpoint
{
    public static void Map(RouteGroupBuilder group)
    {
        group.MapGet("/children/{studentId:guid}/summary", HandleAsync)
            .WithName("getFamilyChildSummary")
            .WithSummary("See what one of your children shares with you")
            .WithDescription(
                "Each block has shared: false and no data when the child does not share it. A student who is not linked " +
                "to you is 404 family.child_not_found, never 403. Tutor conversations are never shown, only counts.")
            .RequirePermission(Permissions.Family.Parent)
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .ProducesProblem(StatusCodes.Status403Forbidden)
            .ProducesProblem(StatusCodes.Status404NotFound);
    }

    private static async Task<Results<Ok<ChildSummary>, ProblemHttpResult>> HandleAsync(
        Guid studentId,
        ClaimsPrincipal user,
        GetChildSummaryHandler handler,
        CancellationToken cancellationToken)
    {
        var result = await handler.HandleAsync(user.GetRequiredUserId(), studentId, cancellationToken);
        return result.IsSuccess ? TypedResults.Ok(result.Value) : result.ToProblem();
    }
}
