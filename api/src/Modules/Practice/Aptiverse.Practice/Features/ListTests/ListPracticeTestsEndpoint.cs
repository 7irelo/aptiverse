using System.Security.Claims;
using Aptiverse.SharedKernel.Authorization;
using Aptiverse.SharedKernel.Paging;
using Aptiverse.SharedKernel.Validation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Routing;

namespace Aptiverse.Practice.Features.ListTests;

internal static class ListPracticeTestsEndpoint
{
    public static void Map(RouteGroupBuilder group)
    {
        group.MapGet("/tests", HandleAsync)
            .WithName("listPracticeTests")
            .WithSummary("List your practice tests")
            .WithDescription("Newest first, filtered and paged, with each test's attempt.")
            .RequirePermission(Permissions.Practice.Read)
            .WithValidation<ListPracticeTestsRequest>()
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .ProducesProblem(StatusCodes.Status403Forbidden);
    }

    private static async Task<Ok<PagedResult<PracticeTestSummary>>> HandleAsync(
        [AsParameters] ListPracticeTestsRequest request,
        ClaimsPrincipal user,
        ListPracticeTestsHandler handler,
        CancellationToken cancellationToken) =>
        TypedResults.Ok(await handler.HandleAsync(user.GetRequiredUserId(), request, cancellationToken));
}
