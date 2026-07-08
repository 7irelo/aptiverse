using Aptiverse.AcademicPlanning.Domain.Models.AcademicPlanning;
using Aptiverse.Api.Data;
using Aptiverse.Api.Data.Email;
using Aptiverse.Domain.Models;
using Aptiverse.Notifications.Application.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace Aptiverse.AcademicPlanning.Application.Reminders
{
    // Periodic worker that nudges a student a few days before an assessment is
    // due. Gated on the student's AssessmentDueReminders preference, so only
    // opted-in students are ever queried. In-app always; email additionally
    // requires the AssessmentDueEmailReminders opt-in and the EmailNotifications
    // channel master.
    //
    // Same safety model as the Calendar / study-group schedulers: singleton
    // BackgroundService, fresh scope per tick, per-iteration and per-row
    // try/catch, and each assessment marked reminded first so it fires once.
    public sealed class AssessmentDueReminderService(
        IServiceScopeFactory scopeFactory,
        ILogger<AssessmentDueReminderService> logger) : BackgroundService
    {
        // A 3-day-ahead reminder doesn't need minute granularity; hourly keeps
        // DB load trivial and still fires within an hour of entering the window.
        private static readonly TimeSpan PollInterval = TimeSpan.FromHours(1);

        // How far ahead of the due date the reminder fires.
        private const int LeadDays = 3;

        private const int BatchSize = 200;

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            logger.LogInformation(
                "AssessmentDueReminderService started — polling every {Interval}, reminding {Lead} day(s) ahead.",
                PollInterval, LeadDays);

            using var timer = new PeriodicTimer(PollInterval);
            do
            {
                try
                {
                    await ProcessDueAssessmentsAsync(stoppingToken);
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
                    logger.LogError(ex, "AssessmentDueReminderService iteration failed; retrying next tick.");
                }
            }
            while (await SafeWaitForNextTickAsync(timer, stoppingToken));

            logger.LogInformation("AssessmentDueReminderService stopping.");
        }

        private static async Task<bool> SafeWaitForNextTickAsync(PeriodicTimer timer, CancellationToken ct)
        {
            try { return await timer.WaitForNextTickAsync(ct); }
            catch (OperationCanceledException) { return false; }
        }

        private async Task ProcessDueAssessmentsAsync(CancellationToken ct)
        {
            using var scope = scopeFactory.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var notifications = scope.ServiceProvider.GetRequiredService<INotificationService>();
            var emailQueue = scope.ServiceProvider.GetRequiredService<EmailQueue>();

            var now = DateTime.UtcNow;
            var windowEnd = now.AddDays(LeadDays);

            // Not-yet-reminded, still-open assessments due within the lead
            // window, owned by a student who opted into due reminders. Joining
            // the pref means opted-out students are never returned (and a
            // student who enables it later still catches their pending ones).
            var due = await db.Set<Assessment>().AsNoTracking()
                .Where(a => !a.DueReminderSent
                    && a.Status != "graded" && a.Status != "submitted"
                    && a.DueDate >= now && a.DueDate <= windowEnd)
                .Join(db.Set<User>().AsNoTracking(), a => a.StudentId, u => u.Id,
                    (a, u) => new
                    {
                        a.Id,
                        a.StudentId,
                        a.Title,
                        a.DueDate,
                        u.AssessmentDueReminders,
                        u.AssessmentDueEmailReminders,
                        u.EmailNotifications,
                        u.Email,
                    })
                .Where(x => x.AssessmentDueReminders)
                .OrderBy(x => x.DueDate)
                .Take(BatchSize)
                .ToListAsync(ct);

            if (due.Count == 0) return;

            var fired = 0;
            foreach (var item in due)
            {
                if (ct.IsCancellationRequested) break;

                try
                {
                    // Mark reminded first (guard the race) so a best-effort
                    // notify failure can't cause a re-fire next tick.
                    var assessment = await db.Set<Assessment>()
                        .FirstOrDefaultAsync(a => a.Id == item.Id && !a.DueReminderSent, ct);
                    if (assessment is null) continue;

                    assessment.DueReminderSent = true;
                    assessment.DueReminderSentAt = DateTime.UtcNow;
                    await db.SaveChangesAsync(ct);

                    if (string.IsNullOrWhiteSpace(item.StudentId)) continue;

                    var title = string.IsNullOrWhiteSpace(item.Title) ? "An assessment" : item.Title;
                    var dueLabel = DueLabel(item.DueDate, now);
                    var body = $"\"{title}\" is {dueLabel}.";

                    // In-app: always (the category toggle already gated us here).
                    await notifications.EnqueueAsync(
                        userId: item.StudentId,
                        kind: "assessment",
                        title: "Assessment due soon",
                        body: body,
                        actionHref: $"/dashboard/assessments/{item.Id}",
                        ct: ct);

                    // Email: only if the email channel master is on, the
                    // student opted into assessment email specifically, and
                    // they have an address. (The in-app category opt-in is
                    // implicit — opted-out students never reach this loop.)
                    if (item.EmailNotifications && item.AssessmentDueEmailReminders
                        && !string.IsNullOrWhiteSpace(item.Email))
                    {
                        try
                        {
                            await emailQueue.Enqueue(new EmailJob(
                                To: item.Email,
                                Subject: "Assessment due soon",
                                HtmlBody: null,
                                TemplateType: "assessment_due",
                                TemplateData: new Dictionary<string, string?>
                                {
                                    ["Title"] = title,
                                    ["Due"] = dueLabel,
                                    ["Url"] = $"https://aptiverse.co.za/dashboard/assessments/{item.Id}",
                                },
                                EnqueuedAt: DateTime.UtcNow), ct);
                        }
                        catch (Exception ex)
                        {
                            logger.LogWarning(ex,
                                "Failed to enqueue assessment due reminder email for user {UserId}.", item.StudentId);
                        }
                    }

                    fired++;
                }
                catch (Exception ex)
                {
                    logger.LogWarning(ex, "Failed to process assessment due reminder {AssessmentId}.", item.Id);
                }
            }

            if (fired > 0)
                logger.LogInformation("AssessmentDueReminderService fired {Count} reminder(s).", fired);
        }

        private static string DueLabel(DateTime dueUtc, DateTime nowUtc)
        {
            var days = (dueUtc.Date - nowUtc.Date).Days;
            return days switch
            {
                <= 0 => "due today",
                1 => "due tomorrow",
                _ => $"due in {days} days",
            };
        }
    }
}
