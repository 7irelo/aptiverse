using System.Diagnostics.Metrics;

namespace Aptiverse.Notifications;

/// <summary>Email counters. Tags are template keys, categories and provider error codes only, never ids or addresses.</summary>
internal static class NotificationsMetrics
{
    public const string MeterName = "Aptiverse.Notifications";

    private static readonly Meter Meter = new(MeterName);

    private static readonly Counter<long> EmailsSent =
        Meter.CreateCounter<long>("aptiverse.notifications.emails.sent", description: "Emails accepted by the provider");

    private static readonly Counter<long> EmailsFailed =
        Meter.CreateCounter<long>("aptiverse.notifications.emails.failed", description: "Provider calls that failed");

    private static readonly Counter<long> EmailsSkipped =
        Meter.CreateCounter<long>("aptiverse.notifications.emails.skipped", description: "Emails not sent (duplicate, no recipient, bad link)");

    private static readonly Histogram<double> SendDuration =
        Meter.CreateHistogram<double>("aptiverse.notifications.email.send.duration", unit: "ms", description: "Provider call duration");

    public static void Sent(string template, string category, double milliseconds)
    {
        EmailsSent.Add(1, new KeyValuePair<string, object?>("template", template), new KeyValuePair<string, object?>("category", category));
        SendDuration.Record(milliseconds, new KeyValuePair<string, object?>("template", template));
    }

    public static void Failed(string template, string errorCode, bool final) =>
        EmailsFailed.Add(
            1,
            new KeyValuePair<string, object?>("template", template),
            new KeyValuePair<string, object?>("error_code", errorCode),
            new KeyValuePair<string, object?>("final", final));

    public static void Skipped(string template, string reason) =>
        EmailsSkipped.Add(1, new KeyValuePair<string, object?>("template", template), new KeyValuePair<string, object?>("reason", reason));
}
