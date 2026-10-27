using System.Security.Claims;
using Aptiverse.SharedKernel.Authorization;
using Aptiverse.SharedKernel.Results;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Routing;

namespace Aptiverse.Academics.Features.GetMyUnit;

internal static class GetMyUnitEndpoint
{
    public static void Map(RouteGroupBuilder group)
    {
        group.MapGet("/units/{id:guid}", HandleAsync)
            .WithName("getMyUnit")
            .WithSummary("Get one of your subjects or courses")
            .WithDescription("The id is the enrolment id from listMyUnits. The ETag header is the version for If-Match on updateMyUnit.")
            .RequirePermission(Permissions.Academics.Manage)
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .ProducesProblem(StatusCodes.Status403Forbidden);
    }

    private static async Task<Results<Ok<UnitDetailResponse>, ProblemHttpResult>> HandleAsync(
        Guid id,
        ClaimsPrincipal user,
        GetMyUnitHandler handler,
        HttpResponse response,
        CancellationToken cancellationToken)
    {
        var result = await handler.HandleAsync(user.GetRequiredUserId(), id, cancellationToken);
        if (result.IsFailure)
        {
            return result.ToProblem();
        }

        response.Headers.ETag = result.Value.ETag;
        return TypedResults.Ok(result.Value.Detail);
    }
}
