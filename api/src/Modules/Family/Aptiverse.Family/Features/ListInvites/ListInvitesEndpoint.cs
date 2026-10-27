using System.Security.Claims;
using Aptiverse.Family.Features.SendInvite;
using Aptiverse.SharedKernel.Authorization;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Routing;

namespace Aptiverse.Family.Features.ListInvites;

internal static class ListInvitesEndpoint
{
    public static void Map(RouteGroupBuilder group)
    {
        group.MapGet("/invites", HandleAsync)
            .WithName("listFamilyInvites")
            .WithSummary("List the invites you sent")
            .WithDescription("Newest first, at most 50. A pending invite past its expiry reads as expired. Addresses are masked.")
            .RequirePermission(Permissions.Family.Parent)
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .ProducesProblem(StatusCodes.Status403Forbidden);
    }

    private static async Task<Ok<IReadOnlyList<InviteView>>> HandleAsync(
        ClaimsPrincipal user,
        ListInvitesHandler handler,
        CancellationToken cancellationToken) =>
        TypedResults.Ok(await handler.HandleAsync(user.GetRequiredUserId(), cancellationToken));
}
