using System.Security.Claims;
using Aptiverse.SharedKernel.Authorization;
using Aptiverse.SharedKernel.Results;
using Aptiverse.SharedKernel.Validation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;

namespace Aptiverse.Billing.Features.StartCheckout;

internal static class StartCheckoutEndpoint
{
    public const long MaxBodyBytes = 2 * 1024;

    public static void Map(RouteGroupBuilder group)
    {
        group.MapPost("/checkout", HandleAsync)
            .WithName("startCheckout")
            .WithSummary("Start a Paystack checkout for a plan")
            .WithDescription(
                "The amount comes from the plan catalog, never the request. Optional Idempotency-Key header (8 to 64 letters, " +
                "digits, dashes or underscores); an open checkout for the same price in the last 30 minutes is also reused. " +
                "403 billing.payer_must_be_adult for an under-18 without recorded parental consent.")
            .RequirePermission(Permissions.Billing.Manage)
            .RequireRateLimiting(BillingRateLimiting.Checkout)
            .WithMetadata(new RequestSizeLimitAttribute(MaxBodyBytes))
            .WithValidation<StartCheckoutRequest>()
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .ProducesProblem(StatusCodes.Status403Forbidden)
            .ProducesProblem(StatusCodes.Status404NotFound)
            .ProducesProblem(StatusCodes.Status409Conflict)
            .ProducesProblem(StatusCodes.Status429TooManyRequests)
            .ProducesProblem(StatusCodes.Status502BadGateway)
            .ProducesProblem(StatusCodes.Status503ServiceUnavailable);
    }

    private static async Task<Results<Created<CheckoutStartedResponse>, ProblemHttpResult>> HandleAsync(
        StartCheckoutRequest request,
        [FromHeader(Name = "Idempotency-Key")] string? idempotencyKey,
        ClaimsPrincipal user,
        StartCheckoutHandler handler,
        CancellationToken cancellationToken)
    {
        var roles = user.FindAll(AptiverseClaims.Roles).Select(c => c.Value).ToArray();
        var result = await handler.HandleAsync(user.GetRequiredUserId(), roles, request, idempotencyKey, cancellationToken);
        return result.IsSuccess
            ? TypedResults.Created($"/billing/checkout/{result.Value.CheckoutSessionId}", result.Value)
            : result.ToProblem();
    }
}
