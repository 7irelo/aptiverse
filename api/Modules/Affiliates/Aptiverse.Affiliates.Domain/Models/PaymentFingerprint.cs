using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Affiliates.Domain.Models
{
    // A card, and the accounts that have paid with it.
    //
    // Paystack returns a stable `signature` on every authorization, which is
    // the same value for the same physical card across customers. That makes
    // it the strongest self-referral signal available here: an email domain
    // proves nothing, but one card paying for both the referrer's own
    // subscription and their "referral's" subscription is worth a look.
    //
    // The signature is stored hashed. It is a payment identifier, we only ever
    // need to know whether two of them are equal, and an equality check works
    // just as well on the hash. Nothing downstream ever needs the original.
    [Index(nameof(FingerprintHash))]
    [Index(nameof(UserId))]
    public class PaymentFingerprint
    {
        public long Id { get; set; }

        public required string UserId { get; set; }

        // SHA-256 of the Paystack authorization signature, hex encoded.
        public required string FingerprintHash { get; set; }

        // Purely for display in the admin review screen: "Visa ending 4081".
        public string? CardBrand { get; set; }
        public string? CardLast4 { get; set; }

        public DateTime FirstSeenAt { get; set; } = DateTime.UtcNow;
        public DateTime LastSeenAt { get; set; } = DateTime.UtcNow;
    }

    // A device that claimed a referral code. Weaker than a card, stronger than
    // an email domain: the same browser profile signing up as both referrer
    // and referral is worth flagging even though a shared family laptop is a
    // perfectly innocent explanation, which is exactly why it flags for review
    // rather than blocks.
    [Index(nameof(DeviceHash))]
    [Index(nameof(UserId))]
    public class DeviceFingerprint
    {
        public long Id { get; set; }

        public required string UserId { get; set; }

        // SHA-256 of the browser-generated device id, hex encoded.
        public required string DeviceHash { get; set; }

        public DateTime FirstSeenAt { get; set; } = DateTime.UtcNow;
        public DateTime LastSeenAt { get; set; } = DateTime.UtcNow;
    }
}
