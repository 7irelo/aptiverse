using Aptiverse.Api.Data;
using Aptiverse.Notifications.Domain.Models;
using Microsoft.Extensions.Logging;

namespace Aptiverse.Notifications.Application.Services
{
    public class NotificationService(
        ApplicationDbContext db,
        ILogger<NotificationService> logger) : INotificationService
    {
        public async Task EnqueueAsync(
            string userId,
            string kind,
            string title,
            string body,
            string? actionHref = null,
            CancellationToken ct = default)
        {
            if (string.IsNullOrWhiteSpace(userId))
            {
                logger.LogWarning("Notification enqueue skipped — empty userId.");
                return;
            }
            if (string.IsNullOrWhiteSpace(title) || string.IsNullOrWhiteSpace(body))
            {
                logger.LogWarning("Notification enqueue skipped — empty title or body for {UserId}.", userId);
                return;
            }

            try
            {
                db.Set<Notification>().Add(new Notification
                {
                    UserId = userId,
                    Kind = string.IsNullOrWhiteSpace(kind) ? "info" : kind,
                    Title = title.Trim(),
                    Body = body.Trim(),
                    Time = DateTime.UtcNow,
                    Read = false,
                    ActionHref = string.IsNullOrWhiteSpace(actionHref) ? null : actionHref,
                });
                await db.SaveChangesAsync(ct);
            }
            catch (Exception ex)
            {
                // Don't propagate — best-effort by design. The caller's
                // primary action (goal completed, draft submitted, etc.)
                // should not fail because the notification write failed.
                logger.LogWarning(ex,
                    "Notification enqueue failed for user {UserId} (kind={Kind}, title={Title}).",
                    userId, kind, title);
            }
        }
    }
}
