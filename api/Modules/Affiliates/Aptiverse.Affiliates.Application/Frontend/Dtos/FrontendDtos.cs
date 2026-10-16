using System.Text.Json.Serialization;

namespace Aptiverse.Affiliates.Application.Frontend.Dtos
{
    // What the affiliate sees the moment they open their page. The founder
    // wants "how much have I made" to be unmistakable, so the earnings split
    // is the shape of the response rather than something the client assembles.
    public record FrontendAffiliateSummaryDto
    {
        [JsonPropertyName("referralCode")] public string ReferralCode { get; init; } = "";
        [JsonPropertyName("shareUrl")] public string ShareUrl { get; init; } = "";
        [JsonPropertyName("status")] public string Status { get; init; } = "";
        [JsonPropertyName("audience")] public string Audience { get; init; } = "";

        // not_started | submitted | approved | rejected
        [JsonPropertyName("payoutOnboardingStatus")] public string PayoutOnboardingStatus { get; init; } = "";
        [JsonPropertyName("hasPayoutDetails")] public bool HasPayoutDetails { get; init; }
        // True when there is money on the table and no way to pay it yet. The
        // dashboard uses this to prompt, never to hide the earnings.
        [JsonPropertyName("needsPayoutDetails")] public bool NeedsPayoutDetails { get; init; }
        [JsonPropertyName("reviewNotes")] public string? ReviewNotes { get; init; }

        [JsonPropertyName("commissionRatePercent")] public decimal CommissionRatePercent { get; init; }
        [JsonPropertyName("commissionablePayments")] public int CommissionablePayments { get; init; }
        [JsonPropertyName("holdDays")] public int HoldDays { get; init; }
        [JsonPropertyName("attributionIsLifetime")] public bool AttributionIsLifetime { get; init; }

        [JsonPropertyName("referralsTotal")] public int ReferralsTotal { get; init; }
        [JsonPropertyName("referralsSignedUp")] public int ReferralsSignedUp { get; init; }
        [JsonPropertyName("referralsEarning")] public int ReferralsEarning { get; init; }
        [JsonPropertyName("referralsCompleted")] public int ReferralsCompleted { get; init; }
        [JsonPropertyName("referralsFlagged")] public int ReferralsFlagged { get; init; }

        [JsonPropertyName("lifetimeEarnedZar")] public decimal LifetimeEarnedZar { get; init; }
        [JsonPropertyName("pendingZar")] public decimal PendingZar { get; init; }
        [JsonPropertyName("onHoldZar")] public decimal OnHoldZar { get; init; }
        [JsonPropertyName("payableZar")] public decimal PayableZar { get; init; }
        [JsonPropertyName("paidZar")] public decimal PaidZar { get; init; }
        [JsonPropertyName("reversedZar")] public decimal ReversedZar { get; init; }
        // Negative when a clawback landed after the money was paid out. It
        // reduces the next payout rather than being chased as cash.
        [JsonPropertyName("carriedBalanceZar")] public decimal CarriedBalanceZar { get; init; }
        [JsonPropertyName("nextHoldReleaseAt")] public DateTime? NextHoldReleaseAt { get; init; }
    }

    // A referred person, as their referrer is allowed to see them: never a
    // name, never an email. What they are entitled to know is that somebody
    // signed up on their link and where that stands.
    public record FrontendReferralDto
    {
        [JsonPropertyName("id")] public string Id { get; init; } = "";
        [JsonPropertyName("status")] public string Status { get; init; } = "";
        [JsonPropertyName("signedUpAt")] public DateTime SignedUpAt { get; init; }
        [JsonPropertyName("firstPaymentAt")] public DateTime? FirstPaymentAt { get; init; }
        [JsonPropertyName("paymentsCommissioned")] public int PaymentsCommissioned { get; init; }
        [JsonPropertyName("paymentsRemaining")] public int PaymentsRemaining { get; init; }
        [JsonPropertyName("earnedZar")] public decimal EarnedZar { get; init; }
        [JsonPropertyName("planCode")] public string? PlanCode { get; init; }
    }

