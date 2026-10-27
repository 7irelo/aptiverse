using Aptiverse.Identity.Authentication;
using Aptiverse.Identity.Domain;
using Aptiverse.SharedKernel.Results;
using Aptiverse.SharedKernel.Validation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Routing;

namespace Aptiverse.Identity.Features.ResetPassword;

internal static class ResetPasswordEndpoint
{
    public static void Map(RouteGroupBuilder group)
    {
        group.MapPost("/reset-password", HandleAsync)
            .WithName("resetPassword")
            .WithSummary("Set a new password with the emailed reset link's token")
            .WithDescription(
                "Signs the account out everywhere: every session and refresh token ends. The link works once. " +
                "400 identity.token_invalid for an unknown, used or expired link; 400 identity.password_rejected with field errors.")
            .AllowAnonymous()
            .RequireRateLimiting(AuthRateLimiting.PasswordReset)
            .WithValidation<ResetPasswordRequest>()
            .ProducesProblem(StatusCodes.Status429TooManyRequests);
    }

    private static async Task<Results<NoContent, ProblemHttpResult>> HandleAsync(
        ResetPasswordRequest request,
        ResetPasswordHandler handler,
        HttpContext context,
        CancellationToken cancellationToken)
    {
        var result = await handler.HandleAsync(request, RequestInfo.From(context), cancellationToken);
        return result.IsSuccess ? TypedResults.NoContent() : result.ToProblem();
    }
}
