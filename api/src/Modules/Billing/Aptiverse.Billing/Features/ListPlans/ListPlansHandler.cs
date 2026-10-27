using Aptiverse.Billing.Domain;
using Aptiverse.Billing.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace Aptiverse.Billing.Features.ListPlans;

/// <summary>The public pricing catalog: only public, active plans, with their active prices.</summary>
internal sealed class ListPlansHandler(BillingDbContext db, IOptions<BillingOptions> options)
{
    public async Task<PlanCatalog> HandleAsync(ListPlansRequest request, CancellationToken cancellationToken)
    {
        var plans = await db.Plans.AsNoTracking()
            .Where(p => p.IsPublic && p.IsActive && (request.Audience == null || p.Audience == request.Audience))
            .OrderBy(p => p.SortOrder)
            .ToListAsync(cancellationToken);
        var ids = plans.Select(p => p.Id).ToList();

        var prices = await db.PlanPrices.AsNoTracking().Where(p => ids.Contains(p.PlanId) && p.IsActive).ToListAsync(cancellationToken);
        var features = await db.PlanFeatures.AsNoTracking().Where(f => ids.Contains(f.PlanId)).ToListAsync(cancellationToken);
        var quotas = await db.PlanQuotas.AsNoTracking().Where(q => ids.Contains(q.PlanId)).ToListAsync(cancellationToken);
        var vatInclusive = options.Value.Vat.PricesIncludeVat;

        return new PlanCatalog(
            vatInclusive,
            options.Value.Paystack.Mode,
            plans.Select(p => new PlanView(
                p.Code,
                p.Name,
                p.Description,
                p.Kind,
                p.Audience,
                p.MaxSeats,
                prices.Where(x => x.PlanId == p.Id).OrderBy(x => x.Interval == Intervals.Monthly ? 0 : 1)
                    .Select(x => new PriceView(x.Interval, x.AmountCents, x.Currency, vatInclusive)).ToList(),
                features.Where(f => f.PlanId == p.Id).OrderBy(f => f.FeatureKey, StringComparer.Ordinal)
                    .Select(f => new FeatureView(f.FeatureKey, f.Label, f.IsLive)).ToList(),
                quotas.Where(q => q.PlanId == p.Id).OrderBy(q => q.QuotaKey, StringComparer.Ordinal)
                    .Select(q => new QuotaView(q.QuotaKey, q.PerPeriod, q.Pooled)).ToList())).ToList());
    }
}
