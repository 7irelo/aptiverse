using Aptiverse.Billing.Contracts;
using Aptiverse.Billing.Erasure;
using Aptiverse.Billing.Inbox;
using Aptiverse.Billing.Paystack;
using Aptiverse.Billing.Reconciliation;
using Aptiverse.Billing.Subscriptions;
using Aptiverse.Billing.Usage;
using Aptiverse.Identity.Contracts;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Wolverine.ErrorHandling;
using Wolverine.Runtime.Handlers;

namespace Aptiverse.Billing.Messaging;

// Wolverine handlers of the Billing module. They are public only because Wolverine generates code against them;
// each resolves the internal service that does the work from a fresh scope, because Wolverine cannot inject internal
// types into a public handler. Every one is safe to run more than once for the same message.

/// <summary>Processes one stored Paystack event.</summary>
public static class ProcessPaystackInboxHandler
{
    /// <summary>Paystack may be briefly down during verify; concurrent processing of the same row loses on xmin and retries.</summary>
    public static void Configure(HandlerChain chain)
    {
        ArgumentNullException.ThrowIfNull(chain);
        chain.OnException<PaystackUnavailableException>()
            .ScheduleRetry(TimeSpan.FromMinutes(1), TimeSpan.FromMinutes(5), TimeSpan.FromMinutes(30), TimeSpan.FromHours(2));
        chain.OnException<DbUpdateConcurrencyException>().RetryWithCooldown(TimeSpan.FromMilliseconds(200), TimeSpan.FromSeconds(1), TimeSpan.FromSeconds(5));
    }

    public static async Task HandleAsync(ProcessPaystackEvent message, IServiceScopeFactory scopes, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(message);
        ArgumentNullException.ThrowIfNull(scopes);
        await using var scope = scopes.CreateAsyncScope();
        await scope.ServiceProvider.GetRequiredService<InboxProcessor>().ProcessAsync(message.EventId, cancellationToken);
    }
}

/// <summary>Releases a usage reservation nobody resolved in time.</summary>
public static class ExpireUsageReservationHandler
{
    public static async Task HandleAsync(ExpireUsageReservation message, IServiceScopeFactory scopes, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(message);
        ArgumentNullException.ThrowIfNull(scopes);
        await using var scope = scopes.CreateAsyncScope();
        await scope.ServiceProvider.GetRequiredService<UsageMeterService>().ExpireAsync(message.ReservationId, cancellationToken);
    }
}

/// <summary>Abandons an unpaid checkout at its expiry.</summary>
public static class ExpireCheckoutSessionHandler
{
    public static async Task HandleAsync(ExpireCheckoutSession message, IServiceScopeFactory scopes, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(message);
        ArgumentNullException.ThrowIfNull(scopes);
        await using var scope = scopes.CreateAsyncScope();
        await scope.ServiceProvider.GetRequiredService<SubscriptionTimers>().ExpireCheckoutAsync(message, cancellationToken);
    }
}

/// <summary>Ends a cancelling subscription at its period end.</summary>
public static class EndSubscriptionPeriodHandler
{
    public static async Task HandleAsync(EndSubscriptionPeriod message, IServiceScopeFactory scopes, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(message);
        ArgumentNullException.ThrowIfNull(scopes);
        await using var scope = scopes.CreateAsyncScope();
        await scope.ServiceProvider.GetRequiredService<SubscriptionTimers>().EndPeriodAsync(message, cancellationToken);
    }
}

/// <summary>Ends a past due subscription when the grace period ran out.</summary>
public static class CheckPastDueSubscriptionHandler
{
    public static async Task HandleAsync(CheckPastDueSubscription message, IServiceScopeFactory scopes, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(message);
        ArgumentNullException.ThrowIfNull(scopes);
        await using var scope = scopes.CreateAsyncScope();
        await scope.ServiceProvider.GetRequiredService<SubscriptionTimers>().CheckPastDueAsync(message, cancellationToken);
    }
}

/// <summary>The nightly Paystack reconciliation.</summary>
public static class RunPaystackReconciliationHandler
{
    public static void Configure(HandlerChain chain)
    {
        ArgumentNullException.ThrowIfNull(chain);
        chain.OnException<PaystackUnavailableException>().ScheduleRetry(TimeSpan.FromMinutes(10), TimeSpan.FromMinutes(30), TimeSpan.FromHours(2));
    }

    public static async Task HandleAsync(RunPaystackReconciliation message, IServiceScopeFactory scopes, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(message);
        ArgumentNullException.ThrowIfNull(scopes);
        await using var scope = scopes.CreateAsyncScope();
        await scope.ServiceProvider.GetRequiredService<Reconciler>().RunScheduledAsync(message, cancellationToken);
    }
}

/// <summary>Stops billing and pseudonymises invoice snapshots when a user asks for erasure (POPIA).</summary>
public static class BillingAccountDeletionRequestedHandler
{
    public static void Configure(HandlerChain chain)
    {
        ArgumentNullException.ThrowIfNull(chain);
        chain.OnException<PaystackUnavailableException>()
            .Or<PaystackRejectedException>()
            .ScheduleRetry(TimeSpan.FromMinutes(1), TimeSpan.FromMinutes(5), TimeSpan.FromMinutes(30), TimeSpan.FromHours(2));
    }

    public static async Task HandleAsync(AccountDeletionRequested message, IServiceScopeFactory scopes, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(message);
        ArgumentNullException.ThrowIfNull(scopes);
        await using var scope = scopes.CreateAsyncScope();
        await scope.ServiceProvider.GetRequiredService<BillingUserDataEraser>().EraseAsync(message.UserId, cancellationToken);
    }
}
