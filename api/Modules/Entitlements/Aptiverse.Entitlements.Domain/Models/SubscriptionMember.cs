namespace Aptiverse.Entitlements.Domain.Models
{
    // A user entitled to a subscription's features. The owner of the
    // subscription is automatically a member with role "owner"; others
    // are added by the owner (or by ops) and have role "member".
    //
    // A user can be a member of multiple subscriptions — their effective
    // feature set is the union across all active memberships, plus the
    // free-tier features (always granted implicitly).
    public class SubscriptionMember
    {
        public long Id { get; set; }
        public long SubscriptionId { get; set; }

        // FK to identity.users.id.
        public required string UserId { get; set; }

        // owner | member
        public string Role { get; set; } = "member";

        public DateTime JoinedAt { get; set; } = DateTime.UtcNow;

        // Inviter user id — for audit. Null when the membership is
        // auto-created (e.g. owner on subscription create).
        public string? InvitedByUserId { get; set; }

        public virtual Subscription? Subscription { get; set; }
    }
}
