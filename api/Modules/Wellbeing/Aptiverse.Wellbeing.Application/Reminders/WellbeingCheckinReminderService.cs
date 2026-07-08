using Aptiverse.Api.Data;
using Aptiverse.Domain.Models;
using Aptiverse.Notifications.Application.Services;
using Aptiverse.Wellbeing.Domain.Models.Wellbeing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace Aptiverse.Wellbeing.Application.Reminders
{
    // Daily-habit nudge: once each evening, remind a student to do their mood
    // check-in if they haven't logged one today. Unlike the session/assessment
    // reminders (which hang off a specific future timestamp), this fires on a
    // per-day cadence, so it needs a "last reminded" marker rather than a
    // per-row sent flag.
    //
    // Gated on the WellbeingCheckinReminders preference, so only opted-in
    // students are ever queried. In-app only. Times are anchored to SAST
    // (UTC+2, no DST) — the whole audience is South African.
    //
    // Same safety model as the other schedulers: singleton BackgroundService,
    // fresh scope per tick, per-iteration and per-student try/catch.
    public sealed class WellbeingCheckinReminderService(
        IServiceScopeFactory scopeFactory,
        ILogger<WellbeingCheckinReminderService> logger) : BackgroundService
    {
        // South African Standard Time is a fixed UTC+2 (no daylight saving).
        private static readonly TimeSpan SastOffset = TimeSpan.FromHours(2);

        // Only nudge once the local evening has arrived — early enough to still
        // act on it, late enough that most who'll check in already have.
        private const int ReminderHourSast = 18;

        // Check often enough that the nudge lands soon after the hour without
        // hammering the DB. Idempotent within a day via LastWellbeingReminderAt.
        private static readonly TimeSpan PollInterval = TimeSpan.FromMinutes(15);

        private const int BatchSize = 500;

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            logger.LogInformation(
                "WellbeingCheckinReminderService started — polling every {Interval}, nudging after {Hour}:00 SAST.",
                PollInterval, ReminderHourSast);

            using var timer = new PeriodicTimer(PollInterval);
            do
            {
                try
                {
                    await ProcessAsync(stoppingToken);
                }
                catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
                {
                    break;
                }
                catch (Exception) when (stoppingToken.IsCancellationRequested)
                {
                    // A DB call cancelled mid-flight during shutdown surfaces as
                    // a wrapped, non-OCE exception. Exit quietly rather than
                    // logging it as an iteration failure.
                    break;
                }
                catch (Exception ex)
                {
                    logger.LogError(ex, "WellbeingCheckinReminderService iteration failed; retrying next tick.");
                }
            }
            while (await SafeWaitForNextTickAsync(timer, stoppingToken));

            logger.LogInformation("WellbeingCheckinReminderService stopping.");
        }

        private static async Task<bool> SafeWaitForNextTickAsync(PeriodicTimer timer, CancellationToken ct)
        {
            try { return await timer.WaitForNextTickAsync(ct); }
            catch (OperationCanceledException) { return false; }
        }

        private async Task ProcessAsync(CancellationToken ct)
        {
            var nowUtc = DateTime.UtcNow;
            var nowSast = nowUtc + SastOffset;

            // Hold off until the evening send window in local time.
            if (nowSast.Hour < ReminderHourSast) return;

            using var scope = scopeFactory.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var notifications = scope.ServiceProvider.GetRequiredService<INotificationService>();

            // Bounds of "today" in SAST, expressed in UTC for the stored
            // (timestamptz) columns. Anything at/after dayStartUtc counts as
            // today: a check-in logged today, or a reminder already sent today.
            var dayStartUtc = nowSast.Date - SastOffset;
            var dayEndUtc = dayStartUtc.AddDays(1);

            // Opted-in students not yet reminded today AND with no check-in
            // logged today. The check-in existence test runs in SQL so we never
            // pull students who've already done it.
            var targets = await db.Set<User>()
                .Where(u => u.WellbeingCheckinReminders
                    && (u.LastWellbeingReminderAt == null || u.LastWellbeingReminderAt < dayStartUtc)
                    && !db.Set<MoodTracking>().Any(m =>
                        m.StudentId == u.Id && m.TrackedAt >= dayStartUtc && m.TrackedAt < dayEndUtc))
                .OrderBy(u => u.Id)
                .Take(BatchSize)
                .Select(u => new { u.Id })
                .ToListAsync(ct);

            if (targets.Count == 0) return;

            var fired = 0;
            foreach (var target in targets)
            {
                if (ct.IsCancellationRequested) break;

                try
                {
                    // Mark reminded first (guard the race) so a best-effort
                    // notify failure can't cause a re-fire this same day. Re-read
                    // the row tracked and re-check the guard in case another tick
                    // already handled this student.
                    var user = await db.Set<User>()
                        .FirstOrDefaultAsync(u => u.Id == target.Id
                            && (u.LastWellbeingReminderAt == null || u.LastWellbeingReminderAt < dayStartUtc), ct);
                    if (user is null) continue;

                    user.LastWellbeingReminderAt = DateTime.UtcNow;
                    await db.SaveChangesAsync(ct);

                    await notifications.EnqueueAsync(
                        userId: user.Id,
                        kind: "wellbeing",
                        title: "How are you doing today?",
                        body: "You haven't logged your wellbeing check-in yet. It only takes a minute.",
                        actionHref: "/dashboard/wellbeing",
                        ct: ct);

                    fired++;
                }
                catch (Exception ex)
                {
                    logger.LogWarning(ex, "Failed to send wellbeing check-in reminder to {UserId}.", target.Id);
                }
            }

            if (fired > 0)
                logger.LogInformation("WellbeingCheckinReminderService nudged {Count} student(s).", fired);
        }
    }
}
