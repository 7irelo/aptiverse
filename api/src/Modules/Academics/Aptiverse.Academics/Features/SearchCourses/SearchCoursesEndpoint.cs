using System.Security.Claims;
using Aptiverse.SharedKernel.Authorization;
using Aptiverse.SharedKernel.Validation;
using FluentValidation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Routing;

namespace Aptiverse.Academics.Features.SearchCourses;

internal static class SearchCoursesEndpoint
{
    public static void Map(RouteGroupBuilder group)
    {
        group.MapGet("/courses", HandleAsync)
            .WithName("searchSharedCourses")
            .WithSummary("Search shared courses at your institution")
            .WithDescription("Courses other students at your catalog institution already created, for the course picker.")
            .RequirePermission(Permissions.Academics.Manage)
            .WithValidation<SearchCoursesRequest>()
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .ProducesProblem(StatusCodes.Status403Forbidden);
    }

    private static async Task<Ok<IReadOnlyList<CourseOption>>> HandleAsync(
        [AsParameters] SearchCoursesRequest request,
        ClaimsPrincipal user,
        SearchCoursesHandler handler,
        CancellationToken cancellationToken) =>
        TypedResults.Ok(await handler.HandleAsync(user.GetRequiredUserId(), request, cancellationToken));
}
