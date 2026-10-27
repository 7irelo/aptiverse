using System.Security.Claims;
using Aptiverse.SharedKernel.Authorization;
using Aptiverse.SharedKernel.Results;
using Aptiverse.SharedKernel.Validation;
using FluentValidation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Routing;

namespace Aptiverse.Academics.Features.EnrolInCapsSubjects;

internal static class EnrolInCapsSubjectsEndpoint
{
    public static void Map(RouteGroupBuilder group)
    {
        group.MapPost("/units/caps", HandleAsync)
            .WithName("enrolInCapsSubjects")
            .WithSummary("Add CAPS subjects")
            .WithDescription("High school students only. Returns 201 when anything new was added, 200 when every subject was already yours.")
            .RequirePermission(Permissions.Academics.Manage)
            .RequireRateLimiting(AcademicsRateLimiting.Write)
            .WithValidation<EnrolInCapsSubjectsRequest>()
            .ProducesProblem(StatusCodes.Status401Unauthorized);
    }

    private static async Task<Results<Created<EnrolInCapsSubjectsResponse>, Ok<EnrolInCapsSubjectsResponse>, ProblemHttpResult>> HandleAsync(
        EnrolInCapsSubjectsRequest request,
        ClaimsPrincipal user,
        EnrolInCapsSubjectsHandler handler,
        CancellationToken cancellationToken)
    {
        var result = await handler.HandleAsync(user.GetRequiredUserId(), request, cancellationToken);
        if (result.IsFailure)
        {
            return result.ToProblem();
        }

        var (response, created) = result.Value;
        return created ? TypedResults.Created("/academics/units", response) : TypedResults.Ok(response);
    }
}
