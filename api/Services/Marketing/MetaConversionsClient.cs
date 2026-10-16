using System.Globalization;
using System.Net.Http.Json;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json.Serialization;

namespace Aptiverse.Api.Services.Marketing
{
    // Server-side conversion reporting to Meta's Conversions API.
    //
    // Why this exists rather than a browser pixel event on the thank-you page.
    // The purchase is the single most valuable number in the funnel: it is what
    // an advert budget is steered by, and every rand of ad spend is allocated
    // against it. Reporting it from the browser means reporting it from the
    // least reliable moment there is. The buyer is returning from a redirect on
    // Paystack's domain, on a mid-range Android phone, on metered mobile data.
    // An ad blocker removes the pixel outright, iOS may have closed the tab,
    // and a person who has just paid has no reason to wait for a script to
    // finish. Every one of those is a purchase that happened and was never
    // counted, and undercounted purchases do not merely make the report look
    // sad, they teach Meta's delivery model to find worse people.
    //
    // The API, by contrast, already knows the truth. Paystack verify and the
    // signed webhook are the two places where money is genuinely confirmed to
    // have moved, and both of them run here.
    //
    // Consent still governs it completely. The browser records whether the
    // buyer accepted, that flag rides through Paystack transaction metadata,
    // and SendPurchaseAsync refuses to send anything when it is not set. A
    // server is not a loophole around a rejected banner.
    //
    // Configuration (env or appsettings, never hardcoded):
    //   META_PIXEL_ID           the same id the browser pixel uses
    //   META_CAPI_ACCESS_TOKEN  a system-user token from Events Manager
    //   META_TEST_EVENT_CODE    optional, routes to the Test Events tab
    // Unset means IsConfigured is false and every call is a no-op, so a
    // developer without Meta credentials gets a working billing flow.
    public interface IMetaConversionsClient
    {
        bool IsConfigured { get; }

        Task SendPurchaseAsync(MetaPurchaseEvent evt, CancellationToken ct = default);
    }

    // One confirmed purchase, in the shape Meta needs and no wider.
    public record MetaPurchaseEvent
    {
        // The buyer accepted advertising measurement in the browser. False, or
        // absent, means nothing is sent. This is checked again inside the
        // client so no future caller can forget.
        public required bool MarketingConsent { get; init; }

        // Shared with whatever the browser may have sent for the same
        // conversion, and identical across the verify path and the webhook
        // path, so Meta collapses the duplicates into one purchase instead of
        // reporting two or three.
        public required string EventId { get; init; }

        public required decimal Value { get; init; }
        public string Currency { get; init; } = "ZAR";

        // Hashed before it is sent. Meta requires SHA-256 of the normalised
        // value, and sending a raw address would be both a policy breach and a
        // needless disclosure.
        public string? Email { get; init; }

        // Meta's own browser and click identifiers, captured at checkout. These
        // are what make the conversion attributable to a specific ad click.
        public string? Fbp { get; init; }
        public string? Fbc { get; init; }

        // Present on the verify path, where the buyer's own request is in
        // flight, and absent on the webhook path, where there is no browser.
        // Meta accepts the event either way; fbp and fbc do the heavy lifting.
        public string? ClientIpAddress { get; init; }
        public string? ClientUserAgent { get; init; }

        // Where the purchase happened, for Meta's reporting.
        public string? EventSourceUrl { get; init; }

        // Plan code and campaign fields, carried through as custom properties
        // so a conversion can be read against a campaign inside Events Manager.
        public string? PlanCode { get; init; }
        public string? UtmSource { get; init; }
        public string? UtmMedium { get; init; }
        public string? UtmCampaign { get; init; }
        public string? UtmContent { get; init; }
    }

    public class MetaConversionsClient : IMetaConversionsClient
    {
        private const string GraphVersion = "v21.0";

        private readonly HttpClient _http;
        private readonly ILogger<MetaConversionsClient> _logger;
        private readonly string? _pixelId;
        private readonly string? _accessToken;
        private readonly string? _testEventCode;

        public MetaConversionsClient(
            HttpClient http,
            IConfiguration config,
            ILogger<MetaConversionsClient> logger)
        {
            _http = http;
            _logger = logger;
            _pixelId = config["Meta:PixelId"] ?? Environment.GetEnvironmentVariable("META_PIXEL_ID");
            _accessToken = config["Meta:ConversionsAccessToken"]
                ?? Environment.GetEnvironmentVariable("META_CAPI_ACCESS_TOKEN");
            _testEventCode = config["Meta:TestEventCode"]
                ?? Environment.GetEnvironmentVariable("META_TEST_EVENT_CODE");
        }

        public bool IsConfigured =>
            !string.IsNullOrWhiteSpace(_pixelId) && !string.IsNullOrWhiteSpace(_accessToken);

