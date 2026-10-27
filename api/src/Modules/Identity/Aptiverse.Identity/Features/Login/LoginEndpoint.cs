using Aptiverse.Identity.Authentication;
using Aptiverse.Identity.Domain;
using Aptiverse.Identity.Features.Common;
using Aptiverse.SharedKernel.Results;
using Aptiverse.SharedKernel.Validation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Routing;

namespace Aptiverse.Identity.Features.Login;

internal static class LoginEndpoint
{
    public static void Map(RouteGroupBuilder group)
    {
        group.MapPost("/login", HandleAsync)
            .WithName("login")
            .WithSummary("Sign in with email and password")
            .WithDescription(
                "Starts a session and returns the access and refresh tokens in the body for the web BFF to hold server side; " +
                "the API sets no cookies. 401 identity.invalid_credentials for any wrong email or password. Repeated failures " +
                "answer 429 identity.too_many_attempts with Retry-After, the same response the rate limiters give, so it never " +
                "shows whether an account exists or is locked.")
            .AllowAnonymous()
            .RequireRateLimiting(AuthRateLimiting.Login)
            .WithValidation<LoginRequest>()
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .ProducesProblem(StatusCodes.Status429TooManyRequests);
    }

    private static async Task<Results<Ok<AuthTokens>, ProblemHttpResult>> HandleAsync(
        LoginRequest request,
        LoginHandler handler,
        HttpContext context,
        CancellationToken cancellationToken)
    {
        var result = await handler.HandleAsync(request, RequestInfo.From(context), cancellationToken);
        return result.IsSuccess ? TypedResults.Ok(result.Value) : result.Error!.WithRetryAfterHeader(context.Response).ToProblem();
    }
}
