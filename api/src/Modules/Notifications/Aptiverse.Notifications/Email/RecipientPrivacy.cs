using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Options;

namespace Aptiverse.Notifications.Email;

/// <summary>
/// The only forms of a recipient address that may be stored or logged: a keyed hash for matching and a mask for
/// people troubleshooting a delivery.
/// </summary>
internal sealed class RecipientPrivacy(IOptions<EmailOptions> options)
{
    public const int HashLength = 64;
    public const int MaskMaxLength = 64;

    /// <summary>Lower-case hex HMAC-SHA256 of the trimmed, lower-cased address, keyed with the configured pepper.</summary>
    public string Hash(string address)
    {
        ArgumentNullException.ThrowIfNull(address);
        var key = Encoding.UTF8.GetBytes(options.Value.AddressHashPepper ?? string.Empty);
        var data = Encoding.UTF8.GetBytes(address.Trim().ToLowerInvariant());
        return Convert.ToHexStringLower(HMACSHA256.HashData(key, data));
    }

    /// <summary>"t***@g***.com": first letter of the mailbox and the domain, plus the top-level domain.</summary>
    public static string Mask(string address)
    {
        ArgumentNullException.ThrowIfNull(address);
        var trimmed = address.Trim();
        var at = trimmed.LastIndexOf('@');
        if (at <= 0 || at == trimmed.Length - 1)
        {
            return "***";
        }

        var domain = trimmed[(at + 1)..];
        var dot = domain.LastIndexOf('.');
        var tld = dot > 0 && dot < domain.Length - 1 ? domain[dot..] : string.Empty;
        var masked = $"{trimmed[0]}***@{domain[0]}***{tld}";
        return masked.Length > MaskMaxLength ? masked[..MaskMaxLength] : masked;
    }
}
