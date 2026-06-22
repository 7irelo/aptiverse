namespace Aptiverse.Entitlements.Application.Services
{
    // Single source of truth for "what features does this user have?".
    // Consumed by:
    //   - the JWT token issuer (to embed the features[] claim at login)
    //   - the [RequiresFeature] action filter (server-side gating)
    //   - the admin / sales /me-shaped endpoints (so the UI can render
    //     the current plan + features)
    //
    // The free tier's features are always included implicitly — every
    // user gets them regardless of subscription membership.
    public interface IEntitlementService
    {
        Task<IReadOnlySet<string>> GetFeaturesAsync(string userId, CancellationToken ct = default);
        Task<bool> HasFeatureAsync(string userId, string featureKey, CancellationToken ct = default);
        Task<UserEntitlementsDto> GetEntitlementsAsync(string userId, CancellationToken ct = default);
    }

    // Read-shape for the UI / admin views — everything a client needs
    // to render "what plan am I on, what can I do, what's locked".
    public record UserEntitlementsDto
    {
        public required IReadOnlySet<string> Features { get; init; }
        public required IList<MembershipDto> Memberships { get; init; }
        public required string PrimaryPlanCode { get; init; }
    }

    public record MembershipDto
    {
        public required long SubscriptionId { get; init; }
        public required string PlanCode { get; init; }
        public required string PlanName { get; init; }
        public required string Role { get; init; }   // owner | member
        public required string Status { get; init; } // active | trialing | etc.
        public DateTime JoinedAt { get; init; }
    }
}
