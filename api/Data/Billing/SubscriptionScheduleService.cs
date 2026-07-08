using Aptiverse.Api.Data;
using Aptiverse.Core.Services;
using Aptiverse.Entitlements.Domain.Models;
using Aptiverse.Entitlements.Infrastructure.Paystack;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace Aptiverse.Api.Data.Billing
{
    // Path A recurring-billing worker. We own the renewal cadence, so this
    // charges the saved card token directly (charge_authorization) — Paystack
    // never holds a subscription object and never emails the off-site
    // manage-link. Each tick, for every sub whose paid period has elapsed:
    //
    //   - renew the current plan (or, if a downgrade is scheduled, charge the
    //     lower plan instead and switch to it);
    //   - on success, extend ValidUntil by the billing interval;
    //   - on failure, mark past_due and retry (dunning), lapsing to free after
    //     MaxRenewalAttempts;
    //   - lapse straight to free when the effective plan is unpaid.
    //
    // Upgrades never come through here (they are immediate, via checkout).
    public class SubscriptionScheduleService(
        IServiceProvider services,
        ILogger<SubscriptionScheduleService> logger) : BackgroundService
    {
        private static readonly TimeSpan Interval = TimeSpan.FromMinutes(5);

        // Consecutive failed renewals before a past-due sub lapses to free.
        private const int MaxRenewalAttempts = 4;

        private const string BillingUrl = "https://aptiverse.co.za/dashboard/billing";

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            logger.LogInformation(
                "SubscriptionScheduleService started — charging due renewals + downgrades every {Min} min.",
                Interval.TotalMinutes);

            using var timer = new PeriodicTimer(Interval);
            do
            {
                try
                {
                    await ProcessDueAsync(stoppingToken);
                }
                catch (OperationCanceledException)
                {
                    break;
                }
                catch (Exception ex)
                {
                    logger.LogError(ex, "SubscriptionScheduleService tick failed; will retry next tick.");
                }
            } while (await timer.WaitForNextTickAsync(stoppingToken));
        }

        private async Task ProcessDueAsync(CancellationToken ct)
        {
            using var scope = services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var paystack = scope.ServiceProvider.GetRequiredService<IPaystackClient>();
            var email = scope.ServiceProvider.GetRequiredService<IEmailSender>();

            var now = DateTime.UtcNow;
            // Every sub whose paid period has elapsed and that we can charge:
            // active (a normal renewal) or already past-due (a dunning retry),
            // with a saved card token.
            var due = await db.Set<Subscription>()
                .Where(s => (s.Status == "active" || s.Status == "past_due")
                    && s.ValidUntil != null && s.ValidUntil <= now
                    && s.PaystackAuthorizationCode != null)
                .ToListAsync(ct);
            if (due.Count == 0) return;

            foreach (var sub in due)
            {
                // A scheduled downgrade switches plan at period end; otherwise
                // we renew the current plan on its current interval.
                var effectivePlanCode = sub.PendingPlanCode ?? sub.PlanCode;
                var effectiveBilling = sub.PendingPlanCode != null
                    ? sub.PendingBilling ?? sub.Billing
                    : sub.Billing;
                var annual = string.Equals(effectiveBilling, "annual", StringComparison.OrdinalIgnoreCase);

                var plan = await db.Set<Plan>().AsNoTracking()
                    .FirstOrDefaultAsync(p => p.Code == effectivePlanCode, ct);
                var priceZar = annual
                    ? plan?.AnnualPriceZar ?? plan?.MonthlyPriceZar ?? 0m
                    : plan?.MonthlyPriceZar ?? 0m;

                // Effective plan is free/unpaid, or we simply cannot charge
                // (no billing email / Paystack not configured): lapse to free.
                if (plan is null || priceZar <= 0m
                    || string.IsNullOrWhiteSpace(sub.BillingEmail) || !paystack.IsConfigured)
                {
                    sub.Status = "cancelled";
                    sub.CancelledAt = now;
                    sub.PendingPlanCode = null;
                    sub.PendingBilling = null;
                    sub.UpdatedAt = now;
                    logger.LogInformation("Sub {Id}: lapsed to free at period end ({Plan}).", sub.Id, effectivePlanCode);
                    continue;
                }

                var amountMinor = (long)decimal.Round(priceZar * 100m, 0, MidpointRounding.AwayFromZero);
                var charge = await paystack.ChargeAuthorizationAsync(new PaystackChargeRequest
                {
                    Email = sub.BillingEmail!,
                    AmountMinor = amountMinor,
                    AuthorizationCode = sub.PaystackAuthorizationCode!,
                    Currency = "ZAR",
                    Metadata = new Dictionary<string, string>
                    {
                        ["subscription_id"] = sub.Id.ToString(),
                        ["plan_code"] = effectivePlanCode,
                        ["billing"] = annual ? "annual" : "monthly",
                        ["kind"] = "renewal",
                    },
                }, ct);

                if (charge.Success)
                {
                    sub.PlanCode = effectivePlanCode;
                    sub.Billing = annual ? "annual" : "monthly";
                    sub.PendingPlanCode = null;
                    sub.PendingBilling = null;
                    sub.Status = "active";
                    sub.RenewalFailureCount = 0;
                    sub.LastChargeAt = now;
                    sub.ValidUntil = annual ? now.AddYears(1) : now.AddMonths(1);
                    // The card can re-tokenise; keep the latest token + summary.
                    if (!string.IsNullOrWhiteSpace(charge.AuthorizationCode)) sub.PaystackAuthorizationCode = charge.AuthorizationCode;
                    if (!string.IsNullOrWhiteSpace(charge.CardBrand)) sub.CardBrand = charge.CardBrand;
                    if (!string.IsNullOrWhiteSpace(charge.CardLast4)) sub.CardLast4 = charge.CardLast4;
                    if (charge.CardExpMonth is { } cm) sub.CardExpMonth = cm;
                    if (charge.CardExpYear is { } cy) sub.CardExpYear = cy;
                    sub.UpdatedAt = now;
                    logger.LogInformation(
                        "Renewal {Id}: charged {Plan} {Amt}c; next charge {Next:o}.",
                        sub.Id, effectivePlanCode, amountMinor, sub.ValidUntil);
                    await TrySendAsync(email, sub.BillingEmail, "Your Aptiverse payment", "payment_receipt", new
                    {
                        PlanName = plan.Name,
                        AmountZar = $"R{priceZar:0.00}",
                        NextChargeDate = sub.ValidUntil?.ToString("d MMM yyyy") ?? "",
                        CardLast4 = sub.CardLast4 ?? "",
                        BillingUrl,
                    });
                }
                else
                {
                    sub.RenewalFailureCount += 1;
                    sub.UpdatedAt = now;
                    if (sub.RenewalFailureCount >= MaxRenewalAttempts)
                    {
                        sub.Status = "cancelled";
                        sub.CancelledAt = now;
                        sub.ValidUntil = now;
                        sub.PendingPlanCode = null;
                        sub.PendingBilling = null;
                        logger.LogWarning(
                            "Renewal {Id}: failed {N}x ({Resp}); cancelled.",
                            sub.Id, sub.RenewalFailureCount, charge.GatewayResponse ?? charge.Status);
                        await TrySendAsync(email, sub.BillingEmail, "Your Aptiverse subscription has ended", "subscription_cancelled", new
                        {
                            PlanName = plan.Name,
                            AccessUntil = now.ToString("d MMM yyyy"),
                            BillingUrl,
                        });
                    }
                    else
                    {
                        // Back off to ~daily retries during the dunning window
                        // instead of hammering the card every tick.
                        sub.Status = "past_due";
                        sub.ValidUntil = now.AddDays(1);
                        logger.LogWarning(
                            "Renewal {Id}: failed {N}x ({Resp}); past_due, retry ~1d.",
                            sub.Id, sub.RenewalFailureCount, charge.GatewayResponse ?? charge.Status);
                        await TrySendAsync(email, sub.BillingEmail, "We couldn't charge your card", "payment_failed", new
                        {
                            PlanName = plan.Name,
                            AmountZar = $"R{priceZar:0.00}",
                            BillingUrl,
                        });
                    }
                }
            }

            await db.SaveChangesAsync(ct);
        }

        // Best-effort branded email; never let an email failure abort the tick.
        private async Task TrySendAsync(
            IEmailSender email, string? to, string subject, string templateType, object data)
        {
            if (string.IsNullOrWhiteSpace(to)) return;
            try
            {
                await email.SendTemplateEmailAsync(to, subject, templateType, data);
            }
            catch (Exception ex)
            {
                logger.LogWarning(ex, "Renewal email {Type} to {To} failed to enqueue.", templateType, to);
            }
        }
    }
}
