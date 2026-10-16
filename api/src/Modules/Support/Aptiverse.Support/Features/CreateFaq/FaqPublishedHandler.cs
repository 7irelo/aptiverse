using System.Diagnostics.Metrics;
using Aptiverse.Support.Contracts;
using Microsoft.Extensions.Logging;

namespace Aptiverse.Support.Features.CreateFaq;

/// <summary>
/// Handles the outbox-delivered <see cref="FaqPublished"/> event asynchronously, after the FAQ row committed.
/// Today it records a metric; later the Notifications module subscribes to the same event.
/// Public only because Wolverine generates handler code against it (an allowed exception in the architecture tests).
/// </summary>
public static class FaqPublishedHandler
{
    public const string MeterName = "Aptiverse.Support";

    private static readonly Meter Meter = new(MeterName);
    private static readonly Counter<long> FaqsPublished =
        Meter.CreateCounter<long>("aptiverse.support.faqs_published", description: "FAQs published");

    public static void Handle(FaqPublished message, ILogger logger)
    {
        ArgumentNullException.ThrowIfNull(message);

        FaqsPublished.Add(1, new KeyValuePair<string, object?>("category", message.Category));
        logger.LogInformation("FAQ {FaqId} published in category {Category}", message.FaqId, message.Category);
    }
}
