using Aptiverse.SharedKernel.Domain;

namespace Aptiverse.Identity.Domain;

internal sealed class UserRole : Entity
{
    public const int RoleMaxLength = 32;

    private UserRole()
    {
    }

    public Guid UserId { get; private set; }

    public string Role { get; private set; } = string.Empty;

    public static UserRole Create(Guid userId, string role) => new() { UserId = userId, Role = role };
}
