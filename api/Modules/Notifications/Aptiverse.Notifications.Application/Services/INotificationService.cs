namespace Aptiverse.Notifications.Application.Services
{
    // Thin in-app notification producer. Other modules call this when
    // a notification-worthy event happens (user registered, goal hit
    // 100%, draft submitted, etc.); we add the row and save it.
    //
    // Best-effort by design — implementation swallows + logs failures
    // so a flaky notification write never breaks the original action
    // (no one wants their goal-completion to fail because the
    // notifications schema was down).
    //
    // Notification creation has no transactional coupling to the
    // caller's SaveChanges — each Enqueue is its own write. That's
    // fine: a goal-update that succeeds + a notification that fails
    // leaves the user with a goal at 100% and no "well done" toast.
    // The reverse (notification persists, goal update fails) doesn't
    // happen because the caller's update runs first.
    public interface INotificationService
    {
        Task EnqueueAsync(
            string userId,
            string kind,
            string title,
            string body,
            string? actionHref = null,
            CancellationToken ct = default);

        // Remove every notification of one kind for one user. For prompts that
        // stop being true once the user acts on them: the "confirm your email"
        // nag goes away the moment the address is confirmed. A prompt that
        // outlives the thing it is prompting for is worse than no prompt.
        // Best-effort like Enqueue: returns the number removed, never throws.
        Task<int> ClearKindAsync(string userId, string kind, CancellationToken ct = default);
    }
}
