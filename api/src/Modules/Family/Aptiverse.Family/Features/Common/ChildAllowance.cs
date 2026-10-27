using System.Globalization;
using Aptiverse.Billing.Contracts;
using Microsoft.Extensions.Options;

namespace Aptiverse.Family.Features.Common;

/// <summary>
/// How many children a parent may link: the seats of their best parent plan (parent.1 to parent.4, from Billing's
/// entitlements, never the client), capped at the hard ceiling; without a parent plan, the configured free allowance.
/// </summary>
internal sealed class ChildAllowance(IEntitlements entitlements, IOptions<FamilyOptions> options)
{
    public const string ParentPlanPrefix = "parent.";

    public async Task<int> ForAsync(Guid parentUserId, CancellationToken cancellationToken)
    {
        var settings = options.Value;
        var plans = await entitlements.GetAsync(parentUserId, cancellationToken);
        var seats = plans.PlanCodes.Select(SeatsOf).DefaultIfEmpty(0).Max();
        return seats > 0 ? Math.Min(seats, settings.MaxChildren) : Math.Min(settings.ChildrenWithoutPlan, settings.MaxChildren);
    }

    /// <summary>N for "parent.N", otherwise 0.</summary>
    public static int SeatsOf(string planCode) =>
        planCode is not null
        && planCode.StartsWith(ParentPlanPrefix, StringComparison.Ordinal)
        && int.TryParse(planCode.AsSpan(ParentPlanPrefix.Length), NumberStyles.None, CultureInfo.InvariantCulture, out var seats)
            ? seats
            : 0;
}
