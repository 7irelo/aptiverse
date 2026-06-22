using System.Text.Json.Serialization;
using Aptiverse.Api.Data;
using Aptiverse.Events.Domain.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Events.Controllers
{
    // Read-only ops view over the transactional outbox. The outbox is
    // written by other modules via IEventPublisher and drained by the
    // OutboxDispatcher background service — this controller only surfaces
    // state for operators (pending backlog, recent dispatches) so a
    // dashboard can confirm the ai/ event pipeline is flowing.
    //
    // Admin-gated: outbox payloads can contain cross-user identifiers.
    [ApiController]
    [Route("api/events")]
    [Authorize(Roles = "Admin")]
    public class EventsController(ApplicationDbContext db) : ControllerBase
    {
        private readonly ApplicationDbContext _db = db;

        // Backlog + throughput snapshot for the ops dashboard.
        [HttpGet("outbox/stats")]
        public async Task<ActionResult<OutboxStatsDto>> GetStats(CancellationToken ct)
        {
            var pending = await _db.Set<OutboxMessage>()
                .CountAsync(m => m.ProcessedAt == null, ct);

            var processed = await _db.Set<OutboxMessage>()
                .CountAsync(m => m.ProcessedAt != null, ct);

            var oldestPending = await _db.Set<OutboxMessage>()
                .Where(m => m.ProcessedAt == null)
                .OrderBy(m => m.OccurredAt)
                .Select(m => (DateTime?)m.OccurredAt)
                .FirstOrDefaultAsync(ct);

            return Ok(new OutboxStatsDto
            {
                Pending = pending,
                Processed = processed,
                OldestPendingOccurredAt = oldestPending,
            });
        }

        // Recent outbox rows, newest first. Capped — this is a glance
        // tool, not a paginated audit log.
        [HttpGet("outbox")]
        public async Task<ActionResult<IEnumerable<FrontendOutboxMessageDto>>> GetRecent(
            [FromQuery] bool pendingOnly,
            CancellationToken ct)
        {
            var query = _db.Set<OutboxMessage>().AsNoTracking();
            if (pendingOnly)
            {
                query = query.Where(m => m.ProcessedAt == null);
            }

            var rows = await query
                .OrderByDescending(m => m.Id)
                .Take(100)
                .Select(m => new FrontendOutboxMessageDto
                {
                    Id = m.Id.ToString(),
                    Type = m.Type,
                    Payload = m.Payload,
                    OccurredAt = m.OccurredAt,
                    ProcessedAt = m.ProcessedAt,
                })
                .ToListAsync(ct);

            return Ok(rows);
        }
    }

    public record OutboxStatsDto
    {
        [JsonPropertyName("pending")] public int Pending { get; init; }
        [JsonPropertyName("processed")] public int Processed { get; init; }
        [JsonPropertyName("oldestPendingOccurredAt")] public DateTime? OldestPendingOccurredAt { get; init; }
    }

    public record FrontendOutboxMessageDto
    {
        [JsonPropertyName("id")] public string Id { get; init; } = "";
        [JsonPropertyName("type")] public string Type { get; init; } = "";
        [JsonPropertyName("payload")] public string Payload { get; init; } = "";
        [JsonPropertyName("occurredAt")] public DateTime OccurredAt { get; init; }
        [JsonPropertyName("processedAt")] public DateTime? ProcessedAt { get; init; }
    }
}
