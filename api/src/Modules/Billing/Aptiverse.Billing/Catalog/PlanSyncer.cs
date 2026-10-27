using Aptiverse.Billing.Domain;
using Aptiverse.Billing.Paystack;
using Aptiverse.Billing.Persistence;
using Aptiverse.SharedKernel.Time;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Aptiverse.Billing.Catalog;

/// <param name="PlanCode">Our plan code.</param>
/// <param name="Interval">"monthly" or "annual".</param>
/// <param name="Action">"create", "update" or "none".</param>
/// <param name="PaystackPlanCode">Paystack's code once created.</param>
/// <param name="Error">A stable error code when the price could not be synced, otherwise null.</param>
internal sealed record PlanSyncItem(string PlanCode, string Interval, string Action, string? PaystackPlanCode, string? Error);

internal sealed record PlanSyncReport(bool DryRun, IReadOnlyList<PlanSyncItem> Items);

/// <summary>
/// Pushes active paid prices to Paystack. An admin action (or a pipeline step), never run on boot. Idempotent: creates
/// the Paystack plans that are missing and renames drifted ones, and never changes the amount of an existing Paystack
/// plan, because a price change is a new price row and so a new Paystack plan.
/// </summary>
internal sealed partial class PlanSyncer(BillingDbContext db, IPaystackClient paystack, IClock clock, ILogger<PlanSyncer> logger)
{
    public const string ActionCreate = "create";
    public const string ActionUpdate = "update";
    public const string ActionNone = "none";

    public async Task<PlanSyncReport> SyncAsync(bool dryRun, CancellationToken cancellationToken)
    {
        var rows = await (from price in db.PlanPrices
                          join plan in db.Plans on price.PlanId equals plan.Id
                          where price.IsActive && plan.Kind == PlanKinds.Paid
                          orderby plan.SortOrder, price.Interval
                          select new { Price = price, Plan = plan }).ToListAsync(cancellationToken);

        var items = new List<PlanSyncItem>();
        foreach (var row in rows)
        {
            var name = PaystackName(row.Plan, row.Price);
            items.Add(await SyncOneAsync(row.Plan, row.Price, name, dryRun, cancellationToken));
        }

        if (!dryRun)
        {
            await db.SaveChangesAsync(cancellationToken);
        }

        LogSynced(logger, dryRun, items.Count(i => i.Action == ActionCreate), items.Count(i => i.Action == ActionUpdate), items.Count(i => i.Error is not null));
        return new PlanSyncReport(dryRun, items);
    }

    private async Task<PlanSyncItem> SyncOneAsync(Plan plan, PlanPrice price, string name, bool dryRun, CancellationToken cancellationToken)
    {
        try
        {
            if (price.PaystackPlanCode is null)
            {
                if (dryRun)
                {
                    return new PlanSyncItem(plan.Code, price.Interval, ActionCreate, null, null);
                }

                var code = await paystack.CreatePlanAsync(name, Intervals.ToPaystack(price.Interval), price.AmountCents, price.Currency, cancellationToken);
                price.MarkSynced(code, clock.UtcNow);
                return new PlanSyncItem(plan.Code, price.Interval, ActionCreate, code, null);
            }

            var remote = await paystack.FetchPlanAsync(price.PaystackPlanCode, cancellationToken);
            if (remote is null)
            {
                return new PlanSyncItem(plan.Code, price.Interval, ActionNone, price.PaystackPlanCode, "missing_at_paystack");
            }

            if (remote.Amount != price.AmountCents)
            {
                // Never mutate a live Paystack plan's amount; this needs a new price row.
                return new PlanSyncItem(plan.Code, price.Interval, ActionNone, price.PaystackPlanCode, "amount_differs");
            }

            if (remote.Name == name)
            {
                return new PlanSyncItem(plan.Code, price.Interval, ActionNone, price.PaystackPlanCode, null);
            }

            if (!dryRun)
            {
                await paystack.UpdatePlanNameAsync(price.PaystackPlanCode, name, cancellationToken);
                price.MarkSynced(price.PaystackPlanCode, clock.UtcNow);
            }

            return new PlanSyncItem(plan.Code, price.Interval, ActionUpdate, price.PaystackPlanCode, null);
        }
        catch (PaystackUnavailableException)
        {
            BillingMetrics.PaystackError("plan_sync");
            return new PlanSyncItem(plan.Code, price.Interval, ActionNone, price.PaystackPlanCode, "provider_unavailable");
        }
        catch (PaystackRejectedException)
        {
            BillingMetrics.PaystackError("plan_sync");
            return new PlanSyncItem(plan.Code, price.Interval, ActionNone, price.PaystackPlanCode, "provider_error");
        }
    }

    internal static string PaystackName(Plan plan, PlanPrice price) =>
        $"Aptiverse {plan.Name} ({(price.Interval == Intervals.Annual ? "annual" : "monthly")})";

    [LoggerMessage(Level = LogLevel.Information, Message = "Plan sync (dry run {DryRun}): {Created} created, {Updated} updated, {Failed} failed")]
    private static partial void LogSynced(ILogger logger, bool dryRun, int created, int updated, int failed);
}
