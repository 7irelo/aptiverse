using Aptiverse.Affiliates.Application;
using Aptiverse.Affiliates.Application.Services;
using Aptiverse.Api.Utilities;
using Aptiverse.Core.Services;
using Microsoft.Extensions.Logging;

namespace Aptiverse.Api.Data.Email
{
    /// <summary>
    /// Sends the one-time referral-link email, on successful email
    /// verification and nowhere else.
    ///
    /// Ownership boundary: the affiliates module owns the code, the ledger
    /// and the commercial terms. This class owns only the message. It reads
    /// the code through IAffiliateService and reads the numbers out of
    /// AffiliateProgramme, so changing the rate or the payment count there
    /// changes this email with it and cannot leave the copy lying.
    ///
    /// Every failure path is silent. A person who has just verified their
    /// address must never see an error because a marketing email could not
    /// be composed, and an affiliate email with an empty or broken link is
    /// worse than no email at all, so a missing code sends nothing.
    /// </summary>
    public sealed class AffiliateWelcomeEmail(
        IEmailSender emailSender,
        ILogger<AffiliateWelcomeEmail> logger,
        IAffiliateService? affiliates = null)
    {
        /// <summary>
        /// Where a referral link points. The home page, not the signup form:
        /// these links are mostly forwarded to someone who has never heard of
        /// the product, and asking for an account before explaining what it is
        /// converts badly. A prettier /r/{code} alias can redirect here later
        /// without touching this file.
        /// </summary>
        public static string ShareUrl(string code) => WebApp.Url($"/?ref={code}");

        public async Task SendAsync(
            string userId, string email, string firstName, CancellationToken ct = default)
        {
            if (string.IsNullOrWhiteSpace(userId) || string.IsNullOrWhiteSpace(email)) return;

            // Absent from DI: the affiliate programme is not wired in this
            // deployment. Not an error, just nothing to say.
            if (affiliates is null)
            {
                logger.LogInformation(
                    "Affiliate welcome email skipped for {UserId}: affiliate service not registered.",
                    userId);
                return;
            }

            string code;
            try
            {
                var affiliate = await affiliates.EnsureAffiliateAsync(userId, ct: ct);
                code = affiliate?.ReferralCode ?? "";
            }
            catch (Exception ex)
            {
                logger.LogWarning(ex,
                    "Affiliate welcome email skipped for {UserId}: could not resolve a referral code.",
                    userId);
                return;
            }

            if (string.IsNullOrWhiteSpace(code))
            {
                logger.LogWarning(
                    "Affiliate welcome email skipped for {UserId}: referral code was empty.", userId);
                return;
            }

            try
            {
                await emailSender.SendTemplateEmailAsync(
                    email,
                    "Your Aptiverse referral link",
                    "affiliate_welcome",
                    new
                    {
                        FirstName = firstName,
                        ReferralCode = code,
                        Url = ShareUrl(code),
                        // Read from the programme constants rather than typed
                        // into the copy, so the email cannot drift from the
                        // terms the ledger actually applies.
                        CommissionRate =
                            $"{AffiliateProgramme.CommissionRate * 100:0.#}% of each payment",
                        CommissionWindow =
                            $"their first {Words(AffiliateProgramme.CommissionablePayments)} payments",
                        HoldWindow = $"{AffiliateProgramme.HoldDays} days",
                    });
            }
            catch (Exception ex)
            {
                logger.LogWarning(ex,
                    "Affiliate welcome email enqueue failed for {UserId}; non-fatal.", userId);
            }
        }

        // Small counts read better as words in prose than as digits.
        private static string Words(int n) => n switch
        {
            1 => "one",
            2 => "two",
            3 => "three",
            4 => "four",
            5 => "five",
            _ => n.ToString(),
        };
    }
}
