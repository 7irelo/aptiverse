using Aptiverse.Api.Data;
using Aptiverse.Api.Data.Email;
using Aptiverse.Domain.Models;
using Aptiverse.Notifications.Application.Services;
using Aptiverse.StudyGroups.Domain.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace Aptiverse.StudyGroups.Application.Reminders
{
    // Periodic worker that nudges group members before a scheduled session.
    //
    // Every PollInterval it scans StudyGroupSession rows whose start is within
    // ReminderWindow of now and haven't been reminded yet, marks each sent
    // first (so it can't double-fire), then enqueues an in-app Notification to
    // every member of the group via the Notifications module.
    //
    // Same safety model as Calendar's ReminderSchedulerService: singleton
    // BackgroundService, fresh scope per tick for the scoped DbContext +
    // INotificationService, per-iteration and per-session try/catch so one bad
    // row or transient blip never stalls the loop.
    public sealed class StudyGroupSessionReminderService(
        IServiceScopeFactory scopeFactory,
        ILogger<StudyGroupSessionReminderService> logger) : BackgroundService
    {
        private static readonly TimeSpan PollInterval = TimeSpan.FromMinutes(1);

        // Fire the reminder when a session is this close to starting.
        private const int ReminderWindowMinutes = 30;

        // Cap rows per tick so a backlog drains over several iterations.
        private const int BatchSize = 200;

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            logger.LogInformation(
                "StudyGroupSessionReminderService started — polling sessions every {Interval}, reminding {Window} min ahead.",
                PollInterval, ReminderWindowMinutes);

            using var timer = new PeriodicTimer(PollInterval);
            do
            {
                try
                {
                    await ProcessDueSessionsAsync(stoppingToken);
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
                    logger.LogError(ex, "StudyGroupSessionReminderService iteration failed; retrying next tick.");
                }
            }
            while (await SafeWaitForNextTickAsync(timer, stoppingToken));

            logger.LogInformation("StudyGroupSessionReminderService stopping.");
        }

        private static async Task<bool> SafeWaitForNextTickAsync(PeriodicTimer timer, CancellationToken ct)
        {
            try { return await timer.WaitForNextTickAsync(ct); }
            catch (OperationCanceledException) { return false; }
        }

        private async Task ProcessDueSessionsAsync(CancellationToken ct)
        {
            using var scope = scopeFactory.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var notifications = scope.ServiceProvider.GetRequiredService<INotificationService>();
            var emailQueue = scope.ServiceProvider.GetRequiredService<EmailQueue>();

            var now = DateTime.UtcNow;
            var windowEnd = now.AddMinutes(ReminderWindowMinutes);

            // Due = not yet reminded AND starting within the window (and not
            // already in the past, so a poller lag never fires a stale nudge).
            var due = await db.Set<StudyGroupSession>()
                .Where(s => !s.RemindersSent && s.StartsAt > now && s.StartsAt <= windowEnd)
                .OrderBy(s => s.StartsAt)
                .Take(BatchSize)
                .Select(s => new { s.Id, s.StudyGroupId, s.Title, s.StartsAt })
                .ToListAsync(ct);

            if (due.Count == 0) return;

            var fired = 0;
            foreach (var item in due)
            {
                if (ct.IsCancellationRequested) break;

                try
                {
                    // Mark sent first (guard the race with another tick) so a
                    // best-effort notify failure can't cause a re-fire.
                    var session = await db.Set<StudyGroupSession>()
                        .FirstOrDefaultAsync(s => s.Id == item.Id && !s.RemindersSent, ct);
                    if (session is null) continue;

                    session.RemindersSent = true;
                    session.RemindersSentAt = DateTime.UtcNow;
                    await db.SaveChangesAsync(ct);

                    var groupName = await db.Set<StudyGroup>().AsNoTracking()
                        .Where(g => g.Id == item.StudyGroupId)
                        .Select(g => g.Name)
                        .FirstOrDefaultAsync(ct) ?? "your study group";

                    // Members with their email + email-reminder preference, so
                    // in-app goes to everyone and email only to opted-in ones.
                    var members = await db.Set<StudyGroupMember>().AsNoTracking()
                        .Where(m => m.StudyGroupId == item.StudyGroupId)
                        .Join(db.Set<User>().AsNoTracking(), m => m.UserId, u => u.Id,
                            (m, u) => new { u.Id, u.Email, u.StudyGroupEmailReminders, u.EmailNotifications })
                        .ToListAsync(ct);

                    var mins = Math.Max(1, (int)Math.Round((item.StartsAt - DateTime.UtcNow).TotalMinutes));
                    var title = string.IsNullOrWhiteSpace(item.Title) ? "Study session" : item.Title;
                    var body = $"{groupName}: \"{title}\" starts in about {mins} minute(s).";

                    foreach (var member in members)
                    {
                        if (string.IsNullOrWhiteSpace(member.Id)) continue;

                        // In-app: always.
                        await notifications.EnqueueAsync(
                            userId: member.Id,
                            kind: "study_group",
                            title: "Study session soon",
                            body: body,
                            actionHref: "/dashboard/study-groups",
                            ct: ct);

                        // Email: only if the email channel is on, the member
                        // opted into this category, and they have an address.
                        if (member.EmailNotifications && member.StudyGroupEmailReminders
                            && !string.IsNullOrWhiteSpace(member.Email))
                        {
                            try
                            {
                                await emailQueue.Enqueue(new EmailJob(
                                    To: member.Email,
                                    Subject: "Study session soon",
                                    HtmlBody: null,
                                    TemplateType: "study_group_session",
                                    TemplateData: new Dictionary<string, string?>
                                    {
                                        ["GroupName"] = groupName,
                                        ["Title"] = title,
                                        ["Minutes"] = mins.ToString(),
                                        ["Url"] = "https://aptiverse.co.za/dashboard/study-groups",
                                    },
                                    EnqueuedAt: DateTime.UtcNow), ct);
                            }
                            catch (Exception ex)
                            {
                                logger.LogWarning(ex,
                                    "Failed to enqueue session reminder email for user {UserId}.", member.Id);
                            }
                        }
                    }

                    fired++;
                }
                catch (Exception ex)
                {
                    logger.LogWarning(ex, "Failed to process study-group session reminder {SessionId}.", item.Id);
                }
            }

            if (fired > 0)
                logger.LogInformation("StudyGroupSessionReminderService fired reminders for {Count} session(s).", fired);
        }
    }
}