    public record FrontendCommissionEntryDto
    {
        [JsonPropertyName("id")] public string Id { get; init; } = "";
        [JsonPropertyName("referralId")] public string ReferralId { get; init; } = "";
        [JsonPropertyName("entryType")] public string EntryType { get; init; } = "";
        [JsonPropertyName("status")] public string Status { get; init; } = "";
        [JsonPropertyName("paymentNumber")] public int PaymentNumber { get; init; }
        [JsonPropertyName("sourcePaymentAmountZar")] public decimal SourcePaymentAmountZar { get; init; }
        [JsonPropertyName("commissionRatePercent")] public decimal CommissionRatePercent { get; init; }
        [JsonPropertyName("amountZar")] public decimal AmountZar { get; init; }
        [JsonPropertyName("occurredAt")] public DateTime OccurredAt { get; init; }
        [JsonPropertyName("holdUntil")] public DateTime? HoldUntil { get; init; }
        [JsonPropertyName("paidAt")] public DateTime? PaidAt { get; init; }
        [JsonPropertyName("planCode")] public string? PlanCode { get; init; }
        [JsonPropertyName("reason")] public string? Reason { get; init; }
        // The founder's bank reference, once the payout that settled this
        // entry has been marked paid.
        [JsonPropertyName("paymentReference")] public string? PaymentReference { get; init; }
    }

    public record FrontendPayoutDto
    {
        [JsonPropertyName("id")] public string Id { get; init; } = "";
        [JsonPropertyName("runReference")] public string RunReference { get; init; } = "";
        [JsonPropertyName("periodStart")] public DateTime PeriodStart { get; init; }
        [JsonPropertyName("periodEnd")] public DateTime PeriodEnd { get; init; }
        [JsonPropertyName("totalZar")] public decimal TotalZar { get; init; }
        [JsonPropertyName("entryCount")] public int EntryCount { get; init; }
        [JsonPropertyName("status")] public string Status { get; init; } = "";
        [JsonPropertyName("paymentReference")] public string? PaymentReference { get; init; }
        [JsonPropertyName("paidAt")] public DateTime? PaidAt { get; init; }
        [JsonPropertyName("notes")] public string? Notes { get; init; }
    }

    // A South African tax year, 1 March to end of February, named for the year
    // it starts in.
    public record FrontendTaxYearDto
    {
        [JsonPropertyName("taxYear")] public int TaxYear { get; init; }
        [JsonPropertyName("label")] public string Label { get; init; } = "";
        [JsonPropertyName("startsOn")] public DateTime StartsOn { get; init; }
        [JsonPropertyName("endsOn")] public DateTime EndsOn { get; init; }
        [JsonPropertyName("paidZar")] public decimal PaidZar { get; init; }
        [JsonPropertyName("accruedZar")] public decimal AccruedZar { get; init; }
        [JsonPropertyName("payoutCount")] public int PayoutCount { get; init; }
    }

    // The payout onboarding form. Every field a bank transfer and a defensible
    // payment record needs, and nothing that is not.
    public record PayoutDetailsDto
    {
        [JsonPropertyName("legalFirstName")] public string LegalFirstName { get; init; } = "";
        [JsonPropertyName("legalLastName")] public string LegalLastName { get; init; } = "";
        // "sa_id" or "passport"
        [JsonPropertyName("idType")] public string IdType { get; init; } = "sa_id";
        [JsonPropertyName("idNumber")] public string IdNumber { get; init; } = "";
        [JsonPropertyName("taxReferenceNumber")] public string? TaxReferenceNumber { get; init; }
        [JsonPropertyName("addressLine1")] public string AddressLine1 { get; init; } = "";
        [JsonPropertyName("addressLine2")] public string? AddressLine2 { get; init; }
        [JsonPropertyName("city")] public string City { get; init; } = "";
        [JsonPropertyName("province")] public string? Province { get; init; }
        [JsonPropertyName("postalCode")] public string PostalCode { get; init; } = "";
        [JsonPropertyName("country")] public string? Country { get; init; }
        [JsonPropertyName("bankName")] public string BankName { get; init; } = "";
        [JsonPropertyName("accountHolderName")] public string AccountHolderName { get; init; } = "";
        [JsonPropertyName("accountNumber")] public string AccountNumber { get; init; } = "";
        [JsonPropertyName("branchCode")] public string BranchCode { get; init; } = "";
        [JsonPropertyName("accountType")] public string? AccountType { get; init; }
        [JsonPropertyName("contactEmail")] public string? ContactEmail { get; init; }
        [JsonPropertyName("contactPhone")] public string? ContactPhone { get; init; }
    }

