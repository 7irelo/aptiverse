using System.Security.Claims;
using Aptiverse.Academics.Features.Common;
using Aptiverse.SharedKernel.Authorization;
using Aptiverse.SharedKernel.Results;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Routing;

namespace Aptiverse.Academics.Features.GetMyAssessment;

internal static class GetMyAssessmentEndpoint
{
    public static void Map(RouteGroupBuilder group)
    {
        group.MapGet("/assessments/{id:guid}", HandleAsync)
            .WithName("getMyAssessment")
            .WithSummary("Get one of your assessments")
            .WithDescription("Includes the actions allowed from its state. The ETag header is the version for If-Match on updateMyAssessment.")
            .RequirePermission(Permissions.Academics.Manage)
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .ProducesProblem(StatusCodes.Status403Forbidden);
    }

    private static async Task<Results<Ok<AssessmentView>, ProblemHttpResult>> HandleAsync(
        Guid id,
        ClaimsPrincipal user,
        GetMyAssessmentHandler handler,
        HttpResponse response,
        CancellationToken cancellationToken)
    {
        var result = await handler.HandleAsync(user.GetRequiredUserId(), id, cancellationToken);
        if (result.IsFailure)
        {
            return result.ToProblem();
        }

        response.Headers.ETag = result.Value.ETag;
        return TypedResults.Ok(result.Value.View);
    }
}
