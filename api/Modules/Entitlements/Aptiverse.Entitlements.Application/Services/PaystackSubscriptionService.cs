using Aptiverse.Api.Data;
using Aptiverse.Entitlements.Domain.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Aptiverse.Entitlements.Application.Services
{
    // Applies verified Paystack webhook events to the local Subscription
    // row. Status mapping:
    //   charge.success            -> active   (+ extend ValidUntil)
    //   subscription.create       -> active   (+ link SubscriptionCode)
    //   invoice.payment_failed    -> past_due
    //   subscription.not_renew    -> cancelled at period end (CancelledAt set,
    //                                ValidUntil left as the paid-through date)
    //   subscription.disable      -> cancelled (immediate)
    public class PaystackSubscriptionService(
        ApplicationDbContext db,
        ILogger<PaystackSubscriptionService> logger) : IPaystackSubscriptionService
    {
        private readonly ApplicationDbContext _db = db;
        private readonly ILogger<PaystackSubscriptionService> _logger = logger;

        public async Task<PaystackWebhookOutcome> HandleEventAsync(
            PaystackWebhookEvent evt, CancellationToken ct = default)
        {
            var subscription = await ResolveSubscriptionAsync(evt, ct);
            if (subscription is null)
            {
                // Unknown / not-yet-linked subscription. Acknowledge so
                // Paystack stops retrying, but record that we no-op'd.
                _logger.LogWarning(
                    "Paystack {Event}: no local subscription matched (sub={Sub}, cus={Cus}, email={Email}, localId={Local}).",
                    evt.Event, evt.SubscriptionCode, evt.CustomerCode, evt.CustomerEmail, evt.LocalSubscriptionId);
                return new PaystackWebhookOutcome
                {
                    Handled = false,
                    Message = $"No local subscription matched for '{evt.Event}'.",
                };
            }

            // Backfill Paystack linkage whenever the event carries it.
            if (!string.IsNullOrWhiteSpace(evt.SubscriptionCode))
                subscription.PaystackSubscriptionCode = evt.SubscriptionCode;
            if (!string.IsNullOrWhiteSpace(evt.CustomerCode))
                subscription.PaystackCustomerCode = evt.CustomerCode;

            string? newStatus = null;
            switch (evt.Event)
            {
                case "charge.success":
                case "subscription.create":
                case "subscription.enable":
                    subscription.Status = "active";
                    subscription.CancelledAt = null;
                    if (evt.NextPaymentDate is { } next)
                        subscription.ValidUntil = next;
                    newStatus = "active";
                    break;

                case "invoice.payment_failed":
                case "invoice.update": // Paystack sends this when a renewal invoice fails too.
                    subscription.Status = "past_due";
                    newStatus = "past_due";
                    break;

                case "subscription.not_renew":
                    // Cancellation scheduled at period end. Keep access until
                    // the already-paid-through date (ValidUntil unchanged).
                    subscription.Status = "cancelled";
                    subscription.CancelledAt = DateTime.UtcNow;
                    newStatus = "cancelled";
                    break;

                case "subscription.disable":
                    // Immediate disable.
                    subscription.Status = "cancelled";
                    subscription.CancelledAt = DateTime.UtcNow;
                    subscription.ValidUntil = DateTime.UtcNow;
                    newStatus = "cancelled";
                    break;

                default:
                    _logger.LogInformation(
                        "Paystack {Event}: no lifecycle action for subscription {Id}.",
                        evt.Event, subscription.Id);
                    return new PaystackWebhookOutcome
                    {
                        Handled = false,
                        Message = $"Ignored event '{evt.Event}'.",
                        SubscriptionId = subscription.Id,
                        NewStatus = subscription.Status,
                    };
            }

            subscription.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync(ct);

            _logger.LogInformation(
                "Paystack {Event}: subscription {Id} -> {Status}.",
                evt.Event, subscription.Id, newStatus);

            return new PaystackWebhookOutcome
            {
                Handled = true,
                Message = $"Applied '{evt.Event}'.",
                SubscriptionId = subscription.Id,
                NewStatus = newStatus,
            };
        }

        // Correlation order, most-specific first:
        //   1. our own Subscription.Id from init metadata
        //   2. Paystack subscription code (set on a prior event)
        //   3. Paystack customer code
        private async Task<Subscription?> ResolveSubscriptionAsync(
            PaystackWebhookEvent evt, CancellationToken ct)
        {
            if (evt.LocalSubscriptionId is { } localId)
            {
                var byId = await _db.Set<Subscription>()
                    .FirstOrDefaultAsync(s => s.Id == localId, ct);
                if (byId is not null) return byId;
            }

            if (!string.IsNullOrWhiteSpace(evt.SubscriptionCode))
            {
                var bySub = await _db.Set<Subscription>()
                    .FirstOrDefaultAsync(s => s.PaystackSubscriptionCode == evt.SubscriptionCode, ct);
                if (bySub is not null) return bySub;
            }

            if (!string.IsNullOrWhiteSpace(evt.CustomerCode))
            {
                var byCus = await _db.Set<Subscription>()
                    .FirstOrDefaultAsync(s => s.PaystackCustomerCode == evt.CustomerCode, ct);
                if (byCus is not null) return byCus;
            }

            return null;
        }
    }
}
