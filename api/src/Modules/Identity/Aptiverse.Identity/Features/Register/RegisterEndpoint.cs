using Aptiverse.Identity.Authentication;
using Aptiverse.Identity.Domain;
using Aptiverse.Identity.Features.Common;
using Aptiverse.SharedKernel.Results;
using Aptiverse.SharedKernel.Validation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Routing;

namespace Aptiverse.Identity.Features.Register;

internal static class RegisterEndpoint
{
    public static void Map(RouteGroupBuilder group)
    {
        group.MapPost("/register", HandleAsync)
            .WithName("register")
            .WithSummary("Create a student or parent account and sign in")
            .WithDescription(
                "Records consent to the current terms and privacy versions (getLegalVersions) and emails a verification link. " +
                "Returns the access and refresh tokens in the body for the web BFF to hold server side; the API sets no cookies. " +
                "409 identity.email_taken, 409 identity.consent_outdated, 429 identity.too_many_attempts with Retry-After.")
            .AllowAnonymous()
            .RequireRateLimiting(AuthRateLimiting.Register)
            .WithValidation<RegisterRequest>()
            .ProducesProblem(StatusCodes.Status409Conflict)
            .ProducesProblem(StatusCodes.Status429TooManyRequests);
    }

    private static async Task<Results<Created<AuthTokens>, ProblemHttpResult>> HandleAsync(
        RegisterRequest request,
        RegisterHandler handler,
        HttpContext context,
        CancellationToken cancellationToken)
    {
        var result = await handler.HandleAsync(request, RequestInfo.From(context), cancellationToken);
        return result.IsSuccess ? TypedResults.Created("/me", result.Value) : result.ToProblem();
    }
}
