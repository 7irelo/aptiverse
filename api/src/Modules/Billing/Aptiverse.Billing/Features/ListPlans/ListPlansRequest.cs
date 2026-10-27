namespace Aptiverse.Billing.Features.ListPlans;

/// <param name="Audience">Optional: "student" or "parent".</param>
internal sealed record ListPlansRequest(string? Audience);

/// <param name="VatInclusive">Prices include VAT (decision 50).</param>
/// <param name="PaystackMode">"test" or "live", for the test mode banner.</param>
/// <param name="Plans">Public, active plans in display order.</param>
internal sealed record PlanCatalog(bool VatInclusive, string PaystackMode, IReadOnlyList<PlanView> Plans);

internal sealed record PlanView(
    string Code,
    string Name,
    string Description,
    string Kind,
    string Audience,
    int MaxSeats,
    IReadOnlyList<PriceView> Prices,
    IReadOnlyList<FeatureView> Features,
    IReadOnlyList<QuotaView> Quotas);

/// <param name="Interval">"monthly" or "annual".</param>
/// <param name="AmountCents">Integer cents; formatting is the web's job.</param>
/// <param name="Currency">Always "ZAR" in v1.</param>
/// <param name="VatInclusive">The amount includes VAT.</param>
internal sealed record PriceView(string Interval, long AmountCents, string Currency, bool VatInclusive);

/// <param name="Key">A feature key.</param>
/// <param name="Label">Display label.</param>
/// <param name="IsLive">False while sold but not yet shipped ("coming soon").</param>
internal sealed record FeatureView(string Key, string Label, bool IsLive);

/// <param name="QuotaKey">For example "practice.generate".</param>
/// <param name="PerPeriod">Units per calendar month: -1 unlimited, 0 not included.</param>
/// <param name="Pooled">Shared by every seat of the subscription (not used in v1).</param>
internal sealed record QuotaView(string QuotaKey, int PerPeriod, bool Pooled);
