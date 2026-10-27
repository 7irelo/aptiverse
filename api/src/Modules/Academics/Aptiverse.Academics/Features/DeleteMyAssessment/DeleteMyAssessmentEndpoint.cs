using System.Security.Claims;
using Aptiverse.SharedKernel.Authorization;
using Aptiverse.SharedKernel.Results;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Routing;

namespace Aptiverse.Academics.Features.DeleteMyAssessment;

internal static class DeleteMyAssessmentEndpoint
{
    public static void Map(RouteGroupBuilder group)
    {
        group.MapDelete("/assessments/{id:guid}", HandleAsync)
            .WithName("deleteMyAssessment")
            .WithSummary("Delete one of your assessments")
            .RequirePermission(Permissions.Academics.Manage)
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .ProducesProblem(StatusCodes.Status403Forbidden);
    }

    private static async Task<Results<NoContent, ProblemHttpResult>> HandleAsync(
        Guid id,
        ClaimsPrincipal user,
        DeleteMyAssessmentHandler handler,
        CancellationToken cancellationToken)
    {
        var result = await handler.HandleAsync(user.GetRequiredUserId(), id, cancellationToken);
        return result.IsSuccess ? TypedResults.NoContent() : result.ToProblem();
    }
}
