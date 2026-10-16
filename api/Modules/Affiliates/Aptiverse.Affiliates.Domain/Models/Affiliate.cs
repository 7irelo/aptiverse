using Aptiverse.Api.Data.Abstractions;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Affiliates.Domain.Models
{
    // Whether the affiliate is allowed to earn at all. Every account gets an
    // Active affiliate row with a code the moment it exists, so this is not an
    // application gate: it is the switch an admin flips when something is
    // wrong. Suspended stops new accrual and stops payouts; nothing already
    // earned is deleted, because the ledger is append-only.
    public enum AffiliateStatus
    {
        Active,
        Suspended,
    }

    // The second, separate state: can this person actually be PAID.
    //
    // A referral code costs nothing to hand out and asks nothing of the person
    // holding it. A payout, by contrast, is money leaving a sole proprietor's
    // bank account to a named individual, and the record of it has to stand up
    // years later. So identity and banking detail are collected once there is
    // a balance worth claiming, not at signup, and reviewed before the first
    // payment goes out.
    public enum PayoutOnboardingStatus
    {
        // Signup default. They can refer and they can earn; they simply cannot
        // be paid until they tell us who they are and where the money goes.
        NotStarted,
        // Details submitted, waiting on the founder to look at them.
        Submitted,
        // Cleared. Payout runs will include them.
        Approved,
        // Something did not check out. Earnings keep accruing; nothing pays.
        Rejected,
    }

    // A person who can refer others. One row per user account, created
    // automatically, never deleted.
    //
    // The identity and banking block is deliberately a flat set of nullable
    // columns rather than a separate table: a payout record has to be readable
    // on its own in five years without a join to a table someone might have
    // pruned, and the payout itself snapshots these values anyway (see
    // AffiliatePayout) so that a later change of bank account cannot rewrite
    // the history of where money was actually sent.
    [Index(nameof(ReferralCode), IsUnique = true)]
    [Index(nameof(UserId), IsUnique = true)]
    [Index(nameof(PayoutOnboardingStatus))]
    public class Affiliate : IEntityTimestamps
    {
        public long Id { get; set; }

        // identity.users.id of the person. Not a navigation property: the auth
        // module owns User and this module does not reference it.
        public required string UserId { get; set; }

        // The shareable code. Uppercase, unambiguous alphabet, unique.
        public required string ReferralCode { get; set; }

        public AffiliateStatus Status { get; set; } = AffiliateStatus.Active;

        // student | tutor | parent | public. Snapshotted from the account's
        // role when the affiliate row is minted, so the founder can see which
        // audience is actually driving signups.
        public string Audience { get; set; } = "public";

        public PayoutOnboardingStatus PayoutOnboardingStatus { get; set; }
            = PayoutOnboardingStatus.NotStarted;

        // ---- Identity, as a payment record needs it -----------------------
        public string? LegalFirstName { get; set; }
        public string? LegalLastName { get; set; }
        // "sa_id" or "passport".
        public string? IdType { get; set; }
        public string? IdNumber { get; set; }
        // SARS income tax reference. Prompted for, never required: plenty of
        // students genuinely do not have one yet.
        public string? TaxReferenceNumber { get; set; }

        public string? AddressLine1 { get; set; }
        public string? AddressLine2 { get; set; }
        public string? City { get; set; }
        public string? Province { get; set; }
        public string? PostalCode { get; set; }
        public string? Country { get; set; }

        // ---- Where the money goes -----------------------------------------
        public string? BankName { get; set; }
        public string? AccountHolderName { get; set; }
        public string? AccountNumber { get; set; }
        public string? BranchCode { get; set; }
        // "cheque" | "savings" | "transmission".
        public string? AccountType { get; set; }

        public string? ContactEmail { get; set; }
        public string? ContactPhone { get; set; }

        // ---- Review trail --------------------------------------------------
        public DateTime? DetailsSubmittedAt { get; set; }
        public DateTime? ReviewedAt { get; set; }
        public string? ReviewedByUserId { get; set; }
        public string? ReviewNotes { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // True once every field a bank transfer and a SARS-defensible record
        // needs is present. Not mapped: it is a read over the columns above.
        public bool HasPayoutDetails()
            => !string.IsNullOrWhiteSpace(LegalFirstName)
            && !string.IsNullOrWhiteSpace(LegalLastName)
            && !string.IsNullOrWhiteSpace(IdType)
            && !string.IsNullOrWhiteSpace(IdNumber)
            && !string.IsNullOrWhiteSpace(AddressLine1)
            && !string.IsNullOrWhiteSpace(City)
            && !string.IsNullOrWhiteSpace(PostalCode)
            && !string.IsNullOrWhiteSpace(BankName)
            && !string.IsNullOrWhiteSpace(AccountHolderName)
            && !string.IsNullOrWhiteSpace(AccountNumber)
            && !string.IsNullOrWhiteSpace(BranchCode);
    }
}
