using System.Security.Claims;
using System.Text.Json;
using System.Text.Json.Serialization;
using Aptiverse.Affiliates.Application.Services;
using Aptiverse.Api.Data;
using Aptiverse.Api.Services.Marketing;
using Aptiverse.Api.Utilities;
using Aptiverse.Core.Services;
using Aptiverse.Entitlements.Application.Services;
using Aptiverse.Entitlements.Domain.Models;
using Aptiverse.Entitlements.Infrastructure.Paystack;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Aptiverse.Entitlements.Controllers
{
    // Paystack billing for subscriptions.
    //
    //   POST api/payments/initialize  (authenticated)
    //        -> creates a Paystack transaction, returns authorization_url
    //   POST api/payments/webhook     (anonymous, signature-verified)
    //        -> verifies x-paystack-signature HMAC-SHA512 then drives the
    //           Subscription lifecycle off charge.success / subscription.*
    //
    // Config keys (reported to the gate, read from config/env — never
    // hardcoded): PAYSTACK_SECRET_KEY, optional Paystack:BaseUrl.
    [ApiController]
    [Route("api/payments")]
    [Authorize]
    public class PaymentsController(
        ApplicationDbContext db,
        IPaystackClient paystack,
        IPaystackSubscriptionService lifecycle,
        IEmailSender email,
        IMetaConversionsClient metaConversions,
        IAffiliateLedger affiliateLedger,
        ILogger<PaymentsController> logger) : ControllerBase
    {
        private readonly ApplicationDbContext _db = db;
        private readonly IPaystackClient _paystack = paystack;
        private readonly IPaystackSubscriptionService _lifecycle = lifecycle;
        private readonly IEmailSender _email = email;
        private readonly IMetaConversionsClient _meta = metaConversions;
        private readonly IAffiliateLedger _affiliates = affiliateLedger;
        private readonly ILogger<PaymentsController> _logger = logger;

        // Where billing emails send people to manage their plan. Built from the
        // configured web app origin (App:WebBaseUrl) so it resolves per env.
        private static string BillingUrl => WebApp.Url("/dashboard/billing");

        private string? CurrentUserId()
            => User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirst("sub")?.Value
            ?? User.FindFirst("userId")?.Value;

        // Best-effort branded email. Enqueue only (SMTP happens in the
        // background dispatcher), and never let an email failure break billing.
        private async Task SendBillingEmailAsync(string? to, string subject, string templateType, object data)
        {
            if (string.IsNullOrWhiteSpace(to)) return;
            try
            {
                await _email.SendTemplateEmailAsync(to, subject, templateType, data);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Billing email {Type} to {To} failed to enqueue.", templateType, to);
            }
        }

        // Fold the browser's attribution bundle into Paystack metadata, so it
        // comes back to us on both the verify response and the webhook body.
        //
        // Nothing is written unless the buyer consented, and the consent flag
        // itself is written so the read side can tell "they said no" apart from
        // "an old transaction predates this code". Values are length-capped
        // because they originate in a URL the visitor controls.
        private static void AddMarketingMetadata(
            IDictionary<string, string> metadata, CheckoutAttributionDto? a)
        {
            if (a is null || !a.MarketingConsent) return;

            void Put(string key, string? value)
            {
                if (string.IsNullOrWhiteSpace(value)) return;
                metadata[key] = value.Trim().Length > MarketingMetadata.MaxValueLength
                    ? value.Trim()[..MarketingMetadata.MaxValueLength]
                    : value.Trim();
            }

            metadata[MarketingMetadata.ConsentKey] = "1";
            Put(MarketingMetadata.EventIdKey, a.EventId);
            Put(MarketingMetadata.FbpKey, a.Fbp);
            Put(MarketingMetadata.FbcKey, a.Fbc);
            Put(MarketingMetadata.UtmSourceKey, a.UtmSource);
            Put(MarketingMetadata.UtmMediumKey, a.UtmMedium);
            Put(MarketingMetadata.UtmCampaignKey, a.UtmCampaign);
            Put(MarketingMetadata.UtmContentKey, a.UtmContent);
        }

        // Report a confirmed purchase to the ad platform.
        //
        // Called from BOTH the verify path and the webhook path on purpose.
        // Whichever lands first wins and the other is deduplicated by Meta on
        // the shared event_id, which is exactly why the browser generates that
        // id at checkout. Belt and braces is the right posture here: verify
        // misses the buyer who closes the tab, the webhook misses a host it
        // cannot reach, and between them the number is right.
        //
        // Never awaited into the caller's failure path. If Meta is down, the
        // person who just paid still gets their subscription.
        private async Task ReportPurchaseAsync(
            IReadOnlyDictionary<string, string> metadata,
            string? email,
            decimal valueZar,
            string? planCode,
            bool includeRequestContext,
            CancellationToken ct)
        {
            if (!MarketingMetadata.HasConsent(metadata)) return;
            var eventId = MarketingMetadata.Take(metadata, MarketingMetadata.EventIdKey);
            if (string.IsNullOrWhiteSpace(eventId)) return;

            try
            {
                await _meta.SendPurchaseAsync(new MetaPurchaseEvent
                {
                    MarketingConsent = true,
                    EventId = eventId,
                    Value = valueZar,
                    Currency = "ZAR",
                    Email = email,
                    Fbp = MarketingMetadata.Take(metadata, MarketingMetadata.FbpKey),
                    Fbc = MarketingMetadata.Take(metadata, MarketingMetadata.FbcKey),
                    // Only on the verify path, where the buyer's own browser is
                    // making the request. The webhook is Paystack's server, and
                    // sending Paystack's IP as the buyer's would be worse than
                    // sending nothing.
                    ClientIpAddress = includeRequestContext ? HttpContext.Connection.RemoteIpAddress?.ToString() : null,
                    ClientUserAgent = includeRequestContext ? Request.Headers.UserAgent.FirstOrDefault() : null,
                    EventSourceUrl = WebApp.Url("/welcome"),
                    PlanCode = planCode,
                    UtmSource = MarketingMetadata.Take(metadata, MarketingMetadata.UtmSourceKey),
                    UtmMedium = MarketingMetadata.Take(metadata, MarketingMetadata.UtmMediumKey),
                    UtmCampaign = MarketingMetadata.Take(metadata, MarketingMetadata.UtmCampaignKey),
                    UtmContent = MarketingMetadata.Take(metadata, MarketingMetadata.UtmContentKey),
                }, ct);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Purchase conversion reporting failed; billing is unaffected.");
            }
        }

        // The key an affiliate referral code travels under, in Paystack
        // transaction metadata, so it comes back on both the verify response
        // and the webhook body.
        private const string ReferralCodeKey = "referral_code";

        // Unlike the marketing bundle, this is NOT gated on marketing consent.
        // A referral code is not ad measurement: it is the term of a
        // commercial arrangement with a third party who is owed money, and
        // dropping it would mean quietly not paying somebody what they earned.
        // It is a short opaque code the affiliate themselves handed out, and
        // it carries nothing about the buyer.
        private static void AddReferralMetadata(
            IDictionary<string, string> metadata, CheckoutAttributionDto? a)
        {
            var code = a?.ReferralCode?.Trim();
            if (string.IsNullOrWhiteSpace(code)) return;
            metadata[ReferralCodeKey] = code.Length > 32 ? code[..32] : code;
        }

        // Fold a confirmed payment into the affiliate ledger.
        //
        // Called from BOTH the verify path and the webhook path, exactly like
        // the conversion reporting above and for exactly the same reason:
        // verify misses the buyer who closed the tab, the webhook misses a
        // host it cannot reach, and the ledger has to be right either way.
        // Idempotent on the Paystack reference, so a double fire accrues once.
        //
        // Never awaited into a failure path. Somebody who has just paid gets
        // their subscription whether or not a commission could be written.
        private async Task AccrueAffiliateCommissionAsync(
            string payerUserId,
            string reference,
            decimal amountZar,
            long? subscriptionId,
            string? planCode,
            string? cardSignature,
            string? cardBrand,
            string? cardLast4,
            IReadOnlyDictionary<string, string>? metadata,
            CancellationToken ct)
        {
            if (string.IsNullOrWhiteSpace(payerUserId) || string.IsNullOrWhiteSpace(reference)) return;
            try
            {
                string? hint = null;
                if (metadata is not null && metadata.TryGetValue(ReferralCodeKey, out var code))
                    hint = code;

                // Annual charges commission fewer payments. Read the cycle off
                // the subscription this payment settled.
                var isAnnual = false;
                if (subscriptionId is { } sid)
                {
                    var billing = await _db.Set<Subscription>().AsNoTracking()
                        .Where(s => s.Id == sid).Select(s => s.Billing).FirstOrDefaultAsync(ct);
                    isAnnual = string.Equals(billing, "annual", StringComparison.OrdinalIgnoreCase);
                }

                await _affiliates.RecordPaymentAsync(new AffiliatePaymentReceipt
                {
                    PayerUserId = payerUserId,
                    PaymentReference = reference,
                    AmountZar = amountZar,
                    PaidAt = DateTime.UtcNow,
                    SubscriptionId = subscriptionId,
                    PlanCode = planCode,
                    IsAnnual = isAnnual,
                    CardSignature = cardSignature,
                    CardBrand = cardBrand,
                    CardLast4 = cardLast4,
                    ReferralCodeHint = hint,
                }, ct);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Affiliate accrual failed for {Reference}; billing is unaffected.", reference);
            }
        }

        // Next charge date from a billing interval. We own the cadence in Path
        // A, so this is the single source of truth for when a sub renews.
        private static DateTime ComputeNextCharge(DateTime from, string? billing)
            => string.Equals(billing, "annual", StringComparison.OrdinalIgnoreCase)
                ? from.AddYears(1)
                : from.AddMonths(1);

        // Create a Paystack transaction for a subscription and return the
        // hosted-checkout URL the frontend should redirect the buyer to.
        //
        // The buyer must be the owner of the target subscription (or an
        // Admin). The local subscription id is passed through Paystack
        // metadata so the webhook can correlate the charge back to it.
        [HttpPost("initialize")]
        public async Task<ActionResult<FrontendInitTransactionResultDto>> Initialize(
            [FromBody] FrontendInitTransactionDto body, CancellationToken ct)
        {
            var userId = CurrentUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            if (string.IsNullOrWhiteSpace(body.Email))
                return BadRequest("email is required.");
            if (!long.TryParse(body.SubscriptionId, out var subscriptionId))
                return BadRequest("subscriptionId is required.");

            if (!_paystack.IsConfigured)
            {
                _logger.LogError("Paystack initialize called but PAYSTACK_SECRET_KEY is not configured.");
                return StatusCode(StatusCodes.Status503ServiceUnavailable,
                    "Payments are not configured.");
            }

            var subscription = await _db.Set<Subscription>()
                .FirstOrDefaultAsync(s => s.Id == subscriptionId, ct);
            if (subscription is null) return NotFound("Unknown subscription.");

            var isAdmin = User.IsInRole("Admin") || User.IsInRole("Superuser");
            if (!isAdmin && subscription.OwnerUserId != userId)
                return Forbid();

            // Resolve the amount from the plan's monthly price (cents). If a
            // Paystack plan code is supplied we let Paystack drive the amount
            // off the plan, but Paystack still needs a non-zero amount.
            var plan = await _db.Set<Plan>().AsNoTracking()
                .FirstOrDefaultAsync(p => p.Code == subscription.PlanCode, ct);
            if (plan is null) return Problem("Subscription points at an unknown plan.");

            var priceZar = plan.MonthlyPriceZar ?? 0m;
            if (priceZar <= 0m)
                return BadRequest($"Plan '{plan.Code}' has no chargeable monthly price.");

            var amountMinor = (long)decimal.Round(priceZar * 100m, 0, MidpointRounding.AwayFromZero);

            var metadata = new Dictionary<string, string>
            {
                ["subscription_id"] = subscription.Id.ToString(),
                ["plan_code"] = subscription.PlanCode,
                ["initiated_by"] = userId,
            };

            try
            {
                var result = await _paystack.InitializeTransactionAsync(new PaystackInitRequest
                {
                    Email = body.Email.Trim(),
                    AmountMinor = amountMinor,
                    Currency = string.IsNullOrWhiteSpace(body.Currency) ? "ZAR" : body.Currency.Trim(),
                    CallbackUrl = string.IsNullOrWhiteSpace(body.CallbackUrl) ? null : body.CallbackUrl.Trim(),
                    PaystackPlanCode = string.IsNullOrWhiteSpace(body.PaystackPlanCode) ? null : body.PaystackPlanCode.Trim(),
                    Metadata = metadata,
                }, ct);

                return Ok(new FrontendInitTransactionResultDto
                {
                    AuthorizationUrl = result.AuthorizationUrl,
                    AccessCode = result.AccessCode,
                    Reference = result.Reference,
                });
            }
            catch (PaystackException ex)
            {
                _logger.LogWarning(ex, "Paystack initialize failed for subscription {Id}.", subscription.Id);
                return StatusCode(StatusCodes.Status502BadGateway,
                    "Could not start the Paystack transaction.");
            }
        }

        // Self-service checkout used by signup. Creates (or reuses) a
        // pending subscription owned by the CURRENT user for the chosen
        // plan, then returns a Paystack hosted-checkout URL. Unlike
        // /initialize this does not require the subscription to exist
        // first — the buyer is always the authenticated signer-up.
        //
        // The subscription stays "incomplete" until the webhook confirms
        // charge.success, so it grants no entitlements until the money
        // actually lands.
        [HttpPost("checkout")]
        public async Task<ActionResult<CheckoutResultDto>> Checkout(
            [FromBody] CheckoutDto body, CancellationToken ct)
        {
            var userId = CurrentUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            // Fall back to the authenticated user's email if the client didn't
            // supply one (the OAuth checkout-start path relies on this). The JWT
            // carries the email claim — read it mapped or raw.
            var email = string.IsNullOrWhiteSpace(body.Email)
                ? (User.FindFirstValue(ClaimTypes.Email) ?? User.FindFirst("email")?.Value)
                : body.Email;
            if (string.IsNullOrWhiteSpace(email))
                return BadRequest("email is required.");
            if (string.IsNullOrWhiteSpace(body.PlanCode))
                return BadRequest("planCode is required.");

            if (!_paystack.IsConfigured)
            {
                _logger.LogError("Paystack checkout called but PAYSTACK_SECRET_KEY is not configured.");
                return StatusCode(StatusCodes.Status503ServiceUnavailable,
                    "Payments are not configured.");
            }

            var plan = await _db.Set<Plan>().AsNoTracking()
                .FirstOrDefaultAsync(p => p.Code == body.PlanCode, ct);
            if (plan is null) return BadRequest($"Unknown plan '{body.PlanCode}'.");

            var annual = string.Equals(body.Billing, "annual", StringComparison.OrdinalIgnoreCase);
            var priceZar = annual
                ? plan.AnnualPriceZar ?? plan.MonthlyPriceZar ?? 0m
                : plan.MonthlyPriceZar ?? 0m;
            if (priceZar <= 0m)
                return BadRequest($"Plan '{plan.Code}' is not a paid plan; nothing to charge.");

            var result = await StartCheckoutAsync(userId, plan, annual, email, body.CallbackUrl, body.Attribution, ct);
            return result is null
                ? StatusCode(StatusCodes.Status502BadGateway, "Could not start the Paystack transaction.")
                : Ok(result);
        }

        // Creates/reuses an incomplete subscription for the user+plan and
        // starts the Paystack hosted checkout. Returns null on a Paystack
        // error. Shared by first-time checkout and plan upgrades.
        private async Task<CheckoutResultDto?> StartCheckoutAsync(
            string userId, Plan plan, bool annual, string email, string? callbackUrl,
            CheckoutAttributionDto? attribution, CancellationToken ct)
        {
            var priceZar = annual
                ? plan.AnnualPriceZar ?? plan.MonthlyPriceZar ?? 0m
                : plan.MonthlyPriceZar ?? 0m;
            if (priceZar <= 0m) return null;

            // Reuse a still-pending subscription for this user+plan so a
            // page refresh or a retried checkout doesn't spawn duplicates.
            var subscription = await _db.Set<Subscription>()
                .FirstOrDefaultAsync(s => s.OwnerUserId == userId
                    && s.PlanCode == plan.Code
                    && s.Status == "incomplete", ct);
            if (subscription is null)
            {
                subscription = new Subscription
                {
                    PlanCode = plan.Code,
                    OwnerUserId = userId,
                    Status = "incomplete",
                    Billing = annual ? "annual" : "monthly",
                    BillingEmail = email.Trim(),
                };
                _db.Set<Subscription>().Add(subscription);
                _db.Set<SubscriptionMember>().Add(new SubscriptionMember
                {
                    Subscription = subscription,
                    UserId = userId,
                    Role = "owner",
                    InvitedByUserId = userId,
                });
                await _db.SaveChangesAsync(ct);
            }
            else
            {
                // Keep the interval + billing email fresh on a retried checkout.
                subscription.Billing = annual ? "annual" : "monthly";
                subscription.BillingEmail = email.Trim();
                subscription.UpdatedAt = DateTime.UtcNow;
                await _db.SaveChangesAsync(ct);
            }

            var amountMinor = (long)decimal.Round(priceZar * 100m, 0, MidpointRounding.AwayFromZero);
            var metadata = new Dictionary<string, string>
            {
                ["subscription_id"] = subscription.Id.ToString(),
                ["plan_code"] = plan.Code,
                ["initiated_by"] = userId,
                ["billing"] = annual ? "annual" : "monthly",
            };
            AddMarketingMetadata(metadata, attribution);
            AddReferralMetadata(metadata, attribution);

            try
            {
                // Path A: a plain one-off charge with NO Paystack `plan`, so
                // Paystack never creates a subscription object and never emails
                // the customer that off-site "manage your subscription" link.
                // The reusable card token captured from this charge is what the
                // renewal worker uses to bill each cycle (charge_authorization).
                var result = await _paystack.InitializeTransactionAsync(new PaystackInitRequest
                {
                    Email = email.Trim(),
                    AmountMinor = amountMinor,
                    Currency = "ZAR",
                    CallbackUrl = string.IsNullOrWhiteSpace(callbackUrl) ? null : callbackUrl.Trim(),
                    PaystackPlanCode = null,
                    Metadata = metadata,
                }, ct);

                return new CheckoutResultDto
                {
                    AuthorizationUrl = result.AuthorizationUrl,
                    Reference = result.Reference,
                    SubscriptionId = subscription.Id.ToString(),
                };
            }
            catch (PaystackException ex)
            {
                _logger.LogWarning(ex, "Paystack checkout failed for plan {Plan}.", plan.Code);
                return null;
            }
        }

        // Confirm a checkout by its Paystack transaction reference and
        // activate the local subscription. This is the return-from-Paystack
        // path: our server verifies outbound, so it works even when the
        // webhook can't reach the host (e.g. localhost in dev). Idempotent —
        // re-verifying an already active subscription is a no-op.
        [HttpPost("verify")]
        public async Task<IActionResult> Verify([FromBody] VerifyDto body, CancellationToken ct)
        {
            var userId = CurrentUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();
            if (string.IsNullOrWhiteSpace(body.Reference)) return BadRequest("reference is required.");
            if (!_paystack.IsConfigured)
                return StatusCode(StatusCodes.Status503ServiceUnavailable, "Payments are not configured.");

            var info = await _paystack.VerifyTransactionAsync(body.Reference.Trim(), ct);
            if (info is null) return Ok(new { status = "unknown" });
            if (!info.Success) return Ok(new { status = info.Status ?? "pending" });

            // The local id came from init metadata we set — trust it, but
            // confirm the buyer owns the subscription before activating.
            if (info.LocalSubscriptionId is not { } localId)
                return Ok(new { status = "success", note = "no linked subscription" });

            var localSub = await _db.Set<Subscription>()
                .FirstOrDefaultAsync(s => s.Id == localId, ct);
            if (localSub is null) return Ok(new { status = "success", note = "subscription not found" });
            if (localSub.OwnerUserId != userId) return Forbid();

            // Path A: the reusable card token + card summary come straight from
            // the charge (no Paystack subscription to look up). We own the
            // renewal cadence, so the next charge date is computed locally from
            // the billing interval.
            var nextCharge = ComputeNextCharge(DateTime.UtcNow, localSub.Billing);

            var outcome = await _lifecycle.HandleEventAsync(new PaystackWebhookEvent
            {
                Event = "charge.success",
                LocalSubscriptionId = localId,
                CustomerCode = info.CustomerCode,
                CustomerEmail = info.Email,
                NextPaymentDate = nextCharge,
            }, ct);

            // Persist everything the renewal worker + billing page need: the
            // card token, the card summary, the numeric customer id (payment
            // history), the billing email. Clear any pending change.
            if (!string.IsNullOrWhiteSpace(info.AuthorizationCode))
                localSub.PaystackAuthorizationCode = info.AuthorizationCode;
            if (info.CustomerId is { } cid) localSub.PaystackCustomerId = cid;
            if (!string.IsNullOrWhiteSpace(info.CustomerCode)) localSub.PaystackCustomerCode = info.CustomerCode;
            if (!string.IsNullOrWhiteSpace(info.Email)) localSub.BillingEmail = info.Email;
            if (!string.IsNullOrWhiteSpace(info.CardBrand)) localSub.CardBrand = info.CardBrand;
            if (!string.IsNullOrWhiteSpace(info.CardLast4)) localSub.CardLast4 = info.CardLast4;
            if (info.CardExpMonth is { } exm) localSub.CardExpMonth = exm;
            if (info.CardExpYear is { } exy) localSub.CardExpYear = exy;
            localSub.LastChargeAt = DateTime.UtcNow;
            localSub.RenewalFailureCount = 0;
            localSub.PendingPlanCode = null;
            localSub.PendingBilling = null;

            // Supersede every OTHER active subscription this user owns: seeded/
            // gift ones (no Paystack link) and the old paid plan being replaced
            // on an upgrade — disable those on Paystack so they stop charging.
            // Leaves exactly the one they just paid for.
            //
            // Restricted to subscriptions the buyer is themselves a member of,
            // which is what makes a sub "their own plan". Parent coverage subs
            // are owned by the parent but their member is the CHILD, so without
            // this filter a parent buying or upgrading their own plan silently
            // cancelled every covered child's Student Pro on the way past.
            // Every purchase, seed and admin-created sub adds an owner member,
            // so this only ever excludes coverage.
            var others = await _db.Set<Subscription>()
                .Where(s => s.OwnerUserId == userId && s.Id != localId
                    && (s.Status == "active" || s.Status == "past_due")
                    && s.Members.Any(m => m.UserId == userId))
                .ToListAsync(ct);
            foreach (var o in others)
            {
                if (!string.IsNullOrWhiteSpace(o.PaystackSubscriptionCode) && _paystack.IsConfigured)
                {
                    var oi = await _paystack.FetchSubscriptionAsync(o.PaystackSubscriptionCode, ct);
                    if (oi?.EmailToken is { } tok)
                        await _paystack.DisableSubscriptionAsync(o.PaystackSubscriptionCode, tok, ct);
                }
                o.Status = "cancelled";
                o.CancelledAt = DateTime.UtcNow;
                o.UpdatedAt = DateTime.UtcNow;
            }
            await _db.SaveChangesAsync(ct);

            // Our own branded receipt — Paystack's subscription email is gone in
            // Path A, so this is what the customer sees after paying.
            var planName = await _db.Set<Plan>().AsNoTracking()
                .Where(p => p.Code == localSub.PlanCode).Select(p => p.Name)
                .FirstOrDefaultAsync(ct) ?? localSub.PlanCode;
            var paidZar = info.AmountMinor.HasValue ? info.AmountMinor.Value / 100m : 0m;
            await SendBillingEmailAsync(info.Email ?? localSub.BillingEmail,
                "Your Aptiverse payment", "payment_receipt", new
                {
                    PlanName = planName,
                    AmountZar = $"R{paidZar:0.00}",
                    NextChargeDate = nextCharge.ToString("d MMM yyyy"),
                    CardLast4 = info.CardLast4 ?? "",
                    BillingUrl,
                });

            // The subscription is genuinely active and the money genuinely
            // moved. This is the only honest place to say so to an ad platform.
            await ReportPurchaseAsync(
                info.Metadata, info.Email ?? localSub.BillingEmail, paidZar,
                localSub.PlanCode, includeRequestContext: true, ct);

            // Whoever referred this buyer earns 40% of what was just received,
            // for their first three payments. The subscription owner is the
            // person whose card was charged, which is who the referral is
            // bound to.
            await AccrueAffiliateCommissionAsync(
                localSub.OwnerUserId, body.Reference.Trim(), paidZar,
                localSub.Id, localSub.PlanCode,
                info.CardSignature, info.CardBrand, info.CardLast4,
                info.Metadata, ct);

            return Ok(new
            {
                status = outcome.Handled ? "success" : "pending",
                planCode = localSub.PlanCode,
                subscriptionId = outcome.SubscriptionId?.ToString(),
            });
        }

        // Change the current user's plan. Upgrades (to a higher-priced tier)
        // take effect immediately via a fresh checkout — verify then disables
        // the old plan. Downgrades are scheduled for period end: we stop the
        // current plan from renewing and record the pending switch, which a
        // background job executes when the paid-through date arrives.
        [HttpPost("subscription/change")]
        public async Task<IActionResult> ChangePlan([FromBody] ChangePlanDto body, CancellationToken ct)
        {
            var userId = CurrentUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();
            if (string.IsNullOrWhiteSpace(body.TargetPlanCode)) return BadRequest("targetPlanCode is required.");

            var target = await _db.Set<Plan>().AsNoTracking()
                .FirstOrDefaultAsync(p => p.Code == body.TargetPlanCode, ct);
            if (target is null) return BadRequest($"Unknown plan '{body.TargetPlanCode}'.");

            var current = await _db.Set<Subscription>()
                .Where(s => s.OwnerUserId == userId && (s.Status == "active" || s.Status == "past_due"))
                .OrderByDescending(s => s.UpdatedAt)
                .FirstOrDefaultAsync(ct);

            var annual = string.Equals(body.Billing, "annual", StringComparison.OrdinalIgnoreCase);

            // No active paid sub, or the target is priced above the current
            // plan -> immediate upgrade through checkout.
            var currentPlan = current is null ? null : await _db.Set<Plan>().AsNoTracking()
                .FirstOrDefaultAsync(p => p.Code == current.PlanCode, ct);
            var currentPrice = currentPlan?.MonthlyPriceZar ?? 0m;
            var targetPrice = target.MonthlyPriceZar ?? 0m;

            if (current is null || targetPrice > currentPrice)
            {
                if (targetPrice <= 0m)
                    return BadRequest("Nothing to charge for that plan.");
                if (!_paystack.IsConfigured)
                    return StatusCode(StatusCodes.Status503ServiceUnavailable, "Payments are not configured.");
                if (string.IsNullOrWhiteSpace(body.Email))
                    return BadRequest("email is required for an upgrade.");

                // No attribution on a plan change. An existing customer moving
                // tier is not an acquisition, and reporting it as one would
                // teach the ad platform to chase people it already has.
                var result = await StartCheckoutAsync(userId, target, annual, body.Email, body.CallbackUrl, null, ct);
                return result is null
                    ? StatusCode(StatusCodes.Status502BadGateway, "Could not start the Paystack transaction.")
                    : Ok(new { mode = "checkout", authorizationUrl = result.AuthorizationUrl, reference = result.Reference });
            }

            if (targetPrice == currentPrice && string.Equals(target.Code, current.PlanCode, StringComparison.Ordinal))
                return Ok(new { mode = "noop" });

            // Downgrade: schedule for period end. Stop the current plan from
            // renewing (access stays until ValidUntil) and record the switch.
            if (!string.IsNullOrWhiteSpace(current.PaystackSubscriptionCode) && _paystack.IsConfigured)
            {
                var info = await _paystack.FetchSubscriptionAsync(current.PaystackSubscriptionCode, ct);
                if (info?.EmailToken is { } tok)
                    await _paystack.DisableSubscriptionAsync(current.PaystackSubscriptionCode, tok, ct);
            }
            current.PendingPlanCode = target.Code;
            current.PendingBilling = annual ? "annual" : "monthly";
            current.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync(ct);

            return Ok(new
            {
                mode = "scheduled",
                planCode = target.Code,
                effectiveDate = current.ValidUntil,
            });
        }

        // Undo a scheduled downgrade before it takes effect: re-enable the
        // current plan on Paystack so it keeps renewing, and clear the pending
        // switch.
        [HttpPost("subscription/cancel-change")]
        public async Task<IActionResult> CancelChange(CancellationToken ct)
        {
            var userId = CurrentUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var current = await _db.Set<Subscription>()
                .Where(s => s.OwnerUserId == userId && s.PendingPlanCode != null)
                .OrderByDescending(s => s.UpdatedAt)
                .FirstOrDefaultAsync(ct);
            if (current is null) return NotFound("No scheduled change to cancel.");

            if (!string.IsNullOrWhiteSpace(current.PaystackSubscriptionCode) && _paystack.IsConfigured)
            {
                var info = await _paystack.FetchSubscriptionAsync(current.PaystackSubscriptionCode, ct);
                if (info?.EmailToken is { } tok)
                    await _paystack.EnableSubscriptionAsync(current.PaystackSubscriptionCode, tok, ct);
            }
            current.PendingPlanCode = null;
            current.PendingBilling = null;
            current.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync(ct);

            return Ok(new { status = "active", planCode = current.PlanCode });
        }

        // The current user's billing summary: the subscription they own and
        // pay for, enriched with live Paystack detail (next charge, card).
        // If they only belong to someone else's plan (e.g. a child on a
        // parent's Family plan) it says so; otherwise they're on Free.
        [HttpGet("subscription")]
        public async Task<ActionResult<BillingSummaryDto>> GetSubscription(CancellationToken ct)
        {
            var userId = CurrentUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var owned = await _db.Set<Subscription>()
                .Where(s => s.OwnerUserId == userId
                    && (s.Status == "active" || s.Status == "past_due" || s.Status == "cancelled"))
                .OrderByDescending(s => s.Status == "active")
                .ThenByDescending(s => s.UpdatedAt)
                .FirstOrDefaultAsync(ct);

            if (owned is not null)
            {
                var plan = await _db.Set<Plan>().AsNoTracking()
                    .FirstOrDefaultAsync(p => p.Code == owned.PlanCode, ct);

                string? pendingName = null;
                if (!string.IsNullOrWhiteSpace(owned.PendingPlanCode))
                    pendingName = await _db.Set<Plan>().AsNoTracking()
                        .Where(p => p.Code == owned.PendingPlanCode)
                        .Select(p => p.Name)
                        .FirstOrDefaultAsync(ct) ?? owned.PendingPlanCode;

                // Path A: next charge date, card summary and charge amount all
                // live locally now (we own the schedule). Charge amount follows
                // the sub's billing interval.
                var annualSub = string.Equals(owned.Billing, "annual", StringComparison.OrdinalIgnoreCase);
                var chargeAmount = annualSub
                    ? plan?.AnnualPriceZar ?? plan?.MonthlyPriceZar
                    : plan?.MonthlyPriceZar;

                var dto = new BillingSummaryDto
                {
                    HasSubscription = true,
                    IsOwner = true,
                    SubscriptionId = owned.Id.ToString(),
                    PlanCode = owned.PlanCode,
                    PlanName = plan?.Name ?? owned.PlanCode,
                    Status = owned.Status,
                    MonthlyPriceZar = plan?.MonthlyPriceZar,
                    AnnualPriceZar = plan?.AnnualPriceZar,
                    ChargeAmountZar = chargeAmount,
                    MaxMembers = plan?.MaxMembers ?? 1,
                    NextChargeDate = owned.ValidUntil,
                    CancelledAt = owned.CancelledAt,
                    // Self-managed: cancel / change work while active or past due,
                    // no Paystack subscription required.
                    CanManage = owned.Status == "active" || owned.Status == "past_due",
                    CardBrand = owned.CardBrand,
                    CardLast4 = owned.CardLast4,
                    CardExpMonth = owned.CardExpMonth,
                    CardExpYear = owned.CardExpYear,
                    PendingPlanCode = owned.PendingPlanCode,
                    PendingPlanName = pendingName,
                    ChangeEffectiveDate = string.IsNullOrWhiteSpace(owned.PendingPlanCode) ? null : owned.ValidUntil,
                };

                // Legacy subs still linked to a Paystack subscription: prefer
                // its live next-charge / card detail over the local snapshot.
                if (!string.IsNullOrWhiteSpace(owned.PaystackSubscriptionCode) && _paystack.IsConfigured)
                {
                    var info = await _paystack.FetchSubscriptionAsync(owned.PaystackSubscriptionCode, ct);
                    if (info is not null)
                    {
                        dto = dto with
                        {
                            NextChargeDate = info.NextPaymentDate ?? dto.NextChargeDate,
                            ChargeAmountZar = info.AmountMinor.HasValue ? info.AmountMinor.Value / 100m : dto.ChargeAmountZar,
                            CardBrand = info.CardBrand ?? dto.CardBrand,
                            CardLast4 = info.CardLast4 ?? dto.CardLast4,
                            CardExpMonth = info.CardExpMonth ?? dto.CardExpMonth,
                            CardExpYear = info.CardExpYear ?? dto.CardExpYear,
                        };
                    }
                }

                return Ok(dto);
            }

            var membership = await _db.Set<SubscriptionMember>()
                .Where(m => m.UserId == userId && m.Role != "owner")
                .OrderByDescending(m => m.Id)
                .FirstOrDefaultAsync(ct);
            if (membership is not null)
            {
                var sub = await _db.Set<Subscription>().AsNoTracking()
                    .FirstOrDefaultAsync(s => s.Id == membership.SubscriptionId, ct);
                var plan = sub is null ? null : await _db.Set<Plan>().AsNoTracking()
                    .FirstOrDefaultAsync(p => p.Code == sub.PlanCode, ct);
                return Ok(new BillingSummaryDto
                {
                    HasSubscription = true,
                    IsOwner = false,
                    ManagedByOther = true,
                    PlanCode = sub?.PlanCode ?? "",
                    PlanName = plan?.Name ?? sub?.PlanCode ?? "",
                    Status = sub?.Status ?? "active",
                });
            }

            return Ok(new BillingSummaryDto { HasSubscription = false });
        }

        // Cancel the current user's owned subscription. Disables it on
        // Paystack so it stops renewing, then marks it cancelled locally,
        // keeping access until the already-paid-through date (ValidUntil).
        [HttpPost("subscription/cancel")]
        public async Task<IActionResult> CancelSubscription(CancellationToken ct)
        {
            var userId = CurrentUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var sub = await _db.Set<Subscription>()
                .Where(s => s.OwnerUserId == userId && (s.Status == "active" || s.Status == "past_due"))
                .OrderByDescending(s => s.UpdatedAt)
                .FirstOrDefaultAsync(ct);
            if (sub is null) return NotFound("No active subscription to cancel.");

            if (!string.IsNullOrWhiteSpace(sub.PaystackSubscriptionCode) && _paystack.IsConfigured)
            {
                var info = await _paystack.FetchSubscriptionAsync(sub.PaystackSubscriptionCode, ct);
                if (info?.EmailToken is { } token)
                    await _paystack.DisableSubscriptionAsync(sub.PaystackSubscriptionCode, token, ct);
                else
                    _logger.LogWarning(
                        "Cancel: no email_token for subscription {Id}; marked cancelled locally only.", sub.Id);
            }

            sub.Status = "cancelled";
            sub.CancelledAt = DateTime.UtcNow;
            sub.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync(ct);

            var cancelledPlanName = await _db.Set<Plan>().AsNoTracking()
                .Where(p => p.Code == sub.PlanCode).Select(p => p.Name)
                .FirstOrDefaultAsync(ct) ?? sub.PlanCode;
            await SendBillingEmailAsync(sub.BillingEmail,
                "Your Aptiverse subscription is ending", "subscription_cancelled", new
                {
                    PlanName = cancelledPlanName,
                    AccessUntil = (sub.ValidUntil ?? DateTime.UtcNow).ToString("d MMM yyyy"),
                    BillingUrl,
                });

            return Ok(new { status = "cancelled", validUntil = sub.ValidUntil });
        }

        // Payment history (successful charges) for the current user's
        // subscription, read live from Paystack. Empty for free users.
        [HttpGet("transactions")]
        public async Task<ActionResult<IEnumerable<TransactionDto>>> GetTransactions(CancellationToken ct)
        {
            var userId = CurrentUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            // Path A: history is the customer's successful charges, keyed on the
            // numeric customer id we captured at first checkout.
            var sub = await _db.Set<Subscription>()
                .Where(s => s.OwnerUserId == userId && s.PaystackCustomerId != null)
                .OrderByDescending(s => s.UpdatedAt)
                .FirstOrDefaultAsync(ct);
            if (sub?.PaystackCustomerId is not { } customerId || !_paystack.IsConfigured)
                return Ok(Array.Empty<TransactionDto>());

            var txns = await _paystack.ListTransactionsAsync(customerId, 24, ct);
            return Ok(txns.Select(t => new TransactionDto
            {
                Reference = t.Reference,
                AmountZar = t.AmountMinor / 100m,
                Currency = t.Currency,
                Status = t.Status ?? "success",
                PaidAt = t.PaidAt,
            }));
        }

        // Paystack webhook receiver. Anonymous (Paystack can't carry our
        // JWT) but authenticated by the x-paystack-signature HMAC-SHA512 of
        // the RAW body keyed on the secret key. We read the body raw before
        // any model binding so the bytes match what Paystack signed.
        [HttpPost("webhook")]
        [AllowAnonymous]
        public async Task<IActionResult> Webhook(CancellationToken ct)
        {
            string rawBody;
            using (var reader = new StreamReader(Request.Body))
            {
                rawBody = await reader.ReadToEndAsync(ct);
            }

            var signature = Request.Headers["x-paystack-signature"].FirstOrDefault();
            if (!_paystack.VerifySignature(rawBody, signature))
            {
                _logger.LogWarning("Paystack webhook rejected: signature mismatch or not configured.");
                // 401 — do not leak detail; Paystack treats non-2xx as a retry.
                return Unauthorized();
            }

            PaystackWebhookEvent? evt;
            try
            {
                evt = ParseEvent(rawBody);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Paystack webhook: could not parse body.");
                // 200 so Paystack stops retrying an unparseable payload.
                return Ok(new { handled = false, message = "unparseable" });
            }

            if (evt is null)
                return Ok(new { handled = false, message = "no event" });

            var outcome = await _lifecycle.HandleEventAsync(evt, ct);

            // Webhook-side conversion reporting. This is the path that catches
            // the buyer who closed the tab before /welcome could call verify,
            // which on a phone on a slow connection is not a rare case. When
            // both paths fire, Meta collapses them on the shared event_id.
            if (outcome.Handled
                && string.Equals(evt.Event, "charge.success", StringComparison.OrdinalIgnoreCase))
            {
                await ReportPurchaseAsync(
                    evt.Metadata,
                    evt.CustomerEmail,
                    ReadChargeAmountZar(rawBody),
                    MarketingMetadata.Take(evt.Metadata, "plan_code"),
                    includeRequestContext: false,
                    ct);
            }

            // Affiliate accrual on the webhook path.
            //
            // This is deliberately NOT gated on `outcome.Handled`. The
            // lifecycle service reports "handled" for the subscription state
            // machine, and a renewal charge whose subscription is already
            // active can legitimately be a no-op there while still being a
            // real payment somebody is owed commission on. What money did is
            // a separate question from what the state machine did.
            //
            // This is also the only path that fires when the buyer closes the
            // tab before /welcome can call verify, which on a phone on a slow
            // connection is not a rare case at all. A hook on verify alone
            // would silently miss real conversions in production.
            if (string.Equals(evt.Event, "charge.success", StringComparison.OrdinalIgnoreCase))
            {
                var reference = ReadStringProperty(rawBody, "reference");
                var subscriptionId = evt.LocalSubscriptionId
                    ?? outcome.SubscriptionId;
                if (!string.IsNullOrWhiteSpace(reference) && subscriptionId is { } subId)
                {
                    var ownerUserId = await _db.Set<Subscription>().AsNoTracking()
                        .Where(s => s.Id == subId)
                        .Select(s => s.OwnerUserId)
                        .FirstOrDefaultAsync(ct);
                    if (!string.IsNullOrWhiteSpace(ownerUserId))
                    {
                        await AccrueAffiliateCommissionAsync(
                            ownerUserId!, reference!, ReadChargeAmountZar(rawBody),
                            subId, MarketingMetadata.Take(evt.Metadata, "plan_code"),
                            ReadAuthorizationSignature(rawBody), null, null,
                            evt.Metadata, ct);
                    }
                }
            }

            // Clawback. A refund or a chargeback means the money did not stay
            // received, so the commission it produced does not stay earned.
            // The 30-day hold exists precisely so that most of these land
            // before anything has been paid out; the ones that do not are
            // recorded as a negative balance against the next payout rather
            // than chased as cash.
            if (IsMoneyReturnedEvent(evt.Event))
            {
                var refunded = ReadRefundedReference(rawBody);
                if (!string.IsNullOrWhiteSpace(refunded))
                {
                    try
                    {
                        await _affiliates.ReverseForPaymentAsync(
                            refunded!, $"Paystack {evt.Event}", "system", ct);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex,
                            "Affiliate clawback failed for {Reference} on {Event}.", refunded, evt.Event);
                    }
                }
            }

            return Ok(new
            {
                handled = outcome.Handled,
                message = outcome.Message,
                subscriptionId = outcome.SubscriptionId?.ToString(),
                status = outcome.NewStatus,
            });
        }

        // What was actually charged, in rand. Paystack bills in minor units, so
        // a purchase value reported straight off data.amount would be a hundred
        // times too large and would poison every return-on-ad-spend number the
        // ad platform computes. Zero when absent, which Meta accepts.
        private static decimal ReadChargeAmountZar(string rawBody)
        {
            try
            {
                using var doc = JsonDocument.Parse(rawBody);
                if (doc.RootElement.TryGetProperty("data", out var d)
                    && d.ValueKind == JsonValueKind.Object
                    && d.TryGetProperty("amount", out var amt)
                    && amt.ValueKind == JsonValueKind.Number)
                {
                    return amt.GetInt64() / 100m;
                }
            }
            catch
            {
                /* the caller already parsed this body once; never fail here */
            }
            return 0m;
        }

        // A flat string off `data`, e.g. the transaction reference.
        private static string? ReadStringProperty(string rawBody, string property)
        {
            try
            {
                using var doc = JsonDocument.Parse(rawBody);
                if (doc.RootElement.TryGetProperty("data", out var d)
                    && d.ValueKind == JsonValueKind.Object
                    && d.TryGetProperty(property, out var v)
                    && v.ValueKind == JsonValueKind.String)
                {
                    return v.GetString();
                }
            }
            catch
            {
                /* the caller already parsed this body once; never fail here */
            }
            return null;
        }

        // The card fingerprint off `data.authorization.signature`. Used only
        // as a self-referral signal, and hashed before it is stored.
        private static string? ReadAuthorizationSignature(string rawBody)
        {
            try
            {
                using var doc = JsonDocument.Parse(rawBody);
                if (doc.RootElement.TryGetProperty("data", out var d)
                    && d.ValueKind == JsonValueKind.Object
                    && d.TryGetProperty("authorization", out var au)
                    && au.ValueKind == JsonValueKind.Object
                    && au.TryGetProperty("signature", out var sig)
                    && sig.ValueKind == JsonValueKind.String)
                {
                    return sig.GetString();
                }
            }
            catch
            {
                /* never fail here */
            }
            return null;
        }

        // Paystack events that mean money went back to the customer.
        private static bool IsMoneyReturnedEvent(string? eventName)
            => eventName is not null
            && (eventName.Equals("refund.processed", StringComparison.OrdinalIgnoreCase)
             || eventName.Equals("charge.dispute.create", StringComparison.OrdinalIgnoreCase)
             || eventName.Equals("charge.dispute.resolve", StringComparison.OrdinalIgnoreCase));

        // Refund and dispute payloads nest the original transaction, so the
        // reference is one level down rather than at the root of `data`.
        private static string? ReadRefundedReference(string rawBody)
        {
            try
            {
                using var doc = JsonDocument.Parse(rawBody);
                if (!doc.RootElement.TryGetProperty("data", out var d)
                    || d.ValueKind != JsonValueKind.Object) return null;

                if (d.TryGetProperty("transaction", out var txn)
                    && txn.ValueKind == JsonValueKind.Object
                    && txn.TryGetProperty("reference", out var tr)
                    && tr.ValueKind == JsonValueKind.String)
                {
                    return tr.GetString();
                }

                if (d.TryGetProperty("transaction_reference", out var tref)
                    && tref.ValueKind == JsonValueKind.String)
                {
                    return tref.GetString();
                }

                if (d.TryGetProperty("reference", out var r)
                    && r.ValueKind == JsonValueKind.String)
                {
                    return r.GetString();
                }
            }
            catch
            {
                /* never fail here */
            }
            return null;
        }

        // Maps Paystack's webhook envelope onto the Application-layer event.
        // Handles both charge.* and subscription.* data shapes.
        private static PaystackWebhookEvent? ParseEvent(string rawBody)
        {
            using var doc = JsonDocument.Parse(rawBody);
            var root = doc.RootElement;

            if (!root.TryGetProperty("event", out var eventEl))
                return null;
            var eventName = eventEl.GetString();
            if (string.IsNullOrWhiteSpace(eventName))
                return null;

            string? subCode = null;
            string? cusCode = null;
            string? email = null;
            long? localId = null;
            DateTime? nextPayment = null;
            var metadata = new Dictionary<string, string>(StringComparer.Ordinal);

            if (root.TryGetProperty("data", out var data) && data.ValueKind == JsonValueKind.Object)
            {
                // subscription.* events carry subscription_code at data root;
                // charge.success may carry it nested under data.subscription.
                if (data.TryGetProperty("subscription_code", out var sc))
                    subCode = sc.GetString();
                else if (data.TryGetProperty("subscription", out var subObj)
                         && subObj.ValueKind == JsonValueKind.Object
                         && subObj.TryGetProperty("subscription_code", out var sc2))
                    subCode = sc2.GetString();

                if (data.TryGetProperty("customer", out var customer)
                    && customer.ValueKind == JsonValueKind.Object)
                {
                    if (customer.TryGetProperty("customer_code", out var cc))
                        cusCode = cc.GetString();
                    if (customer.TryGetProperty("email", out var em))
                        email = em.GetString();
                }

                if (data.TryGetProperty("next_payment_date", out var npd)
                    && npd.ValueKind == JsonValueKind.String
                    && DateTime.TryParse(npd.GetString(), out var parsedNext))
                    nextPayment = parsedNext.ToUniversalTime();

                // Our correlation id from init metadata.
                if (data.TryGetProperty("metadata", out var meta)
                    && meta.ValueKind == JsonValueKind.Object)
                {
                    if (meta.TryGetProperty("subscription_id", out var sid))
                    {
                        var sidStr = sid.ValueKind == JsonValueKind.String
                            ? sid.GetString()
                            : sid.ValueKind == JsonValueKind.Number ? sid.GetRawText() : null;
                        if (long.TryParse(sidStr, out var parsedId))
                            localId = parsedId;
                    }

                    // Everything else, flat scalars only, so the marketing
                    // attribution bundle survives to the caller.
                    foreach (var prop in meta.EnumerateObject())
                    {
                        var value = prop.Value.ValueKind switch
                        {
                            JsonValueKind.String => prop.Value.GetString(),
                            JsonValueKind.Number => prop.Value.GetRawText(),
                            JsonValueKind.True => "true",
                            JsonValueKind.False => "false",
                            _ => null,
                        };
                        if (!string.IsNullOrEmpty(value)) metadata[prop.Name] = value;
                    }
                }
            }

            return new PaystackWebhookEvent
            {
                Event = eventName,
                SubscriptionCode = subCode,
                CustomerCode = cusCode,
                CustomerEmail = email,
                LocalSubscriptionId = localId,
                NextPaymentDate = nextPayment,
                Metadata = metadata,
            };
        }
    }

    public record FrontendInitTransactionDto
    {
        [JsonPropertyName("subscriptionId")] public string SubscriptionId { get; init; } = "";
        [JsonPropertyName("email")] public string Email { get; init; } = "";
        [JsonPropertyName("currency")] public string? Currency { get; init; }
        [JsonPropertyName("callbackUrl")] public string? CallbackUrl { get; init; }
        // Optional Paystack-side plan code (PLN_xxx) to start a recurring
        // subscription rather than a one-off charge.
        [JsonPropertyName("paystackPlanCode")] public string? PaystackPlanCode { get; init; }
    }

    public record FrontendInitTransactionResultDto
    {
        [JsonPropertyName("authorizationUrl")] public string AuthorizationUrl { get; init; } = "";
        [JsonPropertyName("accessCode")] public string AccessCode { get; init; } = "";
        [JsonPropertyName("reference")] public string Reference { get; init; } = "";
    }

    // Body for the self-service signup checkout.
    public record CheckoutDto
    {
        [JsonPropertyName("planCode")] public string PlanCode { get; init; } = "";
        [JsonPropertyName("email")] public string Email { get; init; } = "";
        // "monthly" (default) or "annual".
        [JsonPropertyName("billing")] public string? Billing { get; init; }
        [JsonPropertyName("callbackUrl")] public string? CallbackUrl { get; init; }
        // Which advert, if any, produced this checkout. Optional: a checkout
        // with no attribution is a perfectly normal checkout.
        [JsonPropertyName("attribution")] public CheckoutAttributionDto? Attribution { get; init; }
    }

    // Marketing attribution as the browser assembled it. Passed straight into
    // Paystack transaction metadata and read back when the payment confirms,
    // so a purchase can be reported to the ad platform from the server without
    // a new column, a new table or a migration.
    //
    // MarketingConsent is the load-bearing field. When it is false the browser
    // sends nothing else, and the server sends nothing to anyone.
    public record CheckoutAttributionDto
    {
        [JsonPropertyName("marketingConsent")] public bool MarketingConsent { get; init; }
        [JsonPropertyName("eventId")] public string? EventId { get; init; }
        [JsonPropertyName("fbp")] public string? Fbp { get; init; }
        [JsonPropertyName("fbc")] public string? Fbc { get; init; }
        [JsonPropertyName("utmSource")] public string? UtmSource { get; init; }
        [JsonPropertyName("utmMedium")] public string? UtmMedium { get; init; }
        [JsonPropertyName("utmCampaign")] public string? UtmCampaign { get; init; }
        [JsonPropertyName("utmContent")] public string? UtmContent { get; init; }
        // The affiliate referral code this buyer arrived on, if any. Travels
        // regardless of the marketing-consent flag above, because it is a
        // commercial term rather than ad measurement: somebody is owed a commission on
        // this payment and silently dropping the code would mean not paying
        // them.
        [JsonPropertyName("referralCode")] public string? ReferralCode { get; init; }
    }

    public record CheckoutResultDto
    {
        [JsonPropertyName("authorizationUrl")] public string AuthorizationUrl { get; init; } = "";
        [JsonPropertyName("reference")] public string Reference { get; init; } = "";
        [JsonPropertyName("subscriptionId")] public string SubscriptionId { get; init; } = "";
    }

    // Body for the return-from-Paystack verification.
    public record VerifyDto
    {
        [JsonPropertyName("reference")] public string Reference { get; init; } = "";
    }

    // Body for a plan change. Email + callbackUrl are only needed when the
    // change is an upgrade (which routes through a fresh checkout).
    public record ChangePlanDto
    {
        [JsonPropertyName("targetPlanCode")] public string TargetPlanCode { get; init; } = "";
        [JsonPropertyName("billing")] public string? Billing { get; init; }
        [JsonPropertyName("email")] public string? Email { get; init; }
        [JsonPropertyName("callbackUrl")] public string? CallbackUrl { get; init; }
    }

    // The signed-in user's billing state for the dashboard billing pages.
    public record BillingSummaryDto
    {
        [JsonPropertyName("hasSubscription")] public bool HasSubscription { get; init; }
        [JsonPropertyName("isOwner")] public bool IsOwner { get; init; }
        // True when the user only belongs to someone else's plan (a child
        // on a parent's Family plan) — read-only from their side.
        [JsonPropertyName("managedByOther")] public bool ManagedByOther { get; init; }
        [JsonPropertyName("subscriptionId")] public string? SubscriptionId { get; init; }
        [JsonPropertyName("planCode")] public string PlanCode { get; init; } = "";
        [JsonPropertyName("planName")] public string PlanName { get; init; } = "";
        // active | past_due | cancelled | (empty for free)
        [JsonPropertyName("status")] public string Status { get; init; } = "";
        [JsonPropertyName("monthlyPriceZar")] public decimal? MonthlyPriceZar { get; init; }
        [JsonPropertyName("annualPriceZar")] public decimal? AnnualPriceZar { get; init; }
        // What Paystack actually charges each cycle (monthly or annual).
        [JsonPropertyName("chargeAmountZar")] public decimal? ChargeAmountZar { get; init; }
        [JsonPropertyName("maxMembers")] public int MaxMembers { get; init; }
        [JsonPropertyName("nextChargeDate")] public DateTime? NextChargeDate { get; init; }
        [JsonPropertyName("cancelledAt")] public DateTime? CancelledAt { get; init; }
        // True once linked to Paystack, i.e. cancel/manage actions are live.
        [JsonPropertyName("canManage")] public bool CanManage { get; init; }
        [JsonPropertyName("cardBrand")] public string? CardBrand { get; init; }
        [JsonPropertyName("cardLast4")] public string? CardLast4 { get; init; }
        [JsonPropertyName("cardExpMonth")] public int? CardExpMonth { get; init; }
        [JsonPropertyName("cardExpYear")] public int? CardExpYear { get; init; }
        // A scheduled downgrade: switches to this plan on ChangeEffectiveDate.
        [JsonPropertyName("pendingPlanCode")] public string? PendingPlanCode { get; init; }
        [JsonPropertyName("pendingPlanName")] public string? PendingPlanName { get; init; }
        [JsonPropertyName("changeEffectiveDate")] public DateTime? ChangeEffectiveDate { get; init; }
    }

    public record TransactionDto
    {
        [JsonPropertyName("reference")] public string Reference { get; init; } = "";
        [JsonPropertyName("amountZar")] public decimal AmountZar { get; init; }
        [JsonPropertyName("currency")] public string Currency { get; init; } = "ZAR";
        [JsonPropertyName("status")] public string Status { get; init; } = "";
        [JsonPropertyName("paidAt")] public DateTime? PaidAt { get; init; }
    }
}
