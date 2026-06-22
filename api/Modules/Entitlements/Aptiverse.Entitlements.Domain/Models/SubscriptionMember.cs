using Aptiverse.Api.Data.Abstractions;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Entitlements.Domain.Models
{
    // A user entitled to a subscription's features. The owner of the
    // subscription is automatically a member with role "owner"; others
    // are added by the owner (or by ops) and have role "member".
    //
    // A user can be a member of multiple subscriptions — their effective
    // feature set is the union across all active memberships, plus the
    // free-tier features (always granted implicitly).
    //
    // Indexes: UserId is the lookup that drives every entitlement resolve
    // (GetFeaturesAsync / GetLimitAsync filter members by UserId then
    // join to Subscription). SubscriptionId is the FK back to the parent.
    [Index(nameof(UserId))]
    [Index(nameof(SubscriptionId))]
    public class SubscriptionMember : IEntityTimestamps
    {
        public long Id { get; set; }
        public long SubscriptionId { get; set; }

        // FK to identity.users.id.
        public required string UserId { get; set; }

        // owner | member
        public string Role { get; set; } = "member";

        // Domain timestamp — when the user actually joined. Distinct from
        // the audit CreatedAt below (which records the row insert).
        public DateTime JoinedAt { get; set; } = DateTime.UtcNow;

        // Inviter user id — for audit. Null when the membership is
        // auto-created (e.g. owner on subscription create).
        public string? InvitedByUserId { get; set; }

        // Audit columns — stamped automatically by AuditableEntityInterceptor.
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public virtual Subscription? Subscription { get; set; }
    }
}
