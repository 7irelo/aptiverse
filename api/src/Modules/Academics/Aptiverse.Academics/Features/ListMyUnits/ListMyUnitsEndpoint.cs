using System.Security.Claims;
using Aptiverse.Academics.Features.Common;
using Aptiverse.SharedKernel.Authorization;
using Aptiverse.SharedKernel.Validation;
using FluentValidation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Routing;

namespace Aptiverse.Academics.Features.ListMyUnits;

internal static class ListMyUnitsEndpoint
{
    public static void Map(RouteGroupBuilder group)
    {
        group.MapGet("/units", HandleAsync)
            .WithName("listMyUnits")
            .WithSummary("List your subjects or courses")
            .WithDescription("Your enrolments with the next due assessment and the weighting summary of each.")
            .RequirePermission(Permissions.Academics.Manage)
            .WithValidation<ListMyUnitsRequest>()
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .ProducesProblem(StatusCodes.Status403Forbidden);
    }

    private static async Task<Ok<IReadOnlyList<UnitSummary>>> HandleAsync(
        [AsParameters] ListMyUnitsRequest request,
        ClaimsPrincipal user,
        ListMyUnitsHandler handler,
        CancellationToken cancellationToken) =>
        TypedResults.Ok(await handler.HandleAsync(user.GetRequiredUserId(), request, cancellationToken));
}
