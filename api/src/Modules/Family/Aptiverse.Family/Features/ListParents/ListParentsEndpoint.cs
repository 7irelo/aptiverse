using System.Security.Claims;
using Aptiverse.SharedKernel.Authorization;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Routing;

namespace Aptiverse.Family.Features.ListParents;

internal static class ListParentsEndpoint
{
    public static void Map(RouteGroupBuilder group)
    {
        group.MapGet("/parents", HandleAsync)
            .WithName("listFamilyParents")
            .WithSummary("List the parents linked to you")
            .WithDescription("Oldest link first, with what you share with each one and which parent gave parental consent.")
            .RequirePermission(Permissions.Family.Student)
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .ProducesProblem(StatusCodes.Status403Forbidden);
    }

    private static async Task<Ok<IReadOnlyList<ParentView>>> HandleAsync(
        ClaimsPrincipal user,
        ListParentsHandler handler,
        CancellationToken cancellationToken) =>
        TypedResults.Ok(await handler.HandleAsync(user.GetRequiredUserId(), cancellationToken));
}
