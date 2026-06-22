using Aptiverse.Api.Data;
using Aptiverse.Calendar.Domain.Models.Calendar;
using Aptiverse.Calendar.Domain.Models.External.Identity;
using Aptiverse.Notifications.Application.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace Aptiverse.Calendar.Application.Reminders.Scheduling
{
    // In-monolith periodic worker for Calendar reminders.
    //
    // Every PollInterval it scans Calendar.Reminder rows that are due
    // (the parent CalendarEvent's StartTime is within MinutesBefore of
    // "now") and not yet sent, creates a user-scoped Notification via
    // the Notifications module, then marks the reminder IsSent + SentAt.
    //
    // This is deliberately the *only* kind of scheduling that lives on
    // the .NET side: lightweight, DB-driven, "fire a notification when a
    // calendar item is about to start". Heavy ML scheduling (retraining,
    // recommendation refresh, cohort recompute) lives in the Python ai/
    // repo and is out of scope here.
    //
    // Safety model:
    //   * BackgroundService is a singleton; scoped services (DbContext,
    //     INotificationService) are resolved from a fresh scope per
    //     iteration so we never capture a disposed/cross-iteration scope.
    //   * Each iteration is wrapped in try/catch so a transient DB blip
    //     logs and the loop survives to the next tick.
    //   * Each reminder is processed independently so one bad row (e.g.
    //     an event whose student we can't resolve) doesn't stall the rest.
    //   * IsSent is flipped to true before/with the notification write so
    //     a reminder is never double-fired on the next poll. Notification
    //     creation is itself best-effort (INotificationService swallows +
    //     logs), so a flaky notify won't resurrect the reminder.
    public sealed class ReminderSchedulerService(
        IServiceScopeFactory scopeFactory,
        ILogger<ReminderSchedulerService> logger) : BackgroundService
    {
        // Poll cadence. A minute is plenty for minute-granularity
        // MinutesBefore reminders and keeps DB load trivial.
        private static readonly TimeSpan PollInterval = TimeSpan.FromMinutes(1);

        // Cap rows processed per tick so a large backlog (e.g. after
        // downtime) drains over several iterations rather than holding a
        // single transaction/scope open for a long time.
        private const int BatchSize = 200;

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            logger.LogInformation(
                "ReminderSchedulerService started — polling Calendar reminders every {Interval}.",
                PollInterval);

            using var timer = new PeriodicTimer(PollInterval);

            // Run once immediately, then on each tick.
            do
            {
                try
                {
                    await ProcessDueRemindersAsync(stoppingToken);
                }
                catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
                {
                    // Normal shutdown — stop quietly.
                    break;
                }
                catch (Exception ex)
                {
                    // Never let an iteration failure kill the loop.
                    logger.LogError(ex,
                        "ReminderSchedulerService iteration failed; will retry next tick.");
                }
            }
            while (await SafeWaitForNextTickAsync(timer, stoppingToken));

            logger.LogInformation("ReminderSchedulerService stopping.");
        }

        private static async Task<bool> SafeWaitForNextTickAsync(
            PeriodicTimer timer, CancellationToken ct)
        {
            try
            {
                return await timer.WaitForNextTickAsync(ct);
            }
            catch (OperationCanceledException)
            {
                return false;
            }
        }

        private async Task ProcessDueRemindersAsync(CancellationToken ct)
        {
            // Fresh scope per iteration — DbContext/INotificationService are scoped.
            using var scope = scopeFactory.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var notifications = scope.ServiceProvider.GetRequiredService<INotificationService>();

            var now = DateTime.UtcNow;

            // Due = not yet sent AND the event start is within MinutesBefore
            // of now (StartTime <= now + MinutesBefore). We join through the
            // CalendarEvent navigation and pull the student's UserId so the
            // notification is correctly user-scoped.
            var due = await db.Set<Reminder>()
                .Where(r => !r.IsSent)
                .Select(r => new DueReminder
                {
                    ReminderId = r.Id,
                    StartTime = r.CalendarEvent.StartTime,
                    MinutesBefore = r.MinutesBefore,
                    EventTitle = r.CalendarEvent.Title,
                    StudentId = r.CalendarEvent.StudentId,
                })
                .Where(x => x.StartTime <= now.AddMinutes(x.MinutesBefore))
                .OrderBy(x => x.StartTime)
                .Take(BatchSize)
                .ToListAsync(ct);

            if (due.Count == 0) return;

            // Resolve student -> user ids in one round-trip.
            var studentIds = due.Select(d => d.StudentId).Distinct().ToList();
            var userIdByStudent = await db.Set<Student>()
                .Where(s => studentIds.Contains(s.Id))
                .ToDictionaryAsync(s => s.Id, s => s.UserId, ct);

            var fired = 0;
            foreach (var item in due)
            {
                if (ct.IsCancellationRequested) break;

                try
                {
                    if (!userIdByStudent.TryGetValue(item.StudentId, out var userId) ||
                        string.IsNullOrWhiteSpace(userId))
                    {
                        logger.LogWarning(
                            "Skipping reminder {ReminderId} — could not resolve a UserId for student {StudentId}.",
                            item.ReminderId, item.StudentId);
                        continue;
                    }

                    // Mark sent first so a notify failure can't cause a
                    // re-fire on the next poll (notify is best-effort).
                    var reminder = await db.Set<Reminder>()
                        .FirstOrDefaultAsync(r => r.Id == item.ReminderId && !r.IsSent, ct);
                    if (reminder is null) continue; // raced with another tick / already sent

                    reminder.IsSent = true;
                    reminder.SentAt = DateTime.UtcNow;
                    await db.SaveChangesAsync(ct);

                    var title = string.IsNullOrWhiteSpace(item.EventTitle)
                        ? "Upcoming event"
                        : item.EventTitle;
                    var body = item.MinutesBefore > 0
                        ? $"\"{title}\" starts in about {item.MinutesBefore} minute(s)."
                        : $"\"{title}\" is starting now.";

                    await notifications.EnqueueAsync(
                        userId: userId,
                        kind: "reminder",
                        title: title,
                        body: body,
                        actionHref: "/dashboard/calendar",
                        ct: ct);

                    fired++;
                }
                catch (Exception ex)
                {
                    // Per-reminder isolation — one bad row doesn't stop the batch.
                    logger.LogWarning(ex,
                        "Failed to process due reminder {ReminderId}.", item.ReminderId);
                }
            }

            if (fired > 0)
            {
                logger.LogInformation(
                    "ReminderSchedulerService fired {Count} reminder notification(s).", fired);
            }
        }

        // Flat projection so the due-scan stays a single SQL query.
        private sealed class DueReminder
        {
            public long ReminderId { get; init; }
            public DateTime StartTime { get; init; }
            public int MinutesBefore { get; init; }
            public string? EventTitle { get; init; }
            public long StudentId { get; init; }
        }
    }
}
