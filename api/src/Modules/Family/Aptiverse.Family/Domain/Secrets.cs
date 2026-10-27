using System.Security.Cryptography;
using System.Text;

namespace Aptiverse.Family.Domain;

/// <summary>Emailed invite tokens: 32 random bytes, base64url. Only the SHA-256 hex is stored.</summary>
internal static class InviteTokens
{
    public const int HashLength = 64;
    public const int MinLength = 43;
    public const int MaxLength = 64;

    public static string NewToken() => Base64Url(RandomNumberGenerator.GetBytes(32));

    public static string Hash(string token)
    {
        ArgumentNullException.ThrowIfNull(token);
        return Convert.ToHexStringLower(SHA256.HashData(Encoding.UTF8.GetBytes(token)));
    }

    public static bool IsWellFormed(string? token) =>
        token is { Length: >= MinLength and <= MaxLength } && token.All(c => char.IsAsciiLetterOrDigit(c) || c is '-' or '_');

    private static string Base64Url(byte[] bytes) =>
        Convert.ToBase64String(bytes).TrimEnd('=').Replace('+', '-').Replace('/', '_');
}

/// <summary>
/// Link codes a student reads out or types: 12 Crockford base32 characters (60 bits), shown as XXXX-XXXX-XXXX. The
/// first <see cref="SelectorLength"/> characters select candidate rows; the SHA-256 of the whole code is compared in
/// constant time, so lookup timing never depends on how much of a guess was right. Short-lived, single use, and
/// guarded by per-code and per-parent failure limits, which together make guessing hopeless.
/// </summary>
internal static class LinkCodes
{
    public const int Length = 12;
    public const int SelectorLength = 4;
    public const int HashLength = 64;

    /// <summary>The longest input accepted: the code with its two dashes and some stray spaces.</summary>
    public const int MaxInputLength = 20;

    // Crockford base32: no I, L, O or U, so a code survives being read aloud or handwritten.
    private const string Alphabet = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

    public static string NewCode() => new(RandomNumberGenerator.GetItems<char>(Alphabet, Length));

    /// <summary>"ABCD-EFGH-JKMN".</summary>
    public static string Display(string code)
    {
        ArgumentNullException.ThrowIfNull(code);
        return $"{code[..4]}-{code[4..8]}-{code[8..]}";
    }

    /// <summary>
    /// Upper-cases, drops dashes and spaces and folds the look-alikes Crockford allows (O to 0, I and L to 1). Null
    /// when the result is not a well formed code.
    /// </summary>
    public static string? Normalize(string? input)
    {
        if (input is null || input.Length > MaxInputLength)
        {
            return null;
        }

        var builder = new StringBuilder(Length);
        foreach (var raw in input)
        {
            if (raw is '-' or ' ')
            {
                continue;
            }

            var c = char.ToUpperInvariant(raw) switch
            {
                'O' => '0',
                'I' or 'L' => '1',
                var other => other,
            };
            if (!Alphabet.Contains(c, StringComparison.Ordinal))
            {
                return null;
            }

            builder.Append(c);
        }

        return builder.Length == Length ? builder.ToString() : null;
    }

    public static string SelectorOf(string normalizedCode)
    {
        ArgumentNullException.ThrowIfNull(normalizedCode);
        return normalizedCode[..SelectorLength];
    }

    public static string Hash(string normalizedCode)
    {
        ArgumentNullException.ThrowIfNull(normalizedCode);
        return Convert.ToHexStringLower(SHA256.HashData(Encoding.UTF8.GetBytes(normalizedCode)));
    }

    /// <summary>Constant-time comparison of two hex hashes of equal length.</summary>
    public static bool HashesEqual(string a, string b)
    {
        ArgumentNullException.ThrowIfNull(a);
        ArgumentNullException.ThrowIfNull(b);
        return CryptographicOperations.FixedTimeEquals(Encoding.ASCII.GetBytes(a), Encoding.ASCII.GetBytes(b));
    }
}
