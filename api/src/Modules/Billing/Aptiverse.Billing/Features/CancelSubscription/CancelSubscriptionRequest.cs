namespace Aptiverse.Billing.Features.CancelSubscription;

/// <param name="Reason">Optional: "too_expensive", "not_using", "missing_feature" or "other".</param>
/// <param name="Comment">Optional, up to 500 characters.</param>
internal sealed record CancelSubscriptionRequest(string? Reason, string? Comment)
{
    public const int CommentMaxLength = 500;

    public static IReadOnlyList<string> Reasons { get; } = ["too_expensive", "not_using", "missing_feature", "other"];
}
