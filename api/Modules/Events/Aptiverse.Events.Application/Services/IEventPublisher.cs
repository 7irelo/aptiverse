namespace Aptiverse.Events.Application.Services
{
    // Tiny transactional-outbox publisher. Other modules inject this to
    // emit a domain event AS PART OF the same unit of work as their
    // originating change.
    //
    // CONTRACT: Enqueue only Add()s an OutboxMessage to the shared
    // ApplicationDbContext's change tracker — it does NOT call
    // SaveChangesAsync. The caller's own SaveChangesAsync (the one that
    // persists the originating change) commits the outbox row in the
    // SAME transaction. Either both the change and the event land, or
    // neither does. Example:
    //
    //     db.Set<Attempt>().Add(attempt);
    //     await publisher.EnqueueAsync(
    //         "practice.attempt.submitted",
    //         new { userId, attemptId = attempt.Id });
    //     await db.SaveChangesAsync(ct);   // commits attempt + outbox row atomically
    //
    // The OutboxDispatcher BackgroundService later publishes the row to
    // Redis pub/sub on 'aptiverse.events'. Payloads should include a
    // `userId` key — the ai/ consumer routes on `type` + `userId`.
    public interface IEventPublisher
    {
        // Serializes `payload` to JSON and stages an OutboxMessage of the
        // given `type` on the current DbContext. occurredAt defaults to
        // UtcNow when omitted.
        void Enqueue(string type, object payload, DateTime? occurredAt = null);
    }
}
