using System.Security.Claims;
using Aptiverse.Identity.Domain;
using Aptiverse.SharedKernel.Authorization;
using Aptiverse.SharedKernel.Results;
using Aptiverse.SharedKernel.Validation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Routing;

namespace Aptiverse.Identity.Features.AcceptConsents;

internal static class AcceptConsentsEndpoint
{
    public static void Map(RouteGroupBuilder group)
    {
        // Any signed-in caller: re-accepting must work even when the role map is broken.
        group.MapPost("/consents", HandleAsync)
            .WithName("acceptConsents")
            .WithSummary("Accept the current terms and privacy versions")
            .WithDescription(
                "Idempotent per version. marketingEmails true opts in, false withdraws. 409 identity.consent_outdated when the " +
                "versions are not the current ones from getLegalVersions.")
            .RequireAuthorization()
            .WithValidation<AcceptConsentsRequest>()
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .ProducesProblem(StatusCodes.Status409Conflict);
    }

    private static async Task<Results<NoContent, ProblemHttpResult>> HandleAsync(
        AcceptConsentsRequest request,
        ClaimsPrincipal user,
        AcceptConsentsHandler handler,
        HttpContext context,
        CancellationToken cancellationToken)
    {
        var result = await handler.HandleAsync(user.GetRequiredUserId(), request, RequestInfo.From(context), cancellationToken);
        return result.IsSuccess ? TypedResults.NoContent() : result.ToProblem();
    }
}
