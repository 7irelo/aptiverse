using System.Security.Claims;
using Aptiverse.SharedKernel.Authorization;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Routing;

namespace Aptiverse.Family.Features.CreateLinkCode;

internal static class CreateLinkCodeEndpoint
{
    public static void Map(RouteGroupBuilder group)
    {
        group.MapPost("/link-codes", HandleAsync)
            .WithName("createFamilyLinkCode")
            .WithSummary("Get a code your parent can enter to link to you")
            .WithDescription(
                "A 12 character code shown as XXXX-XXXX-XXXX, valid for 15 minutes and usable once. A new code replaces " +
                "any code you had before. Give it only to a parent: entering it links their account to yours.")
            .RequirePermission(Permissions.Family.Student)
            .RequireRateLimiting(FamilyRateLimiting.LinkCode)
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .ProducesProblem(StatusCodes.Status403Forbidden)
            .ProducesProblem(StatusCodes.Status429TooManyRequests);
    }

    private static async Task<Created<LinkCodeView>> HandleAsync(
        ClaimsPrincipal user,
        CreateLinkCodeHandler handler,
        CancellationToken cancellationToken)
    {
        var view = await handler.HandleAsync(user.GetRequiredUserId(), cancellationToken);
        return TypedResults.Created((string?)null, view);
    }
}

/// <param name="Code">The code to give your parent, for example "7K3Q-9XWM-2HCD". Shown once; it is not stored.</param>
/// <param name="ExpiresAt">When it stops working.</param>
internal sealed record LinkCodeView(string Code, DateTimeOffset ExpiresAt);
