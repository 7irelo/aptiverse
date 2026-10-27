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

namespace Aptiverse.Academics.Features.RecordAssessmentMark;

internal static class RecordAssessmentMarkEndpoint
{
    public static void Map(RouteGroupBuilder group)
    {
        group.MapPost("/assessments/{id:guid}/mark", HandleAsync)
            .WithName("recordAssessmentMark")
            .WithSummary("Record the mark of one of your assessments")
            .WithDescription("Grades the assessment and returns it with the unit's refreshed weighting.")
            .RequirePermission(Permissions.Academics.Manage)
            .WithValidation<RecordAssessmentMarkRequest>()
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .ProducesProblem(StatusCodes.Status403Forbidden);
    }

    private static async Task<Results<Ok<AssessmentView>, ProblemHttpResult>> HandleAsync(
        Guid id,
        RecordAssessmentMarkRequest request,
        ClaimsPrincipal user,
        RecordAssessmentMarkHandler handler,
        CancellationToken cancellationToken)
    {
        var result = await handler.HandleAsync(user.GetRequiredUserId(), id, request, cancellationToken);
        return result.IsSuccess ? TypedResults.Ok(result.Value) : result.ToProblem();
    }
}
