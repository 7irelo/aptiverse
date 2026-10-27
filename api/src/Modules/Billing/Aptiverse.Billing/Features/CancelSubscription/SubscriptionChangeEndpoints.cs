using System.Security.Claims;
using Aptiverse.Billing.Features.Common;
using Aptiverse.SharedKernel.Authorization;
using Aptiverse.SharedKernel.Results;
using Aptiverse.SharedKernel.Validation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;

namespace Aptiverse.Billing.Features.CancelSubscription;

internal static class SubscriptionChangeEndpoints
{
    public static void Map(RouteGroupBuilder group)
    {
        group.MapPost("/subscription/cancel", CancelAsync)
            .WithName("cancelSubscription")
            .WithSummary("Cancel at the end of the paid period")
            .WithDescription("Access continues until currentPeriodEnd. Cancelling a cancelling subscription returns 200. On a Paystack error nothing changes and the call is safe to retry.")
            .RequirePermission(Permissions.Billing.Manage)
            .WithMetadata(new RequestSizeLimitAttribute(2 * 1024))
            .WithValidation<CancelSubscriptionRequest>()
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .ProducesProblem(StatusCodes.Status403Forbidden)
            .ProducesProblem(StatusCodes.Status409Conflict)
            .ProducesProblem(StatusCodes.Status502BadGateway)
            .ProducesProblem(StatusCodes.Status503ServiceUnavailable);

        group.MapPost("/subscription/resume", ResumeAsync)
            .WithName("resumeSubscription")
            .WithSummary("Undo a cancellation before the period ends")
            .RequirePermission(Permissions.Billing.Manage)
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .ProducesProblem(StatusCodes.Status403Forbidden)
            .ProducesProblem(StatusCodes.Status409Conflict)
            .ProducesProblem(StatusCodes.Status502BadGateway)
            .ProducesProblem(StatusCodes.Status503ServiceUnavailable);
    }

    private static async Task<Results<Ok<SubscriptionView>, ProblemHttpResult>> CancelAsync(
        CancelSubscriptionRequest request,
        ClaimsPrincipal user,
        SubscriptionChangeHandler handler,
        CancellationToken cancellationToken)
    {
        var result = await handler.CancelAsync(user.GetRequiredUserId(), request, cancellationToken);
        return result.IsSuccess ? TypedResults.Ok(result.Value) : result.ToProblem();
    }

    private static async Task<Results<Ok<SubscriptionView>, ProblemHttpResult>> ResumeAsync(
        ClaimsPrincipal user,
        SubscriptionChangeHandler handler,
        CancellationToken cancellationToken)
    {
        var result = await handler.ResumeAsync(user.GetRequiredUserId(), cancellationToken);
        return result.IsSuccess ? TypedResults.Ok(result.Value) : result.ToProblem();
    }
}
