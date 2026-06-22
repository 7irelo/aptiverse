using Aptiverse.Api.Data;
using Aptiverse.Events.Domain.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using StackExchange.Redis;

namespace Aptiverse.Events.Application
{
    // Transactional-outbox dispatcher. Polls events.outbox_messages for
    // rows with ProcessedAt == null, publishes each to Redis pub/sub on
    // channel 'aptiverse.events' (the Python ai/ consumer subscribes
    // here), then stamps ProcessedAt so the row isn't re-sent.
    //
    // Reuses the singleton IConnectionMultiplexer registered once in
    // Aptiverse.Api.Data.InfrastructureRegistrations — no new Redis
    // registration. ApplicationDbContext is scoped, so each poll opens a
    // fresh scope via IServiceScopeFactory rather than capturing one for
    // the service's lifetime.
    //
    // Delivery is AT-LEAST-ONCE: a row is marked processed only after a
    // successful PublishAsync, so a crash between publish and save re-
    // publishes on restart. The ai/ consumer's handlers should therefore
    // be idempotent (they recompute analytics, which is naturally so).
    public sealed class OutboxDispatcher(
        IServiceScopeFactory scopeFactory,
        IConnectionMultiplexer redis,
        ILogger<OutboxDispatcher> logger) : BackgroundService
    {
        // Channel the ai/ consumer subscribes to (settings.outbox_channel).
        private const string Channel = "aptiverse.events";

        // Polling cadence + per-poll batch cap. Small enough to keep
        // dispatch latency low, bounded so one poll can't pull an
        // unbounded backlog into memory.
        private static readonly TimeSpan PollInterval = TimeSpan.FromSeconds(2);
        private const int BatchSize = 100;

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            logger.LogInformation(
                "OutboxDispatcher started — polling every {Seconds}s, publishing to Redis channel '{Channel}'.",
                PollInterval.TotalSeconds, Channel);

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await DispatchBatchAsync(stoppingToken);
                }
                catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
                {
                    break;
                }
                catch (Exception ex)
                {
                    // Never let a transient failure (DB blip, Redis drop)
                    // kill the loop — log and retry on the next tick.
                    logger.LogError(ex, "OutboxDispatcher poll failed; will retry.");
                }

                try
                {
                    await Task.Delay(PollInterval, stoppingToken);
                }
                catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
                {
                    break;
                }
            }

            logger.LogInformation("OutboxDispatcher stopping.");
        }

        private async Task DispatchBatchAsync(CancellationToken ct)
        {
            using var scope = scopeFactory.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            // Oldest-first so events publish in roughly the order they
            // occurred. Tracked (not AsNoTracking) so we can stamp
            // ProcessedAt and persist below.
            var batch = await db.Set<OutboxMessage>()
                .Where(m => m.ProcessedAt == null)
                .OrderBy(m => m.OccurredAt)
                .ThenBy(m => m.Id)
                .Take(BatchSize)
                .ToListAsync(ct);

            if (batch.Count == 0) return;

            var subscriber = redis.GetSubscriber();
            var processedNow = 0;

            foreach (var message in batch)
            {
                // Stop promptly on shutdown — unsent rows stay unprocessed
                // and go out on the next start (at-least-once).
                if (ct.IsCancellationRequested) break;

                try
                {
                    await subscriber.PublishAsync(
                        RedisChannel.Literal(Channel),
                        message.Payload);

                    message.ProcessedAt = DateTime.UtcNow;
                    processedNow++;
                }
                catch (Exception ex)
                {
                    // Leave ProcessedAt null so this row retries next poll.
                    logger.LogWarning(ex,
                        "Failed to publish outbox message {Id} (type={Type}); will retry next poll.",
                        message.Id, message.Type);
                }
            }

            if (processedNow > 0)
            {
                await db.SaveChangesAsync(ct);
                logger.LogDebug("OutboxDispatcher published {Count} event(s).", processedNow);
            }
        }
    }
}
