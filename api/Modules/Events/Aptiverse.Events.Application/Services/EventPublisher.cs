using System.Text.Json;
using Aptiverse.Api.Data;
using Aptiverse.Events.Domain.Models;

namespace Aptiverse.Events.Application.Services
{
    // Default IEventPublisher. Stages an OutboxMessage on the shared
    // (scoped) ApplicationDbContext so it commits inside the caller's
    // own transaction — see IEventPublisher for the contract. Scoped,
    // matching ApplicationDbContext's lifetime, so injecting it gets the
    // SAME context instance the caller is already mutating.
    public class EventPublisher(ApplicationDbContext db) : IEventPublisher
    {
        // camelCase to match the rest of the API surface and the JSON the
        // Python consumer expects (it reads evt["type"] / evt["userId"]).
        private static readonly JsonSerializerOptions SerializerOptions = new()
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        };

        public void Enqueue(string type, object payload, DateTime? occurredAt = null)
        {
            ArgumentException.ThrowIfNullOrWhiteSpace(type);
            ArgumentNullException.ThrowIfNull(payload);

            db.Set<OutboxMessage>().Add(new OutboxMessage
            {
                Type = type.Trim(),
                Payload = JsonSerializer.Serialize(payload, SerializerOptions),
                OccurredAt = occurredAt ?? DateTime.UtcNow,
                ProcessedAt = null,
            });

            // Intentionally NO SaveChangesAsync here — the caller commits.
        }
    }
}
