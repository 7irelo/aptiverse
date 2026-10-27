using System.Net;
using System.Net.Sockets;

namespace Aptiverse.Identity.Features.ListMySessions;

/// <summary>
/// What a session list may show about a device: browser and OS family from the user agent (no third-party user agent
/// database) and an IP address with its host part zeroed.
/// </summary>
internal static class SessionDisplay
{
    public static string DeviceLabel(string? userAgent)
    {
        if (string.IsNullOrWhiteSpace(userAgent))
        {
            return "Unknown device";
        }

        return $"{Browser(userAgent)} on {OperatingSystem(userAgent)}";
    }

    /// <summary>IPv4 keeps the first three octets; IPv6 keeps the first 48 bits (the routing prefix).</summary>
    public static string? MaskIp(string? ipAddress)
    {
        if (!IPAddress.TryParse(ipAddress, out var address))
        {
            return null;
        }

        if (address.IsIPv4MappedToIPv6)
        {
            address = address.MapToIPv4();
        }

        var bytes = address.GetAddressBytes();
        var keep = address.AddressFamily == AddressFamily.InterNetwork ? 3 : 6;
        Array.Clear(bytes, keep, bytes.Length - keep);
        return new IPAddress(bytes).ToString();
    }

    private static string Browser(string ua) =>
        Has(ua, "Edg/") ? "Edge"
        : Has(ua, "OPR/") || Has(ua, "Opera") ? "Opera"
        : Has(ua, "SamsungBrowser") ? "Samsung Internet"
        : Has(ua, "Firefox/") || Has(ua, "FxiOS") ? "Firefox"
        : Has(ua, "Chrome/") || Has(ua, "CriOS") ? "Chrome"
        : Has(ua, "Safari/") ? "Safari"
        : "Unknown browser";

    private static string OperatingSystem(string ua) =>
        Has(ua, "Android") ? "Android"
        : Has(ua, "iPhone") || Has(ua, "iPad") || Has(ua, "iPod") ? "iOS"
        : Has(ua, "Windows") ? "Windows"
        : Has(ua, "Mac OS X") || Has(ua, "Macintosh") ? "macOS"
        : Has(ua, "CrOS") ? "ChromeOS"
        : Has(ua, "Linux") ? "Linux"
        : "unknown OS";

    private static bool Has(string ua, string token) => ua.Contains(token, StringComparison.OrdinalIgnoreCase);
}
