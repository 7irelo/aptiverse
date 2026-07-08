using Aptiverse.Api.Data;
using Aptiverse.Entitlements.Domain.Models;
using Aptiverse.Entitlements.Infrastructure.Paystack;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Aptiverse.Entitlements.Infrastructure.Data
{
    // Ensures a Paystack recurring Plan (PLN_...) exists for every paid
    // local plan and billing interval, storing the returned code on the
    // Plan row so checkout can start an auto-renewing subscription.
    //
    // Idempotent: it only creates a plan when the stored code is null, so
    // after the first successful boot it is a no-op (one cheap DB read).
    // Best-effort: a Paystack outage logs a warning and leaves the code
    // null — checkout falls back to a one-off charge, and the next boot
    // retries. Runs only when a secret key is configured.
    //
    // Note: Paystack plans are per-account and per-mode. Test-mode keys
    // create test plans; switching to a live key mints a fresh set (the
    // stored test codes stay null-guarded per row, so live boot creates
    // live plans only where the column is still empty — clear the columns
    // if you ever need to re-mint against a different account).
    public static class PaystackPlanSyncer
    {
        public static async Task SyncAsync(
            ApplicationDbContext db,
            IPaystackClient paystack,
            ILogger logger,
            CancellationToken ct = default)
        {
            if (!paystack.IsConfigured)
            {
                logger.LogInformation("Paystack not configured — skipping recurring plan sync.");
                return;
            }

            var plans = await db.Set<Plan>()
                .Where(p => p.Kind == "paid")
                .ToListAsync(ct);

            var changed = false;
            foreach (var plan in plans)
            {
                if (plan.MonthlyPriceZar is > 0m
                    && string.IsNullOrWhiteSpace(plan.PaystackPlanCodeMonthly))
                {
                    var code = await TryCreateAsync(
                        paystack, logger, $"{plan.Name} (Monthly)",
                        plan.MonthlyPriceZar.Value, "monthly", ct);
                    if (code is not null) { plan.PaystackPlanCodeMonthly = code; changed = true; }
                }

                if (plan.AnnualPriceZar is > 0m
                    && string.IsNullOrWhiteSpace(plan.PaystackPlanCodeAnnual))
                {
                    var code = await TryCreateAsync(
                        paystack, logger, $"{plan.Name} (Annual)",
                        plan.AnnualPriceZar.Value, "annually", ct);
                    if (code is not null) { plan.PaystackPlanCodeAnnual = code; changed = true; }
                }
            }

            if (changed) await db.SaveChangesAsync(ct);
        }

        private static async Task<string?> TryCreateAsync(
            IPaystackClient paystack, ILogger logger,
            string name, decimal priceZar, string interval, CancellationToken ct)
        {
            var amountMinor = (long)decimal.Round(priceZar * 100m, 0, MidpointRounding.AwayFromZero);
            try
            {
                var code = await paystack.CreatePlanAsync(new PaystackPlanRequest
                {
                    Name = name,
                    AmountMinor = amountMinor,
                    Interval = interval,
                    Currency = "ZAR",
                }, ct);
                logger.LogInformation("Paystack plan created: {Name} -> {Code}", name, code);
                return code;
            }
            catch (Exception ex)
            {
                logger.LogWarning(ex,
                    "Paystack plan sync failed for '{Name}'; will retry on next boot.", name);
                return null;
            }
        }
    }
}
