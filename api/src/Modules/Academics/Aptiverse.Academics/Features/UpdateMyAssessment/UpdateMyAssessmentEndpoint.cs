using System.Security.Claims;
using Aptiverse.Academics.Features.Common;
using Aptiverse.SharedKernel.Authorization;
using Aptiverse.SharedKernel.Results;
using Aptiverse.SharedKernel.Validation;
using FluentValidation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;

namespace Aptiverse.Academics.Features.UpdateMyAssessment;

internal static class UpdateMyAssessmentEndpoint
{
    public static void Map(RouteGroupBuilder group)
    {
        group.MapPatch("/assessments/{id:guid}", HandleAsync)
            .WithName("updateMyAssessment")
            .WithSummary("Edit one of your assessments")
            .WithDescription("Optional If-Match with the ETag from a previous response; a stale value returns 409.")
            .RequirePermission(Permissions.Academics.Manage)
            .WithValidation<UpdateMyAssessmentRequest>()
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .ProducesProblem(StatusCodes.Status403Forbidden);
    }

    private static async Task<Results<Ok<AssessmentView>, ProblemHttpResult>> HandleAsync(
        Guid id,
        UpdateMyAssessmentRequest request,
        [FromHeader(Name = "If-Match")] string? ifMatch,
        ClaimsPrincipal user,
        UpdateMyAssessmentHandler handler,
        HttpResponse response,
        CancellationToken cancellationToken)
    {
        var result = await handler.HandleAsync(user.GetRequiredUserId(), id, request, ifMatch, cancellationToken);
        if (result.IsFailure)
        {
            return result.ToProblem();
        }

        response.Headers.ETag = result.Value.ETag;
        return TypedResults.Ok(result.Value.View);
    }
}
