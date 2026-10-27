using System.Security.Claims;
using Aptiverse.Billing.Contracts;
using Aptiverse.SharedKernel.Authorization;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Routing;

namespace Aptiverse.Billing.Features.GetMyUsage;

/// <param name="Items">One row per quota key.</param>
internal sealed record UsageSummary(IReadOnlyList<UsageItem> Items);

/// <param name="QuotaKey">For example "practice.generate".</param>
/// <param name="Used">Confirmed this month.</param>
/// <param name="Reserved">Held by work in progress.</param>
/// <param name="Limit">Allowed this month; null when unlimited.</param>
/// <param name="Unlimited">True when unlimited.</param>
/// <param name="ResetsAt">Start of next month in Africa/Johannesburg.</param>
internal sealed record UsageItem(string QuotaKey, int Used, int Reserved, int? Limit, bool Unlimited, DateTimeOffset ResetsAt);

internal static class GetMyUsageEndpoint
{
    public static void Map(RouteGroupBuilder group)
    {
        group.MapGet("/usage", HandleAsync)
            .WithName("getMyUsage")
            .WithSummary("Your allowances this month")
            .RequirePermission(Permissions.Billing.Manage)
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .ProducesProblem(StatusCodes.Status403Forbidden);
    }

    private static async Task<Ok<UsageSummary>> HandleAsync(ClaimsPrincipal user, IUsageMeter meter, CancellationToken cancellationToken)
    {
        var userId = user.GetRequiredUserId();
        var items = new List<UsageItem>();
        foreach (var key in QuotaKeys.All)
        {
            var snapshot = await meter.GetAsync(userId, key, cancellationToken);
            items.Add(new UsageItem(snapshot.QuotaKey, snapshot.Used, snapshot.Reserved, snapshot.Limit, snapshot.Unlimited, snapshot.ResetsAt));
        }

        return TypedResults.Ok(new UsageSummary(items));
    }
}
