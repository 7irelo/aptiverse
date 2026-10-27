using System.Security.Claims;
using Aptiverse.SharedKernel.Authorization;
using Aptiverse.SharedKernel.Validation;
using FluentValidation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Routing;

namespace Aptiverse.Progress.Features.GetJourney;

internal static class GetJourneyEndpoint
{
    public static void Map(RouteGroupBuilder group)
    {
        group.MapGet("/journey", HandleAsync)
            .WithName("getJourney")
            .WithSummary("Your journey, newest first")
            .WithDescription("Practice graded, marks recorded, goals set and achieved, milestones and topics moving up a band. Pass nextCursor as before for the next page.")
            .RequirePermission(Permissions.Progress.Read)
            .WithValidation<GetJourneyRequest>()
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .ProducesProblem(StatusCodes.Status403Forbidden);
    }

    private static async Task<Ok<JourneyPage>> HandleAsync(
        [AsParameters] GetJourneyRequest request,
        ClaimsPrincipal user,
        GetJourneyHandler handler,
        CancellationToken cancellationToken) =>
        TypedResults.Ok(await handler.HandleAsync(user.GetRequiredUserId(), request, cancellationToken));
}