        public async Task SendPurchaseAsync(MetaPurchaseEvent evt, CancellationToken ct = default)
        {
            // The gate, restated at the last possible moment. A caller that
            // forgets to check consent still cannot leak an event.
            if (!evt.MarketingConsent)
            {
                _logger.LogDebug("Meta purchase not sent: buyer did not consent to advertising measurement.");
                return;
            }
            if (!IsConfigured)
            {
                _logger.LogDebug("Meta purchase not sent: META_PIXEL_ID / META_CAPI_ACCESS_TOKEN not configured.");
                return;
            }

            var userData = new Dictionary<string, object?>
            {
                ["em"] = HashEmail(evt.Email),
                ["fbp"] = Blank(evt.Fbp),
                ["fbc"] = Blank(evt.Fbc),
                ["client_ip_address"] = Blank(evt.ClientIpAddress),
                ["client_user_agent"] = Blank(evt.ClientUserAgent),
            };

            var customData = new Dictionary<string, object?>
            {
                ["currency"] = evt.Currency,
                ["value"] = decimal.Round(evt.Value, 2).ToString(CultureInfo.InvariantCulture),
                ["content_type"] = "product",
                ["plan_code"] = Blank(evt.PlanCode),
                ["utm_source"] = Blank(evt.UtmSource),
                ["utm_medium"] = Blank(evt.UtmMedium),
                ["utm_campaign"] = Blank(evt.UtmCampaign),
                ["utm_content"] = Blank(evt.UtmContent),
            };

            var payload = new Dictionary<string, object?>
            {
                ["data"] = new[]
                {
                    new Dictionary<string, object?>
                    {
                        ["event_name"] = "Purchase",
                        ["event_time"] = DateTimeOffset.UtcNow.ToUnixTimeSeconds(),
                        ["event_id"] = evt.EventId,
                        ["action_source"] = "website",
                        ["event_source_url"] = Blank(evt.EventSourceUrl),
                        ["user_data"] = Prune(userData),
                        ["custom_data"] = Prune(customData),
                    },
                },
            };
            if (!string.IsNullOrWhiteSpace(_testEventCode))
                payload["test_event_code"] = _testEventCode;

            var url = $"https://graph.facebook.com/{GraphVersion}/{_pixelId}/events?access_token={Uri.EscapeDataString(_accessToken!)}";

            try
            {
                using var res = await _http.PostAsJsonAsync(url, payload, ct);
                if (!res.IsSuccessStatusCode)
                {
                    var body = await res.Content.ReadAsStringAsync(ct);
                    // Warning, not error, and never rethrown. A marketing
                    // report failing must never turn a successful payment into
                    // a failed request for the person who just paid.
                    _logger.LogWarning(
                        "Meta Conversions API returned {Status} for event {EventId}: {Body}",
                        (int)res.StatusCode, evt.EventId, body);
                    return;
                }
                _logger.LogInformation("Meta purchase reported for event {EventId}.", evt.EventId);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Meta Conversions API call failed for event {EventId}.", evt.EventId);
            }
        }

        // Meta requires lowercase, trimmed, SHA-256 hex. Anything else is
        // silently unmatched, which looks like a tracking bug rather than a
        // formatting one, so it is worth being exact.
        private static string? HashEmail(string? email)
        {
            if (string.IsNullOrWhiteSpace(email)) return null;
            var normalised = email.Trim().ToLowerInvariant();
            var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(normalised));
            return Convert.ToHexStringLower(bytes);
        }

        private static string? Blank(string? value)
            => string.IsNullOrWhiteSpace(value) ? null : value;

        private static Dictionary<string, object?> Prune(Dictionary<string, object?> source)
            => source.Where(kv => kv.Value is not null).ToDictionary(kv => kv.Key, kv => kv.Value);
    }

    // Everything the API needs to report a purchase, as it survives a round
    // trip through Paystack transaction metadata. Metadata is a flat string
    // map, so this is flat and stringly typed on purpose.
    //
    // Deliberately absent: IP address and user agent. Both would help Meta
    // match the event, and both would mean handing a payment processor personal
    // data for a marketing purpose it has no part in. They are read from the
    // live request on the verify path instead, where the buyer's own browser is
    // the one asking.
    public static class MarketingMetadata
    {
        public const string ConsentKey = "mkt_consent";
        public const string EventIdKey = "mkt_event_id";
        public const string FbpKey = "mkt_fbp";
        public const string FbcKey = "mkt_fbc";
        public const string UtmSourceKey = "mkt_utm_source";
        public const string UtmMediumKey = "mkt_utm_medium";
        public const string UtmCampaignKey = "mkt_utm_campaign";
        public const string UtmContentKey = "mkt_utm_content";

        // Paystack metadata is echoed back verbatim and ends up in their
        // dashboard, so every value is length-capped before it goes anywhere.
        public const int MaxValueLength = 200;

        public static string? Take(IReadOnlyDictionary<string, string>? metadata, string key)
            => metadata is not null && metadata.TryGetValue(key, out var v) && !string.IsNullOrWhiteSpace(v)
                ? v
                : null;

        public static bool HasConsent(IReadOnlyDictionary<string, string>? metadata)
            => string.Equals(Take(metadata, ConsentKey), "1", StringComparison.Ordinal);
    }
}
