using System.Security.Claims;
using Aptiverse.Identity.Authentication;
using Aptiverse.SharedKernel.Authorization;
using Aptiverse.SharedKernel.Results;
using Aptiverse.SharedKernel.Validation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Routing;

namespace Aptiverse.Identity.Features.ResendVerification;

internal static class ResendVerificationEndpoint
{
    public static void Map(RouteGroupBuilder group)
    {
        group.MapPost("/verify-email/resend", HandleAsync)
            .WithName("resendVerificationEmail")
            .WithSummary("Send a new email verification link")
            .WithDescription(
                "Always 202, whether or not the address has an unverified account, so it cannot be used to find accounts. " +
                "A new link replaces older ones; repeats within 60 seconds send nothing new.")
            .AllowAnonymous()
            .RequireRateLimiting(AuthRateLimiting.Verification)
            .WithValidation<ResendVerificationRequest>()
            .ProducesProblem(StatusCodes.Status429TooManyRequests);
    }

    private static async Task<Results<Accepted, ProblemHttpResult>> HandleAsync(
        ResendVerificationRequest request,
        ClaimsPrincipal user,
        ResendVerificationHandler handler,
        HttpResponse response,
        CancellationToken cancellationToken)
    {
        var result = await handler.HandleAsync(user.GetUserId(), request, cancellationToken);
        return result.IsSuccess ? TypedResults.Accepted((string?)null) : result.Error!.WithRetryAfterHeader(response).ToProblem();
    }
}
