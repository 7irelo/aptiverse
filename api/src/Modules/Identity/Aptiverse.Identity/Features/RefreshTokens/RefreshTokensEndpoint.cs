using Aptiverse.Identity.Authentication;
using Aptiverse.Identity.Domain;
using Aptiverse.Identity.Features.Common;
using Aptiverse.SharedKernel.Results;
using Aptiverse.SharedKernel.Validation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Routing;

namespace Aptiverse.Identity.Features.RefreshTokens;

internal static class RefreshTokensEndpoint
{
    public static void Map(RouteGroupBuilder group)
    {
        group.MapPost("/refresh", HandleAsync)
            .WithName("refreshTokens")
            .WithSummary("Exchange a refresh token for new tokens")
            .WithDescription(
                "The refresh token is the credential. Returns a new access token and a new refresh token in the body for the " +
                "web BFF to hold server side (no cookies); the presented token is used up. Presenting a used token again is " +
                "treated as theft and ends the whole session, so the BFF must serialise refreshes per session. " +
                "401 identity.refresh_token_invalid for any token that cannot be used.")
            .AllowAnonymous()
            .RequireRateLimiting(AuthRateLimiting.Refresh)
            .WithValidation<RefreshTokensRequest>()
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .ProducesProblem(StatusCodes.Status429TooManyRequests);
    }

    private static async Task<Results<Ok<AuthTokens>, ProblemHttpResult>> HandleAsync(
        RefreshTokensRequest request,
        RefreshTokensHandler handler,
        HttpContext context,
        CancellationToken cancellationToken)
    {
        var result = await handler.HandleAsync(request, RequestInfo.From(context), cancellationToken);
        return result.IsSuccess ? TypedResults.Ok(result.Value) : result.ToProblem();
    }
}
