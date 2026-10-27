using System.Security.Claims;
using Aptiverse.SharedKernel.Authorization;
using Aptiverse.SharedKernel.Results;
using Aptiverse.SharedKernel.Validation;
using FluentValidation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Routing;

namespace Aptiverse.Academics.Features.ListUnitTopics;

internal static class ListUnitTopicsEndpoint
{
    public static void Map(RouteGroupBuilder group)
    {
        group.MapGet("/units/{id:guid}/topics", HandleAsync)
            .WithName("listUnitTopics")
            .WithSummary("List the topics of one of your units")
            .WithDescription("Canonical topics (merged duplicates resolved), sorted by name. The id is the enrolment id.")
            .RequirePermission(Permissions.Academics.Manage)
            .WithValidation<ListUnitTopicsRequest>()
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .ProducesProblem(StatusCodes.Status403Forbidden);
    }

    private static async Task<Results<Ok<IReadOnlyList<TopicView>>, ProblemHttpResult>> HandleAsync(
        Guid id,
        [AsParameters] ListUnitTopicsRequest request,
        ClaimsPrincipal user,
        ListUnitTopicsHandler handler,
        CancellationToken cancellationToken)
    {
        var result = await handler.HandleAsync(user.GetRequiredUserId(), id, request, cancellationToken);
        return result.IsSuccess ? TypedResults.Ok(result.Value) : result.ToProblem();
    }
}
