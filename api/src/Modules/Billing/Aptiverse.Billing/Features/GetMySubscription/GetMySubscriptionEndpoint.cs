using System.Security.Claims;
using Aptiverse.Billing.Features.Common;
using Aptiverse.SharedKernel.Authorization;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Routing;

namespace Aptiverse.Billing.Features.GetMySubscription;

internal static class GetMySubscriptionEndpoint
{
    public static void Map(RouteGroupBuilder group)
    {
        group.MapGet("/subscription", HandleAsync)
            .WithName("getMySubscription")
            .WithSummary("Your subscription, or null on the free plan")
            .RequirePermission(Permissions.Billing.Manage)
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .ProducesProblem(StatusCodes.Status403Forbidden);
    }

    private static async Task<Ok<SubscriptionView>> HandleAsync(ClaimsPrincipal user, SubscriptionViews views, CancellationToken cancellationToken) =>
        TypedResults.Ok(await views.ForUserAsync(user.GetRequiredUserId(), cancellationToken));
}
