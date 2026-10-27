using System.Security.Cryptography;
using System.Text;
using Aptiverse.Billing.Domain;
using Aptiverse.Billing.Paystack;
using Aptiverse.Billing.Persistence;
using Aptiverse.Billing.Subscriptions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Wolverine.EntityFrameworkCore;

namespace Aptiverse.Billing.Erasure;

/// <summary>
/// Handles an erasure request (POPIA). Billing stops at Paystack first, so a deleted account is never charged again.
/// Financial records (payments, refunds, ledger, invoice amounts and numbers) are tax records and are kept; only the
/// personal snapshot on invoices is replaced with a pseudonym. Idempotent: a repeat finds nothing left to change.
/// </summary>
internal sealed partial class BillingUserDataEraser(
    IDbContextOutbox<BillingDbContext> outbox,
    IPaystackClient paystack,
    SubscriptionLifecycle lifecycle,
    ILogger<BillingUserDataEraser> logger)
{
    public const string Reason = "erasure";

    private BillingDbContext Db => outbox.DbContext;

    public static string Pseudonym(Guid userId) =>
        "Erased " + Convert.ToHexStringLower(SHA256.HashData(Encoding.UTF8.GetBytes(userId.ToString("N"))))[..12];

    public async Task EraseAsync(Guid userId, CancellationToken cancellationToken)
    {
        var subscriptions = await Db.Subscriptions
            .Where(s => s.OwnerUserId == userId && (s.Status == SubscriptionStatuses.Incomplete || SubscriptionStatuses.Holding.Contains(s.Status)))
            .ToListAsync(cancellationToken);

        // Network first, outside the transaction; a failure throws and Wolverine retries the whole erasure.
        foreach (var subscription in subscriptions.Where(s => s.PaystackSubscriptionCode is not null && s.Status != SubscriptionStatuses.Cancelling))
        {
            await StopAtPaystackAsync(subscription.PaystackSubscriptionCode!, cancellationToken);
        }

        await using var transaction = await Db.Database.BeginTransactionAsync(cancellationToken);
        foreach (var subscription in subscriptions)
        {
            switch (subscription.Status)
            {
                case SubscriptionStatuses.Incomplete:
                    await lifecycle.TransitionAsync(subscription, SubscriptionStateMachine.CheckoutExpired, TriggerTypes.User, Reason, cancellationToken);
                    break;
                case SubscriptionStatuses.Active:
                    await lifecycle.CancelAtPeriodEndAsync(subscription, Reason, TriggerTypes.User, Reason, cancellationToken);
                    break;
                case SubscriptionStatuses.PastDue:
                    await lifecycle.EndNowAsync(subscription, SubscriptionStateMachine.GraceExhausted, Reason, TriggerTypes.User, Reason, cancellationToken);
                    break;
                default:
                    break;
            }
        }

        var pseudonym = Pseudonym(userId);
        var invoices = await Db.Invoices.Where(i => i.UserId == userId && i.BillingName != pseudonym).ToListAsync(cancellationToken);
        foreach (var invoice in invoices)
        {
            invoice.Pseudonymise(pseudonym, string.Empty);
        }

        await outbox.SaveChangesAndFlushMessagesAsync(cancellationToken);
        if (Db.Database.CurrentTransaction is not null)
        {
            await transaction.CommitAsync(cancellationToken);
        }

        LogErased(logger, userId, subscriptions.Count, invoices.Count);
    }

    private async Task StopAtPaystackAsync(string code, CancellationToken cancellationToken)
    {
        var remote = await paystack.FetchSubscriptionAsync(code, cancellationToken);
        if (remote is null || remote.EmailToken is null || remote.Status is "cancelled" or "complete" or "non-renewing")
        {
            return;
        }

        await paystack.DisableSubscriptionAsync(code, remote.EmailToken, cancellationToken);
    }

    [LoggerMessage(Level = LogLevel.Information, Message = "Erased billing data of user {UserId}: {Subscriptions} subscriptions stopped, {Invoices} invoices pseudonymised")]
    private static partial void LogErased(ILogger logger, Guid userId, int subscriptions, int invoices);
}
