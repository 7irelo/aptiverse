using System.Globalization;
using System.Text.Json;
using Aptiverse.Billing.Contracts;
using Aptiverse.Billing.Domain;
using Aptiverse.Billing.Invoicing;
using Aptiverse.Billing.Paystack;
using Aptiverse.Billing.Persistence;
using Aptiverse.Billing.Subscriptions;
using Aptiverse.SharedKernel.Time;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Wolverine;
using Wolverine.EntityFrameworkCore;

namespace Aptiverse.Billing.Inbox;

/// <summary>
/// Processes one stored Paystack event exactly once. Network calls (verify, disable) happen before the transaction;
/// then the money rows, the status change, the integration events and the inbox row's processed mark commit together.
/// A charge is applied only after Paystack's own verify confirms the status, amount, currency and reference, and the
/// amount always comes from our checkout session or price row, never from the webhook body. Every handler is safe to
/// run twice: a resolved row is skipped and the payment reference is unique.
/// </summary>
internal sealed partial class InboxProcessor(
    IDbContextOutbox<BillingDbContext> outbox,
    IPaystackClient paystack,
    SubscriptionLifecycle lifecycle,
    InvoiceIssuer invoices,
    IClock clock,
    IOptions<BillingOptions> options,
    ILogger<InboxProcessor> logger)
{
    private BillingDbContext Db => outbox.DbContext;

    public async Task ProcessAsync(Guid eventId, CancellationToken cancellationToken)
    {
        var row = await Db.PaystackEvents.SingleOrDefaultAsync(e => e.Id == eventId, cancellationToken);
        if (row is null || row.IsResolved)
        {
            return;
        }

        using var document = JsonDocument.Parse(row.Payload);
        var data = document.RootElement.TryGetProperty("data", out var value) ? value : default;

        switch (row.EventType)
        {
            case PaystackEvents.ChargeSuccess:
                await ChargeSuccessAsync(row, data, cancellationToken);
                break;
            case PaystackEvents.SubscriptionCreate:
            case PaystackEvents.SubscriptionEnable:
                await SubscriptionLinkedAsync(row, data, cancellationToken);
                break;
            case PaystackEvents.SubscriptionNotRenew:
            case PaystackEvents.SubscriptionDisable:
                await SubscriptionStoppedAsync(row, data, cancellationToken);
                break;
            case PaystackEvents.InvoicePaymentFailed:
                await InvoicePaymentFailedAsync(row, data, cancellationToken);
                break;
            case PaystackEvents.RefundProcessed:
            case PaystackEvents.RefundFailed:
            case PaystackEvents.RefundPending:
                await RefundAsync(row, data, cancellationToken);
                break;
            default:
                await FinishAsync(row, r => r.MarkIgnored("unhandled_event", clock.UtcNow), cancellationToken);
                break;
        }

        LogProcessed(logger, row.EventType, row.Id, row.Status);
    }

    private async Task ChargeSuccessAsync(PaystackEvent row, JsonElement data, CancellationToken cancellationToken)
    {
        var reference = PaystackJson.String(data, "reference");
        if (string.IsNullOrWhiteSpace(reference))
        {
            await FinishAsync(row, r => r.MarkIgnored("no_reference", clock.UtcNow), cancellationToken);
            return;
        }

        // Never trust the body: Paystack's verify is the source of truth for status, amount and currency.
        var verified = await VerifyAsync(reference, cancellationToken);
        if (verified is null || verified.Status != "success" || !string.Equals(verified.Reference, reference, StringComparison.Ordinal))
        {
            await FinishAsync(row, r => r.MarkIgnored("not_verified", clock.UtcNow), cancellationToken);
            return;
        }

        await using var transaction = await Db.Database.BeginTransactionAsync(cancellationToken);
        if (await Db.Payments.AnyAsync(p => p.PaystackReference == reference || p.PaystackTransactionId == verified.Id, cancellationToken))
        {
            await FinishAsync(row, r => r.MarkProcessed(clock.UtcNow), cancellationToken, transaction);
            return;
        }

        var session = await Db.CheckoutSessions.SingleOrDefaultAsync(c => c.Reference == reference, cancellationToken);
        if (session is not null)
        {
            await FirstPaymentAsync(row, session, verified, transaction, cancellationToken);
        }
        else
        {
            await RenewalAsync(row, verified, transaction, cancellationToken);
        }
    }

    private async Task FirstPaymentAsync(PaystackEvent row, CheckoutSession session, PaystackTransaction verified, IDbContextTransaction transaction, CancellationToken cancellationToken)
    {
        if (verified.Amount != session.AmountCents || !string.Equals(verified.Currency, session.Currency, StringComparison.Ordinal))
        {
            Drift(DriftKinds.AmountMismatch, session.Reference, session.Id, Money(session.AmountCents, session.Currency), Money(verified.Amount, verified.Currency));
            await FinishAsync(row, r => r.MarkIgnored("amount_mismatch", clock.UtcNow), cancellationToken, transaction);
            return;
        }

        var subscription = await Db.Subscriptions.SingleAsync(s => s.Id == session.SubscriptionId, cancellationToken);
        var price = await Db.PlanPrices.AsNoTracking().SingleAsync(p => p.Id == session.PlanPriceId, cancellationToken);
        var plan = await Db.Plans.AsNoTracking().SingleAsync(p => p.Id == subscription.PlanId, cancellationToken);
        var paidAt = verified.PaidAt ?? clock.UtcNow;

        var payment = Payment.Succeeded(
            session.UserId, subscription.Id, session.Id, session.Reference, verified.Id, verified.Amount, verified.Fees,
            verified.Currency, verified.Channel, PaymentPurposes.Subscription, paidAt);
        session.MarkPaid();
        subscription.LinkPaystack(verified.CustomerCode, null);

        var activated = false;
        var holdsSlot = await Db.Subscriptions.AnyAsync(
            s => s.Id != subscription.Id && s.OwnerUserId == subscription.OwnerUserId && s.Audience == subscription.Audience
                && SubscriptionStatuses.Holding.Contains(s.Status),
            cancellationToken);
        if (subscription.Status == SubscriptionStatuses.Incomplete && !holdsSlot)
        {
            await lifecycle.TransitionAsync(subscription, SubscriptionStateMachine.FirstPayment, TriggerTypes.Webhook, row.Id.ToString(), cancellationToken);
            subscription.StartPeriod(paidAt);
            activated = true;
        }
        else
        {
            // Paid, but the subscription can no longer be activated (expired session, or already subscribed): keep the
            // money record and flag it for a person to resolve, never drop it.
            Drift(DriftKinds.SubscriptionStatusMismatch, session.Reference, subscription.Id, SubscriptionStatuses.Incomplete, holdsSlot ? "already_subscribed" : subscription.Status);
        }

        var invoice = await invoices.IssueAsync(payment, LineDescription(plan, price), subscription.CurrentPeriodStart, subscription.CurrentPeriodEnd, cancellationToken);
        await RecordPaymentAsync(payment, invoice, plan.Code, cancellationToken);
        if (activated)
        {
            await outbox.PublishAsync(new SubscriptionActivated(
                subscription.Id, subscription.OwnerUserId, plan.Code, price.Interval, subscription.CurrentPeriodEnd!.Value, clock.UtcNow));
        }

        await FinishAsync(row, r => r.MarkProcessed(clock.UtcNow), cancellationToken, transaction);
    }

    private async Task RenewalAsync(PaystackEvent row, PaystackTransaction verified, IDbContextTransaction transaction, CancellationToken cancellationToken)
    {
        var price = verified.PlanCode is { } planCode
            ? await Db.PlanPrices.AsNoTracking().SingleOrDefaultAsync(p => p.PaystackPlanCode == planCode, cancellationToken)
            : null;
        var subscription = price is null || verified.CustomerCode is null
            ? null
            : await Db.Subscriptions
                .Where(s => s.PaystackCustomerCode == verified.CustomerCode && s.PlanPriceId == price.Id && SubscriptionStatuses.Holding.Contains(s.Status))
                .OrderByDescending(s => s.CreatedAt)
                .FirstOrDefaultAsync(cancellationToken);

        if (price is null || subscription is null)
        {
            Drift(DriftKinds.UnmatchedCharge, verified.Reference, null, "a checkout session or subscription", Money(verified.Amount, verified.Currency));
            await FinishAsync(row, r => r.MarkIgnored("unmatched_charge", clock.UtcNow), cancellationToken, transaction);
            return;
        }

        if (verified.Amount != price.AmountCents || !string.Equals(verified.Currency, price.Currency, StringComparison.Ordinal))
        {
            Drift(DriftKinds.AmountMismatch, verified.Reference, subscription.Id, Money(price.AmountCents, price.Currency), Money(verified.Amount, verified.Currency));
            await FinishAsync(row, r => r.MarkIgnored("amount_mismatch", clock.UtcNow), cancellationToken, transaction);
            return;
        }

        var plan = await Db.Plans.AsNoTracking().SingleAsync(p => p.Id == subscription.PlanId, cancellationToken);
        var paidAt = verified.PaidAt ?? clock.UtcNow;
        var payment = Payment.Succeeded(
            subscription.OwnerUserId, subscription.Id, null, verified.Reference, verified.Id, verified.Amount, verified.Fees,
            verified.Currency, verified.Channel, PaymentPurposes.Renewal, paidAt);

        var transition = subscription.Status switch
        {
            SubscriptionStatuses.Active => SubscriptionStateMachine.Renewed,
            SubscriptionStatuses.PastDue => SubscriptionStateMachine.RetrySucceeded,
            _ => null,
        };
        if (transition is not null)
        {
            await lifecycle.TransitionAsync(subscription, transition, TriggerTypes.Webhook, row.Id.ToString(), cancellationToken);
            subscription.ExtendPeriod(paidAt);
        }
        else
        {
            Drift(DriftKinds.SubscriptionStatusMismatch, verified.Reference, subscription.Id, SubscriptionStatuses.Active, subscription.Status);
        }

        var invoice = await invoices.IssueAsync(payment, LineDescription(plan, price), subscription.CurrentPeriodStart, subscription.CurrentPeriodEnd, cancellationToken);
        await RecordPaymentAsync(payment, invoice, plan.Code, cancellationToken);
        await FinishAsync(row, r => r.MarkProcessed(clock.UtcNow), cancellationToken, transaction);
    }

    /// <summary>The payment row, its ledger charge and PaymentSucceeded, all in the caller's transaction.</summary>
    private async Task RecordPaymentAsync(Payment payment, Invoice invoice, string planCode, CancellationToken cancellationToken)
    {
        var first = !await Db.Payments.AnyAsync(p => p.UserId == payment.UserId, cancellationToken);
        Db.Payments.Add(payment);
        Db.LedgerEntries.Add(LedgerEntry.Charge(payment, invoice.Id, $"{planCode} {payment.Purpose} {payment.PaystackReference}"));
        await outbox.PublishAsync(new PaymentSucceeded(
            payment.Id, payment.UserId, payment.SubscriptionId, planCode, payment.AmountCents, invoice.VatCents, payment.Currency,
            payment.Purpose, first, payment.PaidAt));
        BillingMetrics.PaymentSucceeded(payment.AmountCents);
    }

    /// <summary>subscription.create and subscription.enable: link the Paystack subscription; enable resumes a cancelling one.</summary>
    private async Task SubscriptionLinkedAsync(PaystackEvent row, JsonElement data, CancellationToken cancellationToken)
    {
        var code = PaystackJson.String(data, "subscription_code");
        var customer = PaystackJson.Nested(data, "customer", "customer_code");
        var planCode = PaystackJson.PlanCode(data);
        if (string.IsNullOrWhiteSpace(code))
        {
            await FinishAsync(row, r => r.MarkIgnored("no_subscription_code", clock.UtcNow), cancellationToken);
            return;
        }

        var subscription = await Db.Subscriptions.SingleOrDefaultAsync(s => s.PaystackSubscriptionCode == code, cancellationToken);
        if (subscription is null && customer is not null && planCode is not null)
        {
            subscription = await (from s in Db.Subscriptions
                                  join p in Db.PlanPrices on s.PlanPriceId equals p.Id
                                  where s.PaystackCustomerCode == customer && s.PaystackSubscriptionCode == null && p.PaystackPlanCode == planCode
                                        && SubscriptionStatuses.Holding.Contains(s.Status)
                                  orderby s.CreatedAt descending
                                  select s).FirstOrDefaultAsync(cancellationToken);
        }

        if (subscription is null)
        {
            // Usually charge.success for the first payment has not been processed yet: try again shortly.
            await DeferAsync(row, "subscription_not_found", cancellationToken);
            return;
        }

        // Cancelled here before Paystack told us its code: stop the billing at Paystack now that we can.
        if (row.EventType == PaystackEvents.SubscriptionCreate && subscription.Status == SubscriptionStatuses.Cancelling
            && PaystackJson.String(data, "email_token") is { Length: > 0 } token)
        {
            await DisableAsync(code, token, cancellationToken);
        }

        await using var transaction = await Db.Database.BeginTransactionAsync(cancellationToken);
        subscription.LinkPaystack(customer, code);
        if (row.EventType == PaystackEvents.SubscriptionEnable && subscription.Status == SubscriptionStatuses.Cancelling)
        {
            await lifecycle.TransitionAsync(subscription, SubscriptionStateMachine.Resumed, TriggerTypes.Webhook, row.Id.ToString(), cancellationToken);
            subscription.ClearCancellation();
        }

        await FinishAsync(row, r => r.MarkProcessed(clock.UtcNow), cancellationToken, transaction);
    }

    /// <summary>subscription.not_renew and subscription.disable.</summary>
    private async Task SubscriptionStoppedAsync(PaystackEvent row, JsonElement data, CancellationToken cancellationToken)
    {
        var code = PaystackJson.String(data, "subscription_code");
        var subscription = code is null ? null : await Db.Subscriptions.SingleOrDefaultAsync(s => s.PaystackSubscriptionCode == code, cancellationToken);
        if (subscription is null)
        {
            await DeferAsync(row, "subscription_not_found", cancellationToken);
            return;
        }

        await using var transaction = await Db.Database.BeginTransactionAsync(cancellationToken);
        var trigger = row.Id.ToString();
        var now = clock.UtcNow;
        switch (subscription.Status)
        {
            case SubscriptionStatuses.Active:
                await lifecycle.CancelAtPeriodEndAsync(subscription, "paystack", TriggerTypes.Webhook, trigger, cancellationToken);
                break;
            case SubscriptionStatuses.PastDue when row.EventType == PaystackEvents.SubscriptionDisable:
                await lifecycle.EndNowAsync(subscription, SubscriptionStateMachine.GraceExhausted, "past_due", TriggerTypes.Webhook, trigger, cancellationToken);
                break;
            case SubscriptionStatuses.Cancelling when row.EventType == PaystackEvents.SubscriptionDisable && subscription.CurrentPeriodEnd <= now:
                await lifecycle.EndNowAsync(subscription, SubscriptionStateMachine.PeriodEnded, "paystack", TriggerTypes.Webhook, trigger, cancellationToken);
                break;
            default:
                break;
        }

        await FinishAsync(row, r => r.MarkProcessed(clock.UtcNow), cancellationToken, transaction);
    }

    private async Task InvoicePaymentFailedAsync(PaystackEvent row, JsonElement data, CancellationToken cancellationToken)
    {
        var code = PaystackJson.Nested(data, "subscription", "subscription_code") ?? PaystackJson.String(data, "subscription_code");
        var subscription = code is null ? null : await Db.Subscriptions.SingleOrDefaultAsync(s => s.PaystackSubscriptionCode == code, cancellationToken);
        if (subscription is null)
        {
            await DeferAsync(row, "subscription_not_found", cancellationToken);
            return;
        }

        await using var transaction = await Db.Database.BeginTransactionAsync(cancellationToken);
        var now = clock.UtcNow;
        if (subscription.Status == SubscriptionStatuses.Active)
        {
            await lifecycle.TransitionAsync(subscription, SubscriptionStateMachine.RenewalFailed, TriggerTypes.Webhook, row.Id.ToString(), cancellationToken);
            subscription.RecordRenewalFailure(now);
            var grace = TimeSpan.FromDays(options.Value.PastDueGraceDays);
            await outbox.ScheduleAsync(new CheckPastDueSubscription(subscription.Id, subscription.PastDueSince!.Value), grace);
        }
        else if (subscription.Status == SubscriptionStatuses.PastDue)
        {
            subscription.RecordRenewalFailure(now);
        }

        if (subscription.Status == SubscriptionStatuses.PastDue)
        {
            await outbox.PublishAsync(new PaymentFailed(subscription.OwnerUserId, subscription.Id, "invoice_payment_failed", now));
        }

        await FinishAsync(row, r => r.MarkProcessed(clock.UtcNow), cancellationToken, transaction);
    }

    private async Task RefundAsync(PaystackEvent row, JsonElement data, CancellationToken cancellationToken)
    {
        var reference = PaystackJson.String(data, "transaction_reference") ?? PaystackJson.Nested(data, "transaction", "reference");
        var refundId = PaystackJson.Long(data, "id");
        var amount = PaystackJson.Long(data, "amount");
        if (reference is null || refundId is null || amount is not > 0)
        {
            await FinishAsync(row, r => r.MarkIgnored("incomplete_refund", clock.UtcNow), cancellationToken);
            return;
        }

        await using var transaction = await Db.Database.BeginTransactionAsync(cancellationToken);
        var payment = await Db.Payments.SingleOrDefaultAsync(p => p.PaystackReference == reference, cancellationToken);
        if (payment is null)
        {
            Drift(DriftKinds.UnmatchedCharge, reference, null, "a recorded payment", Money(amount.Value, PaystackJson.String(data, "currency") ?? string.Empty));
            await FinishAsync(row, r => r.MarkIgnored("unknown_payment", clock.UtcNow), cancellationToken, transaction);
            return;
        }

        var refund = await Db.Refunds.SingleOrDefaultAsync(r => r.PaystackRefundId == refundId, cancellationToken);
        if (refund is null)
        {
            refund = Refund.FromPaystack(payment.Id, amount.Value, payment.Currency, refundId.Value, RefundStatuses.Pending, "Refunded at Paystack");
            Db.Refunds.Add(refund);
        }

        var now = clock.UtcNow;
        switch (row.EventType)
        {
            case PaystackEvents.RefundFailed:
                refund.MarkFailed();
                break;
            case PaystackEvents.RefundProcessed:
                var alreadyRefunded = await Db.Refunds
                    .Where(r => r.PaymentId == payment.Id && r.Status == RefundStatuses.Processed && r.Id != refund.Id)
                    .SumAsync(r => (long?)r.AmountCents, cancellationToken) ?? 0;
                if (alreadyRefunded + refund.AmountCents > payment.AmountCents)
                {
                    // Never record more money back than was paid; a person looks at it.
                    Db.ChangeTracker.Entries<Refund>().Where(e => e.State == EntityState.Added).ToList().ForEach(e => e.State = EntityState.Detached);
                    Drift(DriftKinds.RefundExceedsPayment, reference, payment.Id, Money(payment.AmountCents - alreadyRefunded, payment.Currency), Money(refund.AmountCents, payment.Currency));
                    await FinishAsync(row, r => r.MarkIgnored("refund_exceeds_payment", now), cancellationToken, transaction);
                    return;
                }

                if (refund.MarkProcessed(now))
                {
                    var total = alreadyRefunded + refund.AmountCents;
                    Db.LedgerEntries.Add(LedgerEntry.ForRefund(payment, refund, now));
                    if (payment.InvoiceId is { } invoiceId)
                    {
                        var invoice = await Db.Invoices.SingleAsync(i => i.Id == invoiceId, cancellationToken);
                        invoice.ApplyRefunds(total);
                    }

                    await outbox.PublishAsync(new RefundIssued(refund.Id, payment.Id, payment.UserId, refund.AmountCents, refund.Currency, total == payment.AmountCents, now));
                    BillingMetrics.RefundProcessed(refund.AmountCents);
                }

                break;
            default:
                break;
        }

        await FinishAsync(row, r => r.MarkProcessed(now), cancellationToken, transaction);
    }

    private async Task<PaystackTransaction?> VerifyAsync(string reference, CancellationToken cancellationToken)
    {
        try
        {
            return await paystack.VerifyTransactionAsync(reference, cancellationToken);
        }
        catch (PaystackRejectedException)
        {
            BillingMetrics.PaystackError("verify");
            return null;
        }
        catch (PaystackUnavailableException)
        {
            BillingMetrics.PaystackError("verify");
            throw;
        }
    }

    private async Task DisableAsync(string code, string token, CancellationToken cancellationToken)
    {
        try
        {
            await paystack.DisableSubscriptionAsync(code, token, cancellationToken);
        }
        catch (Exception ex) when (ex is PaystackRejectedException or PaystackUnavailableException)
        {
            BillingMetrics.PaystackError("subscription_disable");
            throw;
        }
    }

    private void Drift(string kind, string? reference, Guid? localId, string expected, string actual)
    {
        Db.ReconciliationDrifts.Add(ReconciliationDrift.Raise(null, kind, reference, localId, expected, actual));
        BillingMetrics.DriftRaised(kind);
        LogDrift(logger, kind, localId);
    }

    /// <summary>Keeps the row pending and processes it again later; fails it after the configured attempts.</summary>
    private async Task DeferAsync(PaystackEvent row, string reason, CancellationToken cancellationToken)
    {
        var attempts = row.Defer(reason);
        if (attempts >= options.Value.InboxMaxAttempts)
        {
            row.MarkFailed(reason, clock.UtcNow);
            LogFailed(logger, row.EventType, row.Id, reason);
        }
        else
        {
            await outbox.ScheduleAsync(new ProcessPaystackEvent(row.Id), TimeSpan.FromSeconds(options.Value.InboxRetrySeconds));
        }

        await outbox.SaveChangesAndFlushMessagesAsync(cancellationToken);
    }

    private async Task FinishAsync(PaystackEvent row, Action<PaystackEvent> mark, CancellationToken cancellationToken, IDbContextTransaction? transaction = null)
    {
        mark(row);
        await outbox.SaveChangesAndFlushMessagesAsync(cancellationToken);
        if (transaction is not null && Db.Database.CurrentTransaction is not null)
        {
            await transaction.CommitAsync(cancellationToken);
        }
    }

    private static string LineDescription(Plan plan, PlanPrice price) =>
        $"{plan.Name} ({(price.Interval == Intervals.Annual ? "annual" : "monthly")})";

    private static string Money(long cents, string currency) =>
        string.Create(CultureInfo.InvariantCulture, $"{cents} {currency}");

    [LoggerMessage(Level = LogLevel.Information, Message = "Paystack event {EventType} {EventId} is {Status}")]
    private static partial void LogProcessed(ILogger logger, string eventType, Guid eventId, string status);

    [LoggerMessage(Level = LogLevel.Warning, Message = "Billing drift {Kind} raised for {LocalId}")]
    private static partial void LogDrift(ILogger logger, string kind, Guid? localId);

    [LoggerMessage(Level = LogLevel.Error, Message = "Paystack event {EventType} {EventId} failed: {Reason}")]
    private static partial void LogFailed(ILogger logger, string eventType, Guid eventId, string reason);
}
