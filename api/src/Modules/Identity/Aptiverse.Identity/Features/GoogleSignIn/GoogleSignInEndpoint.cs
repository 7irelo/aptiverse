using Aptiverse.Identity.Authentication;
using Aptiverse.Identity.Domain;
using Aptiverse.Identity.Features.Common;
using Aptiverse.SharedKernel.Results;
using Aptiverse.SharedKernel.Validation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Routing;

namespace Aptiverse.Identity.Features.GoogleSignIn;

internal static class GoogleSignInEndpoint
{
    public static void Map(RouteGroupBuilder group)
    {
        group.MapPost("/google", HandleAsync)
            .WithName("signInWithGoogle")
            .WithSummary("Sign in to an existing account with a Google ID token")
            .WithDescription(
                "Google never creates an account: 404 identity.account_not_found when no account uses the Google address. " +
                "An account with the same verified address is linked on first use. Returns the tokens in the body for the web " +
                "BFF to hold server side; no cookies. 401 identity.google_token_invalid, 409 identity.google_email_unverified, " +
                "503 identity.google_unavailable.")
            .AllowAnonymous()
            .RequireRateLimiting(AuthRateLimiting.Login)
            .WithValidation<GoogleSignInRequest>()
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .ProducesProblem(StatusCodes.Status404NotFound)
            .ProducesProblem(StatusCodes.Status409Conflict)
            .ProducesProblem(StatusCodes.Status429TooManyRequests)
            .ProducesProblem(StatusCodes.Status503ServiceUnavailable);
    }

    private static async Task<Results<Ok<AuthTokens>, ProblemHttpResult>> HandleAsync(
        GoogleSignInRequest request,
        GoogleSignInHandler handler,
        HttpContext context,
        CancellationToken cancellationToken)
    {
        var result = await handler.HandleAsync(request, RequestInfo.From(context), cancellationToken);
        return result.IsSuccess ? TypedResults.Ok(result.Value) : result.ToProblem();
    }
}