    public record ClaimReferralDto
    {
        [JsonPropertyName("code")] public string Code { get; init; } = "";
        [JsonPropertyName("landingPath")] public string? LandingPath { get; init; }
        [JsonPropertyName("deviceId")] public string? DeviceId { get; init; }
    }

    public record ReferralCodeCheckDto
    {
        [JsonPropertyName("valid")] public bool Valid { get; init; }
        [JsonPropertyName("code")] public string Code { get; init; } = "";
    }

    // ---- Admin ---------------------------------------------------------

    public record AdminAffiliateDto
    {
        [JsonPropertyName("id")] public string Id { get; init; } = "";
        [JsonPropertyName("userId")] public string UserId { get; init; } = "";
        [JsonPropertyName("displayName")] public string DisplayName { get; init; } = "";
        [JsonPropertyName("email")] public string? Email { get; init; }
        [JsonPropertyName("referralCode")] public string ReferralCode { get; init; } = "";
        [JsonPropertyName("status")] public string Status { get; init; } = "";
        [JsonPropertyName("audience")] public string Audience { get; init; } = "";
        [JsonPropertyName("payoutOnboardingStatus")] public string PayoutOnboardingStatus { get; init; } = "";
        [JsonPropertyName("hasPayoutDetails")] public bool HasPayoutDetails { get; init; }
        [JsonPropertyName("detailsSubmittedAt")] public DateTime? DetailsSubmittedAt { get; init; }
        [JsonPropertyName("referralCount")] public int ReferralCount { get; init; }
        [JsonPropertyName("payableZar")] public decimal PayableZar { get; init; }
        [JsonPropertyName("onHoldZar")] public decimal OnHoldZar { get; init; }
        [JsonPropertyName("pendingZar")] public decimal PendingZar { get; init; }
        [JsonPropertyName("paidZar")] public decimal PaidZar { get; init; }
        // Only ever populated on the single-affiliate read an admin opens
        // deliberately, never on a list.
        [JsonPropertyName("payoutDetails")] public AdminPayoutDetailsDto? PayoutDetails { get; init; }
    }

    public record AdminPayoutDetailsDto
    {
        [JsonPropertyName("legalName")] public string LegalName { get; init; } = "";
        [JsonPropertyName("idType")] public string? IdType { get; init; }
        [JsonPropertyName("idNumber")] public string? IdNumber { get; init; }
        [JsonPropertyName("taxReferenceNumber")] public string? TaxReferenceNumber { get; init; }
        [JsonPropertyName("address")] public string Address { get; init; } = "";
        [JsonPropertyName("bankName")] public string? BankName { get; init; }
        [JsonPropertyName("accountHolderName")] public string? AccountHolderName { get; init; }
        [JsonPropertyName("accountNumber")] public string? AccountNumber { get; init; }
        [JsonPropertyName("branchCode")] public string? BranchCode { get; init; }
        [JsonPropertyName("accountType")] public string? AccountType { get; init; }
        [JsonPropertyName("contactEmail")] public string? ContactEmail { get; init; }
        [JsonPropertyName("contactPhone")] public string? ContactPhone { get; init; }
    }

    public record AdminFlaggedReferralDto
    {
        [JsonPropertyName("id")] public string Id { get; init; } = "";
        [JsonPropertyName("affiliateId")] public string AffiliateId { get; init; } = "";
        [JsonPropertyName("affiliateName")] public string AffiliateName { get; init; } = "";
        [JsonPropertyName("affiliateCode")] public string AffiliateCode { get; init; } = "";
        [JsonPropertyName("referredName")] public string ReferredName { get; init; } = "";
        [JsonPropertyName("referredEmail")] public string? ReferredEmail { get; init; }
        [JsonPropertyName("status")] public string Status { get; init; } = "";
        [JsonPropertyName("flagReason")] public string? FlagReason { get; init; }
        [JsonPropertyName("signedUpAt")] public DateTime SignedUpAt { get; init; }
        [JsonPropertyName("parkedZar")] public decimal ParkedZar { get; init; }
        [JsonPropertyName("signals")] public IList<AdminFraudSignalDto> Signals { get; init; } = [];
    }

    public record AdminFraudSignalDto
    {
        [JsonPropertyName("signalType")] public string SignalType { get; init; } = "";
        [JsonPropertyName("severity")] public string Severity { get; init; } = "";
        [JsonPropertyName("detail")] public string? Detail { get; init; }
        [JsonPropertyName("occurredAt")] public DateTime OccurredAt { get; init; }
    }

