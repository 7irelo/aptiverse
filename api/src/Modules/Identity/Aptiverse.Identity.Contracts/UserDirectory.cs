namespace Aptiverse.Identity.Contracts;

/// <summary>
/// Where to reach a user at the moment a message is sent, for events that carry only the user id. Notifications
/// is the intended caller; other modules should not copy contact details into their own tables.
/// </summary>
public interface IUserDirectory
{
    /// <summary>Null when the account does not exist or has been erased.</summary>
    Task<UserContact?> GetContactAsync(Guid userId, CancellationToken cancellationToken);
}

/// <param name="UserId">The account id.</param>
/// <param name="Email">The address as the user typed it. Personal information: never log it.</param>
/// <param name="Name">Display name as the user typed it. Treat as untrusted text when rendering.</param>
/// <param name="EmailVerified">Whether the user proved they own <paramref name="Email"/>.</param>
/// <param name="Roles">Role names, for example "student" or "parent".</param>
public sealed record UserContact(Guid UserId, string Email, string Name, bool EmailVerified, IReadOnlyList<string> Roles);
