using System.Text.Json;
using Aptiverse.Billing.Contracts;
using Aptiverse.Billing.Domain;
using Aptiverse.Billing.Paystack;
using Aptiverse.Billing.Persistence;
using Aptiverse.SharedKernel.Time;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using Wolverine;
using Wolverine.EntityFrameworkCore;

namespace Aptiverse.Billing.Inbox;

/// <param name="EventId">The inbox row, new or existing.</param>
/// <param name="Duplicate">True when the dedupe key was already stored; nothing was written.</param>
internal sealed record StoredEvent(Guid EventId, bool Duplicate);

/// <summary>
/// Stores a Paystack event once per dedupe key and queues its processing through the outbox in the same transaction,
/// so a stored event is never lost and a duplicate changes nothing.
/// </summary>
internal sealed class InboxWriter(IDbContextOutbox<BillingDbContext> outbox, IClock clock)
{
    private BillingDbContext Db => outbox.DbContext;

    public async Task<StoredEvent> StoreAsync(string eventType, JsonElement data, string payload, string bodySha256, string source, TimeSpan processAfter, CancellationToken cancellationToken)
    {
        var dedupeKey = PaystackWebhooks.DedupeKey(eventType, data);
        if (await ExistingAsync(dedupeKey, cancellationToken) is { } existing)
        {
            return new StoredEvent(existing, true);
        }

        var row = PaystackEvent.Receive(dedupeKey, eventType, PaystackWebhooks.ObjectRef(eventType, data), payload, bodySha256, source, clock.UtcNow);
        Db.PaystackEvents.Add(row);
        if (processAfter > TimeSpan.Zero)
        {
            await outbox.ScheduleAsync(new ProcessPaystackEvent(row.Id), processAfter);
        }
        else
        {
            await outbox.PublishAsync(new ProcessPaystackEvent(row.Id));
        }

        try
        {
            await outbox.SaveChangesAndFlushMessagesAsync(cancellationToken);
            return new StoredEvent(row.Id, false);
        }
        catch (DbUpdateException ex) when (ex.InnerException is PostgresException { SqlState: PostgresErrorCodes.UniqueViolation })
        {
            // A parallel delivery of the same event won the insert.
            Db.ChangeTracker.Clear();
            return new StoredEvent(await ExistingAsync(dedupeKey, cancellationToken) ?? throw new InvalidOperationException("The duplicate inbox row vanished."), true);
        }
    }

    private Task<Guid?> ExistingAsync(string dedupeKey, CancellationToken cancellationToken) =>
        Db.PaystackEvents.AsNoTracking().Where(e => e.DedupeKey == dedupeKey).Select(e => (Guid?)e.Id).SingleOrDefaultAsync(cancellationToken);
}
