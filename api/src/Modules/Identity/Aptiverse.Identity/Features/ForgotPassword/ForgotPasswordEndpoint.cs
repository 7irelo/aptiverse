using Aptiverse.Identity.Authentication;
using Aptiverse.Identity.Domain;
using Aptiverse.SharedKernel.Results;
using Aptiverse.SharedKernel.Validation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Routing;

namespace Aptiverse.Identity.Features.ForgotPassword;

internal static class ForgotPasswordEndpoint
{
    public static void Map(RouteGroupBuilder group)
    {
        group.MapPost("/forgot-password", HandleAsync)
            .WithName("forgotPassword")
            .WithSummary("Email a password reset link")
            .WithDescription(
                "Always 202 with no body, whether or not the address has an account, so it cannot be used to find accounts. " +
                "The link is valid for 60 minutes and replaces older ones.")
            .AllowAnonymous()
            .RequireRateLimiting(AuthRateLimiting.PasswordReset)
            .WithValidation<ForgotPasswordRequest>()
            .ProducesProblem(StatusCodes.Status429TooManyRequests);
    }

    private static async Task<Results<Accepted, ProblemHttpResult>> HandleAsync(
        ForgotPasswordRequest request,
        ForgotPasswordHandler handler,
        HttpContext context,
        CancellationToken cancellationToken)
    {
        var result = await handler.HandleAsync(request, RequestInfo.From(context), cancellationToken);
        return result.IsSuccess ? TypedResults.Accepted((string?)null) : result.Error!.WithRetryAfterHeader(context.Response).ToProblem();
    }
}
