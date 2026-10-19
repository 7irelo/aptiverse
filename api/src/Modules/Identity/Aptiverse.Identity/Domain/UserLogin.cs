using Aptiverse.SharedKernel.Domain;

namespace Aptiverse.Identity.Domain;

/// <summary>An external sign-in linked to an account, for example a Google subject id.</summary>
internal sealed class UserLogin : Entity
{
    public const string Google = "google";
    public const int ProviderMaxLength = 32;
    public const int ProviderKeyMaxLength = 256;

    private UserLogin()
    {
    }

    public Guid UserId { get; private set; }

    public string Provider { get; private set; } = string.Empty;

    public string ProviderKey { get; private set; } = string.Empty;

    public static UserLogin Create(Guid userId, string provider, string providerKey) =>
        new() { UserId = userId, Provider = provider, ProviderKey = providerKey };
}
