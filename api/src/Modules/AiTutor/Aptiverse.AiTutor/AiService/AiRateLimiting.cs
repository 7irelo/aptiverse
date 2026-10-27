using System.Threading.RateLimiting;
using Aptiverse.SharedKernel.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.RateLimiting;

namespace Aptiverse.AiTutor.AiService;

/// <summary>
/// Burst limit on sending tutor messages, partitioned by user id. The daily limit is enforced separately in
/// the handler against the database, so it holds across API instances and restarts.
/// </summary>
internal static class AiRateLimiting
{
    public const string SendMessage = "ai-send-message";

    public static void AddPolicies(RateLimiterOptions limiter, AiServiceOptions options)
    {
        ArgumentNullException.ThrowIfNull(limiter);
        ArgumentNullException.ThrowIfNull(options);

        limiter.AddPolicy(SendMessage, context => RateLimitPartition.GetFixedWindowLimiter(
            $"{SendMessage}:{PartitionKey(context)}",
            _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = options.SendMessagePermitLimit,
                Window = TimeSpan.FromSeconds(options.SendMessageWindowSeconds),
                QueueLimit = 0,
            }));
    }

    private static string PartitionKey(HttpContext context) =>
        context.User.GetUserId() is { } userId
            ? $"user:{userId}"
            : $"ip:{context.Connection.RemoteIpAddress?.ToString() ?? "unknown"}";
}
