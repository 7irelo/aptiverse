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

namespace Aptiverse.Academics.Features.CreateAssessment;

internal static class CreateAssessmentEndpoint
{
    public static void Map(RouteGroupBuilder group)
    {
        group.MapPost("/assessments", HandleAsync)
            .WithName("createAssessment")
            .WithSummary("Add an assessment to one of your units")
            .RequirePermission(Permissions.Academics.Manage)
            .RequireRateLimiting(AcademicsRateLimiting.Write)
            .WithValidation<CreateAssessmentRequest>()
            .ProducesProblem(StatusCodes.Status401Unauthorized);
    }

    private static async Task<Results<Created<AssessmentView>, ProblemHttpResult>> HandleAsync(
        CreateAssessmentRequest request,
        ClaimsPrincipal user,
        CreateAssessmentHandler handler,
        CancellationToken cancellationToken)
    {
        var result = await handler.HandleAsync(user.GetRequiredUserId(), request, cancellationToken);
        return result.IsSuccess
            ? TypedResults.Created($"/academics/assessments/{result.Value.Id}", result.Value)
            : result.ToProblem();
    }
}
