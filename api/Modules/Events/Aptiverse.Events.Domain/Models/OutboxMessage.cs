using Aptiverse.Api.Data.Abstractions;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Events.Domain.Models
{
    // Transactional outbox row. The right-sized replacement for the
    // missing event-architecture service: instead of a domain change
    // dual-writing to Postgres AND a broker (and risking one half
    // committing without the other), the originating change and an
    // OutboxMessage row are written in the SAME DbContext transaction.
    // A BackgroundService (OutboxDispatcher) then polls unprocessed
    // rows and republishes them to Redis pub/sub on 'aptiverse.events',
    // where the Python ai/ consumer picks them up. At-least-once
    // delivery: a row is only marked processed AFTER a successful
    // publish, so a crash mid-dispatch re-publishes rather than loses.
    //
    // Auto-discovered by ApplicationDbContext via the
    // `Aptiverse.*.Domain.Models` namespace convention -> lands in the
    // 'events' Postgres schema as events.outbox_messages.
    [Index(nameof(ProcessedAt), nameof(OccurredAt))]
    public class OutboxMessage : IEntityTimestamps
    {
        public long Id { get; set; }

        // Routing key the ai/ consumer switches on, e.g.
        // "practice.attempt.submitted" / "diary.entry.created".
        // Free text (not an enum) so a new producer can introduce an
        // event type without a migration — mirrors Notification.Kind.
        public required string Type { get; set; }

        // Serialized event body. JSON object string; the dispatcher
        // publishes it verbatim. Stored as `text` (Postgres maps C#
        // string -> text by default), which is functionally equivalent
        // to jsonb for our pass-through use and avoids a custom column
        // type/migration nuance. The consumer json.loads() it and reads
        // `type` + `userId`, so producers should include those keys.
        public required string Payload { get; set; }

        // Domain time the underlying event happened (set by the
        // producer), not the row-insert time. Lets ordering + "lag"
        // reporting be honest even if dispatch is batched.
        public DateTime OccurredAt { get; set; } = DateTime.UtcNow;

        // Null until the dispatcher has successfully published the row
        // to Redis. The polling query filters on `ProcessedAt == null`.
        public DateTime? ProcessedAt { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
