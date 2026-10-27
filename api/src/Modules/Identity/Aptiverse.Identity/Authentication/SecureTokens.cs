using System.Buffers.Text;
using System.Security.Cryptography;
using System.Text;

namespace Aptiverse.Identity.Authentication;

/// <summary>Opaque 256-bit tokens. Only <see cref="Hash"/> is ever persisted.</summary>
internal static class SecureTokens
{
    /// <summary>Length of a token: 32 random bytes in unpadded base64url.</summary>
    public const int Length = 43;

    public static string Create() => Base64Url.EncodeToString(RandomNumberGenerator.GetBytes(32));

    public static string Hash(string token)
    {
        ArgumentNullException.ThrowIfNull(token);
        return Convert.ToHexStringLower(SHA256.HashData(Encoding.UTF8.GetBytes(token)));
    }

    /// <summary>
    /// Rows are found by an index lookup on the hash, whose timing reveals nothing about the token itself; this
    /// fixed-time recheck makes sure the stored hash really equals the presented one before it is trusted.
    /// </summary>
    public static bool HashEquals(string storedHash, string computedHash)
    {
        ArgumentNullException.ThrowIfNull(storedHash);
        ArgumentNullException.ThrowIfNull(computedHash);
        return CryptographicOperations.FixedTimeEquals(Encoding.ASCII.GetBytes(storedHash), Encoding.ASCII.GetBytes(computedHash));
    }

    /// <summary>True for a string that could be a token this API issued (43 base64url characters).</summary>
    public static bool IsWellFormed(string? token) =>
        token is { Length: Length } && token.All(c => char.IsAsciiLetterOrDigit(c) || c is '-' or '_');
}
