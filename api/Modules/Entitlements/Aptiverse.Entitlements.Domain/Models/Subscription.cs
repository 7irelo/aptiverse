using System.ComponentModel.DataAnnotations.Schema;
using Aptiverse.Api.Data.Abstractions;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Entitlements.Domain.Models
{
    // A purchased / provisioned subscription on a Plan. One billing
    // owner; one-to-many members who all get the plan's features.
    //
    // This models the "Family" / "School" tiers from the pricing page:
    // the parent buys Family and adds up to MaxMembers children; the
    // school buys School and adds learners + teachers + admins.
    //
    // Solo plans (Student) still go through this — a Student plan just
    // has the buying user as the only member.
    //
    // Indexes: PlanCode is the FK to Plan. OwnerUserId scopes "my
    // subscriptions" admin reads. Status is filtered on every
    // entitlement resolve (active/trialing), so index it alongside the
    // PlanCode it's almost always read with.
    [Index(nameof(PlanCode))]
    [Index(nameof(OwnerUserId))]
    [Index(nameof(Status))]
    public class Subscription : IEntityTimestamps
    {
        public long Id { get; set; }
        public required string PlanCode { get; set; }

        // The billing user. Admin actions on the subscription (add
        // member, cancel, change plan) require being the owner OR a
        // platform Admin.
        public required string OwnerUserId { get; set; }

        // Display name — "The Mokoena Family", "Crawford College Pretoria".
        // Optional; falls back to the owner's name in the UI.
        public string? Name { get; set; }

        // active | trialing | past_due | cancelled
        public string Status { get; set; } = "active";

        public DateTime StartedAt { get; set; } = DateTime.UtcNow;
        public DateTime? CancelledAt { get; set; }
        // When does the access expire? Null = no scheduled end (until cancelled).
        public DateTime? ValidUntil { get; set; }

        // Payment-provider linkage (Paystack). Null until billing is wired —
        // they only get populated on real paid subscriptions. The
        // authorization code is the reusable card token, captured on
        // activation so we can charge renewals (and a scheduled downgrade)
        // without asking for the card again.
        //
        // PaystackSubscriptionCode is legacy: Path A drives recurring billing
        // ourselves via charge_authorization, so new subs never create a
        // Paystack subscription object (and never trigger its manage-link
        // email). It stays for any pre-Path-A subs still linked to one.
        public string? PaystackSubscriptionCode { get; set; }
        public string? PaystackCustomerCode { get; set; }
        public long? PaystackCustomerId { get; set; }
        public string? PaystackAuthorizationCode { get; set; }

        // Renewal state we own (Path A). Billing is the charge interval
        // ("monthly" | "annual"); BillingEmail is who charge_authorization
        // bills. Card* is the saved-card summary shown on the billing page
        // (we no longer fetch it live from a Paystack subscription).
        public string Billing { get; set; } = "monthly";
        public string? BillingEmail { get; set; }
        public string? CardBrand { get; set; }
        public string? CardLast4 { get; set; }
        public int? CardExpMonth { get; set; }
        public int? CardExpYear { get; set; }

        // When the last successful charge landed, and how many consecutive
        // renewal attempts have failed (drives the dunning window before a
        // past-due sub lapses to cancelled).
        public DateTime? LastChargeAt { get; set; }
        public int RenewalFailureCount { get; set; }

        // Scheduled downgrade: at ValidUntil the plan switches to
        // PendingPlanCode (on PendingBilling interval). Null when there is no
        // pending change. Upgrades are immediate and never use these.
        public string? PendingPlanCode { get; set; }
        public string? PendingBilling { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey(nameof(PlanCode))]
        public virtual Plan? Plan { get; set; }
        public virtual ICollection<SubscriptionMember> Members { get; set; } = [];
    }
}
