using Aptiverse.Api.Data;
using Aptiverse.Notifications.Domain.Models;
using Microsoft.EntityFrameworkCore;
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
                logger.LogWarning("Notification enqueue skipped: empty userId.");
                return;
            }
            if (string.IsNullOrWhiteSpace(title) || string.IsNullOrWhiteSpace(body))
            {
                logger.LogWarning("Notification enqueue skipped: empty title or body for {UserId}.", userId);
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

        public async Task<int> ClearKindAsync(
            string userId, string kind, CancellationToken ct = default)
        {
            if (string.IsNullOrWhiteSpace(userId) || string.IsNullOrWhiteSpace(kind)) return 0;

            try
            {
                var rows = await db.Set<Notification>()
                    .Where(n => n.UserId == userId && n.Kind == kind)
                    .ToListAsync(ct);
                if (rows.Count == 0) return 0;

                db.Set<Notification>().RemoveRange(rows);
                await db.SaveChangesAsync(ct);
                return rows.Count;
            }
            catch (Exception ex)
            {
                // Same posture as Enqueue. Failing to clear a prompt must
                // never fail the action that made the prompt obsolete.
                logger.LogWarning(ex,
                    "Notification clear failed for user {UserId} (kind={Kind}).", userId, kind);
                return 0;
            }
        }
    }
}
