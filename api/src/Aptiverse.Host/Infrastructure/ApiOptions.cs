using System.ComponentModel.DataAnnotations;

namespace Aptiverse.Host.Infrastructure;

internal sealed class CorsSettings
{
    public const string SectionName = "Cors";

    public string[] AllowedOrigins { get; set; } = [];
}

internal sealed class ForwardedHeadersSettings
{
    public const string SectionName = "ForwardedHeaders";

    /// <summary>Exact proxy addresses allowed to set X-Forwarded-For / X-Forwarded-Proto.</summary>
    public string[] KnownProxies { get; set; } = [];

    /// <summary>CIDR ranges allowed to set forwarded headers, for example the VPC range the ALB lives in.</summary>
    public string[] KnownNetworks { get; set; } = [];

    [Range(1, 5)]
    public int ForwardLimit { get; set; } = 1;
}

internal sealed class RateLimitingSettings
{
    public const string SectionName = "RateLimiting";

    [Range(1, 100_000)]
    public int PermitLimit { get; set; } = 100;

    [Range(1, 3600)]
    public int WindowSeconds { get; set; } = 60;
}
