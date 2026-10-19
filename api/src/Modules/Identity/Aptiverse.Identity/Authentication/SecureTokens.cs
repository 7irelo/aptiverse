using System.Buffers.Text;
using System.Security.Cryptography;
using System.Text;

namespace Aptiverse.Identity.Authentication;

/// <summary>Opaque 256-bit tokens. Only <see cref="Hash"/> is ever persisted.</summary>
internal static class SecureTokens
{
    public static string Create() => Base64Url.EncodeToString(RandomNumberGenerator.GetBytes(32));

    public static string Hash(string token)
    {
        ArgumentNullException.ThrowIfNull(token);
        return Convert.ToHexStringLower(SHA256.HashData(Encoding.UTF8.GetBytes(token)));
    }
}
