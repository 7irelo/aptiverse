using Aptiverse.SharedKernel.Domain;

namespace Aptiverse.Billing.Domain;

/// <summary>A sellable plan. Inactive plans keep their subscriptions but cannot be bought.</summary>
internal sealed class Plan : Entity
{
    public const int NameMaxLength = 80;
    public const int DescriptionMaxLength = 400;

    private Plan()
    {
    }

    public string Code { get; private set; } = string.Empty;

    public string Name { get; private set; } = string.Empty;

    public string Description { get; private set; } = string.Empty;

    public string Kind { get; private set; } = PlanKinds.Paid;

    public string Audience { get; private set; } = Audiences.Student;

    public int MaxSeats { get; private set; } = 1;

    public bool IsPublic { get; private set; }

    public int SortOrder { get; private set; }

    public bool IsActive { get; private set; }

    public static Plan Create(string code, string name, string description, string kind, string audience, int maxSeats, bool isPublic, int sortOrder, bool isActive) => new()
    {
        Code = code,
        Name = name,
        Description = description,
        Kind = kind,
        Audience = audience,
        MaxSeats = maxSeats,
        IsPublic = isPublic,
        SortOrder = sortOrder,
        IsActive = isActive,
    };

    /// <summary>Refreshes display fields from the seed. Returns whether anything changed.</summary>
    public bool Refresh(string name, string description, int maxSeats, bool isPublic, int sortOrder, bool isActive)
    {
        var changed = Name != name || Description != description || MaxSeats != maxSeats || IsPublic != isPublic || SortOrder != sortOrder || IsActive != isActive;
        Name = name;
        Description = description;
        MaxSeats = maxSeats;
        IsPublic = isPublic;
        SortOrder = sortOrder;
        IsActive = isActive;
        return changed;
    }
}

/// <summary>
/// A price in cents, VAT inclusive. A price change is a new row: the old row is deactivated and keeps serving the
/// subscriptions on it, because a Paystack plan amount is never changed in place.
/// </summary>
internal sealed class PlanPrice : Entity
{
    public const int PaystackCodeMaxLength = 40;

    private PlanPrice()
    {
    }

    public Guid PlanId { get; private set; }

    public string Interval { get; private set; } = Intervals.Monthly;

    public long AmountCents { get; private set; }

    public string Currency { get; private set; } = Currencies.Zar;

    public string? PaystackPlanCode { get; private set; }

    public DateTimeOffset? PaystackSyncedAt { get; private set; }

    public bool IsActive { get; private set; }

    public static PlanPrice Create(Guid planId, string interval, long amountCents) => new()
    {
        PlanId = planId,
        Interval = interval,
        AmountCents = amountCents,
        Currency = Currencies.Zar,
        IsActive = true,
    };

    public void Deactivate() => IsActive = false;

    public void MarkSynced(string paystackPlanCode, DateTimeOffset now)
    {
        PaystackPlanCode = paystackPlanCode;
        PaystackSyncedAt = now;
    }
}

internal sealed class PlanFeature : Entity
{
    public const int LabelMaxLength = 80;

    private PlanFeature()
    {
    }

    public Guid PlanId { get; private set; }

    public string FeatureKey { get; private set; } = string.Empty;

    public string Label { get; private set; } = string.Empty;

    /// <summary>False while the feature is sold but not yet shipped ("coming soon" on pricing).</summary>
    public bool IsLive { get; private set; }

    public static PlanFeature Create(Guid planId, string featureKey, string label, bool isLive) => new()
    {
        PlanId = planId,
        FeatureKey = featureKey,
        Label = label,
        IsLive = isLive,
    };

    public bool Refresh(string label, bool isLive)
    {
        var changed = Label != label || IsLive != isLive;
        Label = label;
        IsLive = isLive;
        return changed;
    }
}

/// <summary>Units per period for one quota key: -1 unlimited, 0 not included.</summary>
internal sealed class PlanQuota : Entity
{
    public const int Unlimited = -1;

    private PlanQuota()
    {
    }

    public Guid PlanId { get; private set; }

    public string QuotaKey { get; private set; } = string.Empty;

    public int PerPeriod { get; private set; }

    public bool Pooled { get; private set; }

    public static PlanQuota Create(Guid planId, string quotaKey, int perPeriod) => new()
    {
        PlanId = planId,
        QuotaKey = quotaKey,
        PerPeriod = perPeriod,
    };

    public bool Refresh(int perPeriod)
    {
        var changed = PerPeriod != perPeriod;
        PerPeriod = perPeriod;
        return changed;
    }
}
