using Aptiverse.Identity.Authentication;
using Aptiverse.Identity.Domain;
using Aptiverse.SharedKernel.Results;
using Aptiverse.SharedKernel.Validation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Routing;

namespace Aptiverse.Identity.Features.VerifyEmail;

internal static class VerifyEmailEndpoint
{
    public static void Map(RouteGroupBuilder group)
    {
        group.MapPost("/verify-email", HandleAsync)
            .WithName("verifyEmail")
            .WithSummary("Confirm an email address with the emailed link's token")
            .WithDescription("Each link works once. 400 identity.token_invalid for an unknown, used or expired link.")
            .AllowAnonymous()
            .RequireRateLimiting(AuthRateLimiting.Verification)
            .WithValidation<VerifyEmailRequest>()
            .ProducesProblem(StatusCodes.Status429TooManyRequests);
    }

    private static async Task<Results<NoContent, ProblemHttpResult>> HandleAsync(
        VerifyEmailRequest request,
        VerifyEmailHandler handler,
        HttpContext context,
        CancellationToken cancellationToken)
    {
        var result = await handler.HandleAsync(request, RequestInfo.From(context), cancellationToken);
        return result.IsSuccess ? TypedResults.NoContent() : result.ToProblem();
    }
}
