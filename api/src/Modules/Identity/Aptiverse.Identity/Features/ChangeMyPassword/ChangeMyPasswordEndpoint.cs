using System.Security.Claims;
using Aptiverse.Identity.Authentication;
using Aptiverse.Identity.Domain;
using Aptiverse.SharedKernel.Authorization;
using Aptiverse.SharedKernel.Results;
using Aptiverse.SharedKernel.Validation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Routing;

namespace Aptiverse.Identity.Features.ChangeMyPassword;

internal static class ChangeMyPasswordEndpoint
{
    public static void Map(RouteGroupBuilder group)
    {
        group.MapPost("/password", HandleAsync)
            .WithName("changeMyPassword")
            .WithSummary("Change your password")
            .WithDescription(
                "Needs the current password (not for Google-only accounts setting a first one). Signs out every other device; " +
                "this session keeps working. 401 identity.invalid_credentials for a wrong current password, which counts toward " +
                "the sign-in lockout (429 identity.too_many_attempts with Retry-After).")
            .RequirePermission(Permissions.Account.Manage)
            .RequireRateLimiting(AuthRateLimiting.Login)
            .WithValidation<ChangeMyPasswordRequest>()
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .ProducesProblem(StatusCodes.Status403Forbidden)
            .ProducesProblem(StatusCodes.Status429TooManyRequests);
    }

    private static async Task<Results<NoContent, ProblemHttpResult>> HandleAsync(
        ChangeMyPasswordRequest request,
        ClaimsPrincipal user,
        ChangeMyPasswordHandler handler,
        HttpContext context,
        CancellationToken cancellationToken)
    {
        var result = await handler.HandleAsync(user.GetRequiredUserId(), user.GetSessionId(), request, RequestInfo.From(context), cancellationToken);
        return result.IsSuccess ? TypedResults.NoContent() : result.Error!.WithRetryAfterHeader(context.Response).ToProblem();
    }
}
