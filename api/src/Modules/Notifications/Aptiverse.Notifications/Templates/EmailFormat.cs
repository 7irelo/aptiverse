using System.Globalization;

namespace Aptiverse.Notifications.Templates;

/// <summary>How values read in an email. Times are South African Standard Time, which has no daylight saving.</summary>
internal static class EmailFormat
{
    private static readonly TimeSpan Sast = TimeSpan.FromHours(2);

    /// <summary>For example "29 October 2026 at 14:05 SAST".</summary>
    public static string When(DateTimeOffset value) =>
        value.ToOffset(Sast).ToString("d MMMM yyyy 'at' HH:mm 'SAST'", CultureInfo.InvariantCulture);

    public static string Flag(bool value) => value ? "true" : "false";

    public static string Number(int value) => value.ToString(CultureInfo.InvariantCulture);
}
