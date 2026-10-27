using System.Security.Claims;
using Aptiverse.SharedKernel.Authorization;
using Aptiverse.SharedKernel.Results;
using Aptiverse.SharedKernel.Validation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;

namespace Aptiverse.Billing.Features.VerifyCheckout;

internal static class VerifyCheckoutEndpoint
{
    public static void Map(RouteGroupBuilder group)
    {
        group.MapPost("/checkout/verify", HandleAsync)
            .WithName("verifyCheckout")
            .WithSummary("Check a checkout from the welcome page and apply it if Paystack says it is paid")
            .WithDescription("Safe to call repeatedly; the webhook and this call apply a payment once between them. Another user's reference is 404.")
            .RequirePermission(Permissions.Billing.Manage)
            .RequireRateLimiting(BillingRateLimiting.Verify)
            .WithMetadata(new RequestSizeLimitAttribute(1024))
            .WithValidation<VerifyCheckoutRequest>()
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .ProducesProblem(StatusCodes.Status403Forbidden)
            .ProducesProblem(StatusCodes.Status404NotFound)
            .ProducesProblem(StatusCodes.Status429TooManyRequests)
            .ProducesProblem(StatusCodes.Status502BadGateway)
            .ProducesProblem(StatusCodes.Status503ServiceUnavailable);
    }

    private static async Task<Results<Ok<CheckoutStatus>, ProblemHttpResult>> HandleAsync(
        VerifyCheckoutRequest request,
        ClaimsPrincipal user,
        VerifyCheckoutHandler handler,
        CancellationToken cancellationToken)
    {
        var result = await handler.HandleAsync(user.GetRequiredUserId(), request, cancellationToken);
        return result.IsSuccess ? TypedResults.Ok(result.Value) : result.ToProblem();
    }
}
