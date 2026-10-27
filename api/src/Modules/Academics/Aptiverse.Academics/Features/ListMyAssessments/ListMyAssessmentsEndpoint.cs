using System.Security.Claims;
using Aptiverse.Academics.Features.Common;
using Aptiverse.SharedKernel.Authorization;
using Aptiverse.SharedKernel.Paging;
using Aptiverse.SharedKernel.Validation;
using FluentValidation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Routing;

namespace Aptiverse.Academics.Features.ListMyAssessments;

internal static class ListMyAssessmentsEndpoint
{
    public static void Map(RouteGroupBuilder group)
    {
        group.MapGet("/assessments", HandleAsync)
            .WithName("listMyAssessments")
            .WithSummary("List your assessments")
            .WithDescription("Your assessments across units, filtered and paged, by due date.")
            .RequirePermission(Permissions.Academics.Manage)
            .WithValidation<ListMyAssessmentsRequest>()
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .ProducesProblem(StatusCodes.Status403Forbidden);
    }

    private static async Task<Ok<PagedResult<AssessmentListItem>>> HandleAsync(
        [AsParameters] ListMyAssessmentsRequest request,
        ClaimsPrincipal user,
        ListMyAssessmentsHandler handler,
        CancellationToken cancellationToken) =>
        TypedResults.Ok(await handler.HandleAsync(user.GetRequiredUserId(), request, cancellationToken));
}
