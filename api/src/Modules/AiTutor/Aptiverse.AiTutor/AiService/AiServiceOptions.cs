using System.ComponentModel.DataAnnotations;

namespace Aptiverse.AiTutor.AiService;

/// <summary>Where the internal ai service lives and the per-user limits the API enforces before calling it.</summary>
internal sealed class AiServiceOptions
{
    public const string SectionName = "AiService";

    /// <summary>Absolute http or https base URL of the ai service, reachable only from inside the network.</summary>
    [Required]
    public Uri BaseUrl { get; set; } = null!;

    /// <summary>Audience of the service tokens; the ai service verifies exactly this value.</summary>
    [Required(AllowEmptyStrings = false)]
    public string Audience { get; set; } = "aptiverse-ai";

    /// <summary>Total time allowed for one call, including the whole streamed tutor turn.</summary>
    [Range(5, 600)]
    public int TimeoutSeconds { get; set; } = 120;

    /// <summary>Messages a user may send per UTC day, across all conversations.</summary>
    [Range(1, 10_000)]
    public int DailyMessageLimit { get; set; } = 100;

    /// <summary>Longest message a student may send. The ai service rejects anything above 4000.</summary>
    [Range(1, 4000)]
    public int MaxMessageChars { get; set; } = 4000;

    /// <summary>Most recent messages sent as history with each turn. The ai service accepts at most 40.</summary>
    [Range(0, 40)]
    public int HistoryTurns { get; set; } = 20;

    /// <summary>Burst limit on sending messages, per user, on top of the daily limit.</summary>
    [Range(1, 1000)]
    public int SendMessagePermitLimit { get; set; } = 10;

    [Range(1, 3600)]
    public int SendMessageWindowSeconds { get; set; } = 60;

    public static bool HasValidBaseUrl(AiServiceOptions options) =>
        options.BaseUrl is { IsAbsoluteUri: true } url
        && (url.Scheme == Uri.UriSchemeHttp || url.Scheme == Uri.UriSchemeHttps)
        && string.IsNullOrEmpty(url.UserInfo)
        && string.IsNullOrEmpty(url.Query)
        && string.IsNullOrEmpty(url.Fragment);
}
