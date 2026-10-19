namespace Aptiverse.Notifications.Contracts;

/// <summary>
/// Command any module can publish (through its outbox) to put an in-app notification in a user's feed.
/// <paramref name="Link"/> is an app-relative path such as "/settings/security".
/// </summary>
public sealed record NotifyUser(Guid UserId, string Category, string Title, string Body, string? Link);
