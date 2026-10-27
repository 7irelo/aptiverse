using Aptiverse.Billing.Contracts;
using Aptiverse.Billing.Domain;
using Aptiverse.Billing.Features.Common;
using Aptiverse.Billing.Paystack;
using Aptiverse.Billing.Persistence;
using Aptiverse.Identity.Contracts;
using Aptiverse.SharedKernel.Authorization;
using Aptiverse.SharedKernel.Results;
using Aptiverse.SharedKernel.Time;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Npgsql;
using Wolverine;
using Wolverine.EntityFrameworkCore;

namespace Aptiverse.Billing.Features.StartCheckout;

/// <summary>
/// Starts a Paystack checkout for a plan. The amount comes from the active price row and the callback URL from config;
/// nothing about money or redirects is taken from the request. The email comes from Identity, never the body. An
/// under-18 payer needs recorded parental consent (decision 31); a verified email is not required (decision 25).
/// Paystack is called before anything is written, so a provider failure leaves no state behind.
/// </summary>
internal sealed partial class StartCheckoutHandler(
    IDbContextOutbox<BillingDbContext> outbox,
    IPaystackClient paystack,
    IUserDirectory users,
    IPayerEligibilityLookup payers,
    SubscriptionViews subscriptions,
    IClock clock,
    IOptions<BillingOptions> options,
    ILogger<StartCheckoutHandler> logger)
{
    private BillingDbContext Db => outbox.DbContext;

    public async Task<Result<CheckoutStartedResponse>> HandleAsync(
        Guid userId, IReadOnlyCollection<string> roles, StartCheckoutRequest request, string? idempotencyKey, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);
        ArgumentNullException.ThrowIfNull(roles);
        if (idempotencyKey is not null && !IdempotencyKeys.IsValid(idempotencyKey))
        {
            return BillingErrors.InvalidIdempotencyKey;
        }

        if (idempotencyKey is not null && await ReplayAsync(userId, idempotencyKey, cancellationToken) is { } replay)
        {
            return replay;
        }

        var plan = await Db.Plans.AsNoTracking()
            .SingleOrDefaultAsync(p => p.Code == request.PlanCode && p.IsActive && p.IsPublic && p.Kind == PlanKinds.Paid, cancellationToken);
        if (plan is null || !AudienceFits(plan.Audience, roles))
        {
            return BillingErrors.PlanNotFound;
        }

        var price = await Db.PlanPrices.AsNoTracking()
            .SingleOrDefaultAsync(p => p.PlanId == plan.Id && p.Interval == request.Interval && p.IsActive, cancellationToken);
        if (price is null)
        {
            return BillingErrors.PlanNotFound;
        }

        if (price.PaystackPlanCode is null)
        {
            return BillingErrors.PlanNotSynced;
        }

        var payer = await payers.GetAsync(userId, cancellationToken);
        if (payer is not { MayPay: true })
        {
            return BillingErrors.PayerMustBeAdult;
        }

        if (await subscriptions.CurrentAsync(userId, tracking: false, cancellationToken) is { } current && current.Audience == plan.Audience)
        {
            return BillingErrors.AlreadySubscribed;
        }

        var now = clock.UtcNow;
        var reuseSince = now - TimeSpan.FromMinutes(options.Value.CheckoutReuseMinutes);
        var open = await Db.CheckoutSessions.AsNoTracking()
            .Where(c => c.UserId == userId && c.PlanPriceId == price.Id && c.Status == CheckoutStatuses.Open && c.CreatedAt >= reuseSince && c.ExpiresAt > now)
            .OrderByDescending(c => c.CreatedAt)
            .FirstOrDefaultAsync(cancellationToken);
        if (open?.AuthorizationUrl is { } openUrl)
        {
            return new CheckoutStartedResponse(open.Id, open.Reference, openUrl, open.ExpiresAt);
        }

        var contact = await users.GetContactAsync(userId, cancellationToken);
        if (contact is null || string.IsNullOrWhiteSpace(contact.Email))
        {
            return BillingErrors.ContactMissing;
        }

        if (options.Value.CallbackUrl is not { } callback)
        {
            return BillingErrors.CheckoutUnavailable;
        }

        var reference = CheckoutSession.NewReference();
        InitializedTransaction initialized;
        try
        {
            initialized = await paystack.InitializeTransactionAsync(
                new InitializeTransaction(
                    contact.Email,
                    price.AmountCents,
                    price.Currency,
                    reference,
                    callback.AbsoluteUri,
                    price.PaystackPlanCode,
                    new Dictionary<string, string> { ["checkout_reference"] = reference }),
                cancellationToken);
        }
        catch (PaystackUnavailableException ex)
        {
            BillingMetrics.PaystackError("transaction_initialize");
            LogProviderFailed(logger, ex);
            return BillingErrors.CheckoutUnavailable;
        }
        catch (PaystackRejectedException ex)
        {
            BillingMetrics.PaystackError("transaction_initialize");
            LogProviderFailed(logger, ex);
            return BillingErrors.ProviderError;
        }

        var (subscription, transition) = Subscription.Start(userId, plan, price, userId.ToString(), now);
        var expiresAt = now.AddHours(options.Value.CheckoutExpiryHours);
        var session = CheckoutSession.Open(userId, price, subscription.Id, reference, initialized.AccessCode, initialized.AuthorizationUrl, expiresAt, idempotencyKey);
        Db.Subscriptions.Add(subscription);
        Db.SubscriptionTransitions.Add(transition);
        Db.CheckoutSessions.Add(session);
        await outbox.PublishAsync(new SubscriptionStatusChanged(
            subscription.Id, userId, plan.Code, null, subscription.Status, SubscriptionStateMachine.CheckoutStarted, now));
        await outbox.ScheduleAsync(new ExpireCheckoutSession(session.Id), expiresAt - now);

        try
        {
            await outbox.SaveChangesAndFlushMessagesAsync(cancellationToken);
        }
        catch (DbUpdateException ex) when (idempotencyKey is not null && ex.InnerException is PostgresException { SqlState: PostgresErrorCodes.UniqueViolation })
        {
            // The same key from a parallel request won; answer with its session.
            Db.ChangeTracker.Clear();
            if (await ReplayAsync(userId, idempotencyKey, cancellationToken) is { } raced)
            {
                return raced;
            }

            throw;
        }

        BillingMetrics.CheckoutStarted(plan.Code, price.Interval);
        LogStarted(logger, userId, session.Id, reference, plan.Code, price.Interval, price.AmountCents);
        return new CheckoutStartedResponse(session.Id, session.Reference, initialized.AuthorizationUrl, session.ExpiresAt);
    }

    /// <summary>Students buy student plans and parents buy parent plans; admins buy nothing.</summary>
    private static bool AudienceFits(string audience, IReadOnlyCollection<string> roles) => audience switch
    {
        Audiences.Student => roles.Contains(Roles.Student),
        Audiences.Parent => roles.Contains(Roles.Parent),
        _ => false,
    };

    private async Task<CheckoutStartedResponse?> ReplayAsync(Guid userId, string idempotencyKey, CancellationToken cancellationToken)
    {
        var session = await Db.CheckoutSessions.AsNoTracking()
            .SingleOrDefaultAsync(c => c.UserId == userId && c.IdempotencyKey == idempotencyKey, cancellationToken);
        return session?.AuthorizationUrl is { } url ? new CheckoutStartedResponse(session.Id, session.Reference, url, session.ExpiresAt) : null;
    }

    [LoggerMessage(
        Level = LogLevel.Information,
        Message = "User {UserId} started checkout {CheckoutSessionId} ({Reference}) for {PlanCode} {Interval} at {AmountCents} cents")]
    private static partial void LogStarted(ILogger logger, Guid userId, Guid checkoutSessionId, string reference, string planCode, string interval, long amountCents);

    [LoggerMessage(Level = LogLevel.Warning, Message = "Paystack could not initialize a checkout")]
    private static partial void LogProviderFailed(ILogger logger, Exception exception);
}
