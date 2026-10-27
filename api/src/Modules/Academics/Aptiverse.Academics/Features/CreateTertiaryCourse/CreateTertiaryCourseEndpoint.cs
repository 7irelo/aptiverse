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

namespace Aptiverse.Academics.Features.CreateTertiaryCourse;

internal static class CreateTertiaryCourseEndpoint
{
    public static void Map(RouteGroupBuilder group)
    {
        group.MapPost("/units/courses", HandleAsync)
            .WithName("createTertiaryCourse")
            .WithSummary("Add a university course")
            .WithDescription("University students only. Joins the shared course when another student at your institution already created it.")
            .RequirePermission(Permissions.Academics.Manage)
            .RequireRateLimiting(AcademicsRateLimiting.Write)
            .WithValidation<CreateTertiaryCourseRequest>()
            .ProducesProblem(StatusCodes.Status401Unauthorized);
    }

    private static async Task<Results<Created<UnitSummary>, ProblemHttpResult>> HandleAsync(
        CreateTertiaryCourseRequest request,
        ClaimsPrincipal user,
        CreateTertiaryCourseHandler handler,
        CancellationToken cancellationToken)
    {
        var result = await handler.HandleAsync(user.GetRequiredUserId(), request, cancellationToken);
        return result.IsSuccess
            ? TypedResults.Created($"/academics/units/{result.Value.EnrolmentId}", result.Value)
            : result.ToProblem();
    }
}
