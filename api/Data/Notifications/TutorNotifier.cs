using Aptiverse.Api.Data.Email;
using Aptiverse.Domain.Models;
using Aptiverse.Marketplace.Domain.Models.Marketplace;
using Aptiverse.Notifications.Application.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Aptiverse.Api.Data.Notifications
{
    // Notifies a tutor about connection / review events. The in-app notification
    // is always created; the email is gated on the tutor's Settings preferences
    // (the toggles are worded "Email me when ..."). Best-effort throughout:
    // failures are logged, never thrown, so the caller's primary action (create
    // the connection or review) still succeeds even if notifying fails.
    public sealed class TutorNotifier(
        ApplicationDbContext db,
        EmailQueue emailQueue,
        INotificationService notifications,
        ILogger<TutorNotifier> logger)
    {
        private const string SiteBase = "https://aptiverse.co.za";

        public async Task NotifyConnectionAsync(
            string tutorUserId, string studentName, string subject, CancellationToken ct = default)
        {
            var about = string.IsNullOrWhiteSpace(subject) ? "tutoring" : subject;

            await notifications.EnqueueAsync(
                tutorUserId, "info",
                $"{studentName} connected with you",
                $"{studentName} reached out about {about}. Arrange the details with them directly.",
                "/tutor/connections", ct);

            await MaybeEmailAsync(
                tutorUserId,
                prefOn: t => t.NotifyOnConnection,
                subjectLine: "You have a new connection on Aptiverse",
                templateType: "tutor_connection",
                data: new Dictionary<string, string?>
                {
                    ["StudentName"] = studentName,
                    ["Subject"] = about,
                    ["Url"] = $"{SiteBase}/tutor/connections",
                },
                ct);
        }

        public async Task NotifyReviewAsync(
            string tutorUserId, string studentName, int rating, CancellationToken ct = default)
        {
            await notifications.EnqueueAsync(
                tutorUserId, "celebration",
                $"{studentName} left you a review",
                $"{studentName} rated you {rating}/5. Open your reviews to read it.",
                "/tutor/reviews", ct);

            await MaybeEmailAsync(
                tutorUserId,
                prefOn: t => t.NotifyOnReview,
                subjectLine: "You have a new review on Aptiverse",
                templateType: "tutor_review",
                data: new Dictionary<string, string?>
                {
                    ["StudentName"] = studentName,
                    ["Rating"] = rating.ToString(),
                    ["Url"] = $"{SiteBase}/tutor/reviews",
                },
                ct);
        }

        private async Task MaybeEmailAsync(
            string tutorUserId,
            Func<Tutor, bool> prefOn,
            string subjectLine,
            string templateType,
            IDictionary<string, string?> data,
            CancellationToken ct)
        {
            try
            {
                var tutor = await db.Set<Tutor>().AsNoTracking()
                    .FirstOrDefaultAsync(t => t.UserId == tutorUserId, ct);
                if (tutor is null || !prefOn(tutor)) return; // no profile, or pref off

                var user = await db.Set<User>().AsNoTracking()
                    .FirstOrDefaultAsync(u => u.Id == tutorUserId, ct);
                if (user is null || string.IsNullOrWhiteSpace(user.Email)) return;

                data["FirstName"] = user.FirstName;
                await emailQueue.Enqueue(new EmailJob(
                    To: user.Email!,
                    Subject: subjectLine,
                    HtmlBody: null,
                    TemplateType: templateType,
                    TemplateData: data,
                    EnqueuedAt: DateTime.UtcNow), ct);
            }
            catch (Exception ex)
            {
                logger.LogWarning(ex,
                    "Tutor email notification failed for {TutorUserId} ({Template}).",
                    tutorUserId, templateType);
            }
        }
    }
}
