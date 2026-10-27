using System.Security.Claims;
using Aptiverse.SharedKernel.Authorization;
using Aptiverse.SharedKernel.Results;
using Aptiverse.SharedKernel.Validation;
using FluentValidation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Routing;

namespace Aptiverse.Academics.Features.UnenrolFromUnit;

internal static class UnenrolFromUnitEndpoint
{
    public static void Map(RouteGroupBuilder group)
    {
        group.MapDelete("/units/{id:guid}", HandleAsync)
            .WithName("unenrolFromUnit")
            .WithSummary("Remove one of your subjects or courses")
            .WithDescription("Deletes the enrolment and its assessments. Pass confirm=true when it has marks (409 academics.unit_has_marks otherwise).")
            .RequirePermission(Permissions.Academics.Manage)
            .WithValidation<UnenrolFromUnitRequest>()
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .ProducesProblem(StatusCodes.Status403Forbidden);
    }

    private static async Task<Results<NoContent, ProblemHttpResult>> HandleAsync(
        Guid id,
        [AsParameters] UnenrolFromUnitRequest request,
        ClaimsPrincipal user,
        UnenrolFromUnitHandler handler,
        CancellationToken cancellationToken)
    {
        var result = await handler.HandleAsync(user.GetRequiredUserId(), id, request, cancellationToken);
        return result.IsSuccess ? TypedResults.NoContent() : result.ToProblem();
    }
}
