using System.Security.Claims;
using Aptiverse.Academics.Features.Common;
using Aptiverse.SharedKernel.Authorization;
using Aptiverse.SharedKernel.Results;
using Aptiverse.SharedKernel.Validation;
using FluentValidation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Routing;

namespace Aptiverse.Academics.Features.TransitionAssessment;

internal static class TransitionAssessmentEndpoint
{
    public static void Map(RouteGroupBuilder group)
    {
        group.MapPost("/assessments/{id:guid}/transition", HandleAsync)
            .WithName("transitionAssessment")
            .WithSummary("Move one of your assessments through its lifecycle")
            .RequirePermission(Permissions.Academics.Manage)
            .WithValidation<TransitionAssessmentRequest>()
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .ProducesProblem(StatusCodes.Status403Forbidden);
    }

    private static async Task<Results<Ok<AssessmentView>, ProblemHttpResult>> HandleAsync(
        Guid id,
        TransitionAssessmentRequest request,
        ClaimsPrincipal user,
        TransitionAssessmentHandler handler,
        CancellationToken cancellationToken)
    {
        var result = await handler.HandleAsync(user.GetRequiredUserId(), id, request, cancellationToken);
        return result.IsSuccess ? TypedResults.Ok(result.Value) : result.ToProblem();
    }
}
