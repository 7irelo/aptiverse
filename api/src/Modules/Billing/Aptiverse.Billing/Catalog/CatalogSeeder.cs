using Aptiverse.Billing.Contracts;
using Aptiverse.Billing.Domain;
using Aptiverse.Billing.Persistence;
using Aptiverse.SharedKernel.Seeding;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Aptiverse.Billing.Catalog;

/// <summary>
/// The v1 plan catalog (decision 12): free, Student Pro and the parent tiers, monthly and annual; Student Max is seeded
/// inactive. Prices are integer cents, VAT inclusive. Idempotent: plans, features and quotas are upserted by key, and a
/// changed price deactivates the old row and adds a new one, because existing subscriptions keep the price they bought
/// and a Paystack plan amount is never changed in place.
/// </summary>
internal sealed partial class CatalogSeeder(BillingDbContext db, ILogger<CatalogSeeder> logger) : IDataSeeder
{
    internal sealed record SeedPlan(
        string Code,
        string Name,
        string Description,
        string Kind,
        string Audience,
        int MaxSeats,
        bool IsPublic,
        int SortOrder,
        bool IsActive,
        long? MonthlyCents,
        long? AnnualCents,
        IReadOnlyList<(string Key, string Label, bool IsLive)> Features,
        IReadOnlyList<(string Key, int PerPeriod)> Quotas);

    private static readonly (string, string, bool)[] StudentProFeatures =
    [
        (FeatureKeys.AiPractice, "AI practice tests for your level", true),
        (FeatureKeys.AiTutor, "AI tutor that knows your courses and marks", true),
        (FeatureKeys.MasteryPredictions, "Mastery per topic", true),
        (FeatureKeys.GoalsUnlimited, "Unlimited goals", true),
        (FeatureKeys.SubjectsUnlimited, "Unlimited subjects and courses", true),
        (FeatureKeys.Workspace, "Workspace", false),
    ];

    internal static readonly IReadOnlyList<SeedPlan> Plans =
    [
        new(
            PlanCodes.Free,
            "Free",
            "Free for good, not a trial. Track your subjects or courses and what is due, with 3 AI practice tests and 15 tutor questions a month.",
            PlanKinds.Free, Audiences.Student, 1, IsPublic: true, SortOrder: 0, IsActive: true, null, null,
            [(FeatureKeys.AiPractice, "AI practice tests (3 a month)", true)],
            [(QuotaKeys.AiQuick, 15), (QuotaKeys.AiDeep, 0), (QuotaKeys.AiHelp, 50), (QuotaKeys.PracticeGenerate, 3), (QuotaKeys.PracticeEssayFeedback, 3)]),
        new(
            PlanCodes.StudentPro,
            "Student Pro",
            "The AI tutor that can see your courses, your marks and what is due, mastery per topic, and 40 practice tests and 300 tutor questions a month.",
            PlanKinds.Paid, Audiences.Student, 1, IsPublic: true, SortOrder: 10, IsActive: true, 12_900, 129_000,
            StudentProFeatures,
            [(QuotaKeys.AiQuick, 300), (QuotaKeys.AiDeep, 20), (QuotaKeys.AiHelp, 200), (QuotaKeys.PracticeGenerate, 40), (QuotaKeys.PracticeEssayFeedback, 40)]),
        new(
            PlanCodes.StudentMax,
            "Student Max",
            "Everything in Pro, plus the exam simulator and roughly four times the AI allowance.",
            PlanKinds.Paid, Audiences.Student, 1, IsPublic: false, SortOrder: 20, IsActive: false, 22_900, 229_000,
            [.. StudentProFeatures, (FeatureKeys.ExamSimulator, "Exam simulator", false)],
            [(QuotaKeys.AiQuick, 1200), (QuotaKeys.AiDeep, 40), (QuotaKeys.AiHelp, 200), (QuotaKeys.PracticeGenerate, 150), (QuotaKeys.PracticeEssayFeedback, 150)]),
        Parent(1, 15_900, 30),
        Parent(2, 26_900, 31),
        Parent(3, 37_900, 32),
        Parent(4, 48_900, 33),
    ];

