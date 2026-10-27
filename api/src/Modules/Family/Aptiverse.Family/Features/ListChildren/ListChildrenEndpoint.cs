using System.Security.Claims;
using Aptiverse.SharedKernel.Authorization;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Routing;

namespace Aptiverse.Family.Features.ListChildren;

internal static class ListChildrenEndpoint
{
    public static void Map(RouteGroupBuilder group)
    {
        group.MapGet("/children", HandleAsync)
            .WithName("listFamilyChildren")
            .WithSummary("List the children linked to you")
            .WithDescription("Oldest link first, with what each child shares with you (read only) and their parental consent status.")
            .RequirePermission(Permissions.Family.Parent)
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .ProducesProblem(StatusCodes.Status403Forbidden);
    }

    private static async Task<Ok<ChildrenView>> HandleAsync(
        ClaimsPrincipal user,
        ListChildrenHandler handler,
        CancellationToken cancellationToken) =>
        TypedResults.Ok(await handler.HandleAsync(user.GetRequiredUserId(), cancellationToken));
}
