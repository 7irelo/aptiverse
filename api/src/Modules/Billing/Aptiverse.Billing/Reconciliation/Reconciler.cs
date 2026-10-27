using System.Globalization;
using Aptiverse.Billing.Contracts;
using Aptiverse.Billing.Domain;
using Aptiverse.Billing.Paystack;
using Aptiverse.Billing.Persistence;
using Aptiverse.Billing.Persistence.Configurations;
using Aptiverse.SharedKernel.Time;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Npgsql;
using Wolverine;
using Wolverine.EntityFrameworkCore;

namespace Aptiverse.Billing.Reconciliation;

/// <param name="RunId">The run.</param>
/// <param name="CheckedCount">Paystack transactions compared.</param>
/// <param name="DriftCount">Mismatches raised.</param>
internal sealed record ReconciliationSummary(Guid RunId, int CheckedCount, int DriftCount);

/// <summary>
/// Compares Paystack's successful transactions in the window with the local payments, and flags inbox rows that were
/// never processed. It only writes drift rows; a person resolves them. A scheduled run is unique per day, and only the
/// run that wins that row schedules the next night, so extra bootstrap messages converge to one chain.
/// </summary>
internal sealed partial class Reconciler(
    IDbContextOutbox<BillingDbContext> outbox,
    IPaystackClient paystack,
    IClock clock,
    IOptions<BillingOptions> options,
    ILogger<Reconciler> logger)
{
    private static readonly TimeZoneInfo Johannesburg = TimeZoneInfo.FindSystemTimeZoneById("Africa/Johannesburg");
    private static readonly TimeSpan RunAt = TimeSpan.FromHours(2);
    private static readonly TimeSpan UnprocessedAfter = TimeSpan.FromMinutes(10);

    private BillingDbContext Db => outbox.DbContext;

    /// <summary>The next 02:00 in Africa/Johannesburg after <paramref name="now"/>, as the run's date and UTC instant.</summary>
    public static (DateOnly Date, DateTimeOffset At) NextRun(DateTimeOffset now)
    {
        var local = TimeZoneInfo.ConvertTime(now, Johannesburg);
        var date = DateOnly.FromDateTime(local.DateTime);
        if (local.TimeOfDay >= RunAt)
        {
            date = date.AddDays(1);
        }

        var at = date.ToDateTime(TimeOnly.FromTimeSpan(RunAt));
        return (date, new DateTimeOffset(at, Johannesburg.GetUtcOffset(at)).ToUniversalTime());
    }

    public async Task RunScheduledAsync(RunPaystackReconciliation message, CancellationToken cancellationToken)
    {
        var now = clock.UtcNow;
        var run = ReconciliationRun.Start(now - TimeSpan.FromDays(options.Value.ReconciliationWindowDays), now, RunTriggers.Scheduled, message.ScheduledFor);
        Db.ReconciliationRuns.Add(run);
        var (nextDate, nextAt) = NextRun(now);
        await outbox.ScheduleAsync(new RunPaystackReconciliation(nextDate), nextAt - now);
        try
        {
            await outbox.SaveChangesAndFlushMessagesAsync(cancellationToken);
        }
        catch (DbUpdateException ex) when (ex.InnerException is PostgresException { SqlState: PostgresErrorCodes.UniqueViolation, ConstraintName: ReconciliationRunConfiguration.ScheduledIndex })
        {
            // Another node or a duplicate bootstrap already ran tonight's reconciliation, and scheduled the next one.
            return;
        }

        await CompareAsync(run, cancellationToken);
    }

    public async Task<ReconciliationSummary> RunNowAsync(CancellationToken cancellationToken)
    {
        var now = clock.UtcNow;
        var run = ReconciliationRun.Start(now - TimeSpan.FromDays(options.Value.ReconciliationWindowDays), now, RunTriggers.Admin, null);
        Db.ReconciliationRuns.Add(run);
        await Db.SaveChangesAsync(cancellationToken);
        return await CompareAsync(run, cancellationToken);
    }

    private async Task<ReconciliationSummary> CompareAsync(ReconciliationRun run, CancellationToken cancellationToken)
    {
        IReadOnlyList<PaystackTransaction> remote;
        try
        {
            remote = await paystack.ListTransactionsAsync(run.WindowFrom, run.WindowTo, cancellationToken);
        }
        catch (Exception ex) when (ex is PaystackUnavailableException or PaystackRejectedException)
        {
            BillingMetrics.PaystackError("transaction_list");
            run.Fail(clock.UtcNow);
            await Db.SaveChangesAsync(cancellationToken);
            LogFailed(logger, run.Id, ex);
            throw;
        }

        var successful = remote.Where(t => t.Status == "success").ToList();
        var references = successful.Select(t => t.Reference).ToList();
        var local = await Db.Payments.AsNoTracking()
            .Where(p => references.Contains(p.PaystackReference) || (p.PaidAt >= run.WindowFrom && p.PaidAt <= run.WindowTo))
            .ToListAsync(cancellationToken);
        var byReference = local.ToDictionary(p => p.PaystackReference, StringComparer.Ordinal);

        var drifts = new List<ReconciliationDrift>();
        foreach (var transaction in successful)
        {
            if (!byReference.TryGetValue(transaction.Reference, out var payment))
            {
                drifts.Add(ReconciliationDrift.Raise(run.Id, DriftKinds.MissingLocalPayment, transaction.Reference, null, Money(transaction.Amount, transaction.Currency), null));
            }
            else if (payment.AmountCents != transaction.Amount || payment.Currency != transaction.Currency)
            {
                drifts.Add(ReconciliationDrift.Raise(run.Id, DriftKinds.AmountMismatch, transaction.Reference, payment.Id, Money(transaction.Amount, transaction.Currency), Money(payment.AmountCents, payment.Currency)));
            }
            else if (payment.Status != PaymentStatuses.Succeeded)
            {
                drifts.Add(ReconciliationDrift.Raise(run.Id, DriftKinds.StatusMismatch, transaction.Reference, payment.Id, PaymentStatuses.Succeeded, payment.Status));
            }
        }

        var remoteReferences = successful.Select(t => t.Reference).ToHashSet(StringComparer.Ordinal);
        drifts.AddRange(local
            .Where(p => p.PaidAt >= run.WindowFrom && p.PaidAt <= run.WindowTo && !remoteReferences.Contains(p.PaystackReference))
            .Select(p => ReconciliationDrift.Raise(run.Id, DriftKinds.MissingRemotePayment, p.PaystackReference, p.Id, null, Money(p.AmountCents, p.Currency))));

        var stale = clock.UtcNow - UnprocessedAfter;
        var unprocessed = await Db.PaystackEvents.AsNoTracking()
            .Where(e => (e.Status == InboxStatuses.Pending || e.Status == InboxStatuses.Processing || e.Status == InboxStatuses.Failed) && e.ReceivedAt < stale)
            .Select(e => new { e.Id, e.ObjectRef, e.Status })
            .ToListAsync(cancellationToken);
        drifts.AddRange(unprocessed.Select(e => ReconciliationDrift.Raise(run.Id, DriftKinds.UnprocessedEvent, e.ObjectRef, e.Id, InboxStatuses.Processed, e.Status)));

        Db.ReconciliationDrifts.AddRange(drifts);
        run.Finish(successful.Count, drifts.Count, clock.UtcNow);
        await Db.SaveChangesAsync(cancellationToken);
        foreach (var drift in drifts)
        {
            BillingMetrics.DriftRaised(drift.Kind);
        }

        LogFinished(logger, run.Id, successful.Count, drifts.Count);
        return new ReconciliationSummary(run.Id, successful.Count, drifts.Count);
    }

    private static string Money(long cents, string currency) => string.Create(CultureInfo.InvariantCulture, $"{cents} {currency}");

    [LoggerMessage(Level = LogLevel.Information, Message = "Reconciliation run {RunId} compared {Checked} transactions and raised {Drifts} drifts")]
    private static partial void LogFinished(ILogger logger, Guid runId, int @checked, int drifts);

    [LoggerMessage(Level = LogLevel.Error, Message = "Reconciliation run {RunId} could not list Paystack transactions")]
    private static partial void LogFailed(ILogger logger, Guid runId, Exception exception);
}

/// <summary>
/// Schedules the next nightly reconciliation when the process starts. Duplicates from several nodes or restarts are
/// harmless: the unique run per day lets one through and only that one schedules the following night.
/// </summary>
internal sealed partial class ReconciliationBootstrap(IServiceScopeFactory scopes, IClock clock, IOptions<BillingOptions> options, ILogger<ReconciliationBootstrap> logger) : IHostedService
{
    public async Task StartAsync(CancellationToken cancellationToken)
    {
        if (!options.Value.ScheduleReconciliation || SharedKernel.Hosting.PlatformHostingExtensions.IsBuildTimeDocumentGeneration)
        {
            return;
        }

        var now = clock.UtcNow;
        var (date, at) = Reconciler.NextRun(now);
        await using var scope = scopes.CreateAsyncScope();
        await scope.ServiceProvider.GetRequiredService<IMessageBus>().ScheduleAsync(new RunPaystackReconciliation(date), at - now);
        LogScheduled(logger, at);
    }

    public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;

    [LoggerMessage(Level = LogLevel.Information, Message = "Next Paystack reconciliation scheduled for {At}")]
    private static partial void LogScheduled(ILogger logger, DateTimeOffset at);
}