    public async Task SeedAsync(CancellationToken cancellationToken)
    {
        var plans = await db.Plans.IgnoreQueryFilters().ToDictionaryAsync(p => p.Code, StringComparer.Ordinal, cancellationToken);
        var changes = 0;

        foreach (var seed in Plans)
        {
            if (!plans.TryGetValue(seed.Code, out var plan))
            {
                plan = Plan.Create(seed.Code, seed.Name, seed.Description, seed.Kind, seed.Audience, seed.MaxSeats, seed.IsPublic, seed.SortOrder, seed.IsActive);
                db.Plans.Add(plan);
                plans[seed.Code] = plan;
                changes++;
            }
            else if (plan.Refresh(seed.Name, seed.Description, seed.MaxSeats, seed.IsPublic, seed.SortOrder, seed.IsActive))
            {
                changes++;
            }

            changes += await SeedPricesAsync(plan, seed, cancellationToken);
            changes += await SeedFeaturesAsync(plan, seed, cancellationToken);
            changes += await SeedQuotasAsync(plan, seed, cancellationToken);
        }

        await db.SaveChangesAsync(cancellationToken);
        LogSeeded(logger, Plans.Count, changes);
    }

    private static SeedPlan Parent(int children, long monthlyCents, int sortOrder) => new(
        $"parent.{children}",
        children == 1 ? "Parent (1 child)" : $"Parent ({children} children)",
        children == 1
            ? "Covers one child on Student Pro. Parent insights are free on every account."
            : $"Covers up to {children} children on Student Pro. Parent insights are free on every account.",
        PlanKinds.Paid, Audiences.Parent, children, IsPublic: true, sortOrder, IsActive: true, monthlyCents, monthlyCents * 10,
        [(FeatureKeys.FamilyCover, children == 1 ? "Student Pro for one child" : $"Student Pro for up to {children} children", false)],
        [(QuotaKeys.AiHelp, 200)]);

    private async Task<int> SeedPricesAsync(Plan plan, SeedPlan seed, CancellationToken cancellationToken)
    {
        var active = await db.PlanPrices.Where(p => p.PlanId == plan.Id && p.IsActive).ToListAsync(cancellationToken);
        var changes = 0;
        foreach (var (interval, cents) in new[] { (Intervals.Monthly, seed.MonthlyCents), (Intervals.Annual, seed.AnnualCents) })
        {
            var current = active.SingleOrDefault(p => p.Interval == interval);
            if (current is not null && current.AmountCents == cents)
            {
                continue;
            }

            if (current is not null)
            {
                current.Deactivate();
                changes++;
            }

            if (cents is { } amount)
            {
                db.PlanPrices.Add(PlanPrice.Create(plan.Id, interval, amount));
                changes++;
            }
        }

        // The partial unique index allows one active price per interval: deactivations must land first.
        if (changes > 0)
        {
            var added = db.ChangeTracker.Entries<PlanPrice>().Where(e => e.State == EntityState.Added).Select(e => e.Entity).ToList();
            foreach (var price in added)
            {
                db.Entry(price).State = EntityState.Detached;
            }

            await db.SaveChangesAsync(cancellationToken);
            db.PlanPrices.AddRange(added);
        }

        return changes;
    }

    private async Task<int> SeedFeaturesAsync(Plan plan, SeedPlan seed, CancellationToken cancellationToken)
    {
        var existing = await db.PlanFeatures.Where(f => f.PlanId == plan.Id).ToDictionaryAsync(f => f.FeatureKey, StringComparer.Ordinal, cancellationToken);
        var changes = 0;
        foreach (var (key, label, isLive) in seed.Features)
        {
            if (existing.Remove(key, out var feature))
            {
                changes += feature.Refresh(label, isLive) ? 1 : 0;
            }
            else
            {
                db.PlanFeatures.Add(PlanFeature.Create(plan.Id, key, label, isLive));
                changes++;
            }
        }

        db.PlanFeatures.RemoveRange(existing.Values);
        return changes + existing.Count;
    }

    private async Task<int> SeedQuotasAsync(Plan plan, SeedPlan seed, CancellationToken cancellationToken)
    {
        var existing = await db.PlanQuotas.Where(q => q.PlanId == plan.Id).ToDictionaryAsync(q => q.QuotaKey, StringComparer.Ordinal, cancellationToken);
        var changes = 0;
        foreach (var (key, perPeriod) in seed.Quotas)
        {
            if (existing.Remove(key, out var quota))
            {
                changes += quota.Refresh(perPeriod) ? 1 : 0;
            }
            else
            {
                db.PlanQuotas.Add(PlanQuota.Create(plan.Id, key, perPeriod));
                changes++;
            }
        }

        db.PlanQuotas.RemoveRange(existing.Values);
        return changes + existing.Count;
    }

    [LoggerMessage(Level = LogLevel.Information, Message = "Billing catalog seed: {Plans} plans, {Changes} changes")]
    private static partial void LogSeeded(ILogger logger, int plans, int changes);
}