    // The programme, as the founder needs to see it before he opens his
    // banking app.
    public record AdminProgrammeSummaryDto
    {
        [JsonPropertyName("affiliateCount")] public int AffiliateCount { get; init; }
        [JsonPropertyName("activeReferrerCount")] public int ActiveReferrerCount { get; init; }
        [JsonPropertyName("referralCount")] public int ReferralCount { get; init; }
        [JsonPropertyName("payingReferralCount")] public int PayingReferralCount { get; init; }
        [JsonPropertyName("awaitingReview")] public int AwaitingReview { get; init; }
        [JsonPropertyName("flaggedReferrals")] public int FlaggedReferrals { get; init; }
        [JsonPropertyName("pendingZar")] public decimal PendingZar { get; init; }
        [JsonPropertyName("onHoldZar")] public decimal OnHoldZar { get; init; }
        [JsonPropertyName("payableZar")] public decimal PayableZar { get; init; }
        // Payable but unpayable: earned by someone who has not completed
        // payout onboarding.
        [JsonPropertyName("blockedOnDetailsZar")] public decimal BlockedOnDetailsZar { get; init; }
        [JsonPropertyName("paidZar")] public decimal PaidZar { get; init; }
        [JsonPropertyName("draftPayoutCount")] public int DraftPayoutCount { get; init; }
        [JsonPropertyName("draftPayoutZar")] public decimal DraftPayoutZar { get; init; }
    }

    // One line the founder acts on in his banking app.
    public record AdminPayoutLineDto
    {
        [JsonPropertyName("id")] public string Id { get; init; } = "";
        [JsonPropertyName("runReference")] public string RunReference { get; init; } = "";
        [JsonPropertyName("affiliateId")] public string AffiliateId { get; init; } = "";
        [JsonPropertyName("affiliateCode")] public string AffiliateCode { get; init; } = "";
        [JsonPropertyName("payeeName")] public string PayeeName { get; init; } = "";
        [JsonPropertyName("bankName")] public string? BankName { get; init; }
        [JsonPropertyName("accountHolderName")] public string? AccountHolderName { get; init; }
        [JsonPropertyName("accountNumber")] public string? AccountNumber { get; init; }
        [JsonPropertyName("branchCode")] public string? BranchCode { get; init; }
        [JsonPropertyName("accountType")] public string? AccountType { get; init; }
        [JsonPropertyName("amountZar")] public decimal AmountZar { get; init; }
        [JsonPropertyName("entryCount")] public int EntryCount { get; init; }
        [JsonPropertyName("periodStart")] public DateTime PeriodStart { get; init; }
        [JsonPropertyName("periodEnd")] public DateTime PeriodEnd { get; init; }
        [JsonPropertyName("status")] public string Status { get; init; } = "";
        [JsonPropertyName("paymentReference")] public string? PaymentReference { get; init; }
        [JsonPropertyName("paidAt")] public DateTime? PaidAt { get; init; }
        // What the founder should type as his own payment reference. A
        // suggestion, not a constraint: whatever he actually types is what
        // gets stored.
        [JsonPropertyName("suggestedReference")] public string SuggestedReference { get; init; } = "";
    }

    public record GeneratePayoutRunDto
    {
        // Commission earned on or before this date is swept in. Defaults to
        // now when omitted.
        [JsonPropertyName("periodEnd")] public DateTime? PeriodEnd { get; init; }
        // Do not create a payout below this. Small balances cost more in bank
        // charges and admin than they are worth; they roll forward untouched.
        [JsonPropertyName("minimumZar")] public decimal? MinimumZar { get; init; }
    }

    public record MarkPayoutPaidDto
    {
        // What he typed into his banking app. Required: this is the whole
        // point of the record.
        [JsonPropertyName("paymentReference")] public string PaymentReference { get; init; } = "";
        [JsonPropertyName("paidAt")] public DateTime? PaidAt { get; init; }
        [JsonPropertyName("notes")] public string? Notes { get; init; }
    }

    public record ReviewDto
    {
        [JsonPropertyName("notes")] public string? Notes { get; init; }
    }

    public record ReverseCommissionDto
    {
        [JsonPropertyName("reason")] public string Reason { get; init; } = "";
    }
}
