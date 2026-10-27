using System.Text;
using System.Text.Json;
using Aptiverse.Billing.Domain;
using Aptiverse.Billing.Inbox;
using Aptiverse.Billing.Paystack;
using Aptiverse.Billing.Persistence;
using Aptiverse.SharedKernel.Results;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Npgsql;

namespace Aptiverse.Billing.Features.VerifyCheckout;

/// <summary>
/// Called by the /welcome return page. Asks Paystack for the transaction and, when it succeeded, stores it in the
/// inbox under the same dedupe key the charge.success webhook gets and processes it through the same handler, so
/// verify and webhook can never both apply. Webhooks cannot reach localhost, so in development this is how a
/// subscription activates.
/// </summary>
internal sealed partial class VerifyCheckoutHandler(
    BillingDbContext db,
    IPaystackClient paystack,
    InboxWriter inbox,
    InboxProcessor processor,
    ILogger<VerifyCheckoutHandler> logger)
{
    /// <summary>Safety net: if the inline processing fails half way, the queued message finishes it.</summary>
    private static readonly TimeSpan BackgroundRetry = TimeSpan.FromSeconds(30);

    public async Task<Result<CheckoutStatus>> HandleAsync(Guid userId, VerifyCheckoutRequest request, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);
        var session = await db.CheckoutSessions.AsNoTracking()
            .SingleOrDefaultAsync(c => c.Reference == request.Reference && c.UserId == userId, cancellationToken);
        if (session is null)
        {
            return BillingErrors.CheckoutNotFound;
        }

        if (session.Status == CheckoutStatuses.Open)
        {
            PaystackTransaction? verified;
            try
            {
                verified = await paystack.VerifyTransactionAsync(session.Reference, cancellationToken);
            }
            catch (PaystackUnavailableException)
            {
                BillingMetrics.PaystackError("verify");
                return BillingErrors.ProviderUnavailable;
            }
            catch (PaystackRejectedException)
            {
                BillingMetrics.PaystackError("verify");
                return BillingErrors.ProviderError;
            }

            if (verified?.Status == "success")
            {
                await ApplyAsync(verified, cancellationToken);
            }
            else if (verified?.Status == "failed")
            {
                var tracked = await db.CheckoutSessions.SingleAsync(c => c.Id == session.Id, cancellationToken);
                tracked.MarkFailed();
                await db.SaveChangesAsync(cancellationToken);
            }
        }

        db.ChangeTracker.Clear();
        return await StatusAsync(session.Id, cancellationToken);
    }

    private async Task ApplyAsync(PaystackTransaction verified, CancellationToken cancellationToken)
    {
        var payload = JsonSerializer.Serialize(new { @event = PaystackEvents.ChargeSuccess, data = verified.Raw });
        var stored = await inbox.StoreAsync(
            PaystackEvents.ChargeSuccess,
            verified.Raw,
            payload,
            PaystackWebhooks.Sha256Hex(Encoding.UTF8.GetBytes(payload)),
            InboxSources.Reconciliation,
            BackgroundRetry,
            cancellationToken);

        try
        {
            await processor.ProcessAsync(stored.EventId, cancellationToken);
        }
        catch (Exception ex) when (ex is DbUpdateConcurrencyException or PaystackUnavailableException
            || ex is DbUpdateException { InnerException: PostgresException { SqlState: PostgresErrorCodes.UniqueViolation } })
        {
            // The webhook is processing the same payment right now, or Paystack blinked; the queued message finishes it.
            LogDeferred(logger, stored.EventId, ex);
        }
    }

    private async Task<CheckoutStatus> StatusAsync(Guid sessionId, CancellationToken cancellationToken)
    {
        var row = await (from c in db.CheckoutSessions.AsNoTracking()
                         join price in db.PlanPrices.AsNoTracking() on c.PlanPriceId equals price.Id
                         join plan in db.Plans.AsNoTracking() on price.PlanId equals plan.Id
                         join s in db.Subscriptions.AsNoTracking() on c.SubscriptionId equals s.Id into subs
                         from s in subs.DefaultIfEmpty()
                         where c.Id == sessionId
                         select new { c.Status, SubscriptionStatus = s == null ? null : s.Status, plan.Code }).SingleAsync(cancellationToken);

        var status = row.Status switch
        {
            CheckoutStatuses.Paid => "paid",
            CheckoutStatuses.Failed => "failed",
            CheckoutStatuses.Abandoned => "abandoned",
            _ => "pending",
        };
        BillingMetrics.Webhook("checkout.verify", status);
        return new CheckoutStatus(status, row.SubscriptionStatus, row.Code);
    }

    [LoggerMessage(Level = LogLevel.Warning, Message = "Verify left inbox event {EventId} to the background processor")]
    private static partial void LogDeferred(ILogger logger, Guid eventId, Exception exception);
}
