using System.Security.Claims;
using System.Text.Json;
using System.Text.Json.Serialization;
using Aptiverse.Api.Data;
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
        ILogger<PaymentsController> logger) : ControllerBase
    {
        private readonly ApplicationDbContext _db = db;
        private readonly IPaystackClient _paystack = paystack;
        private readonly IPaystackSubscriptionService _lifecycle = lifecycle;
        private readonly IEmailSender _email = email;
        private readonly ILogger<PaymentsController> _logger = logger;

        // Where billing emails send people to manage their plan (matches the
        // hardcoded frontend origin the auth emails already use).
        private const string BillingUrl = "https://aptiverse.co.za/dashboard/billing";

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

            var result = await StartCheckoutAsync(userId, plan, annual, email, body.CallbackUrl, ct);
            return result is null
                ? StatusCode(StatusCodes.Status502BadGateway, "Could not start the Paystack transaction.")
                : Ok(result);
        }

        // Creates/reuses an incomplete subscription for the user+plan and
        // starts the Paystack hosted checkout. Returns null on a Paystack
        // error. Shared by first-time checkout and plan upgrades.
        private async Task<CheckoutResultDto?> StartCheckoutAsync(
            string userId, Plan plan, bool annual, string email, string? callbackUrl, CancellationToken ct)
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
            var others = await _db.Set<Subscription>()
                .Where(s => s.OwnerUserId == userId && s.Id != localId
                    && (s.Status == "active" || s.Status == "past_due"))
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

                var result = await StartCheckoutAsync(userId, target, annual, body.Email, body.CallbackUrl, ct);
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
            return Ok(new
            {
                handled = outcome.Handled,
                message = outcome.Message,
                subscriptionId = outcome.SubscriptionId?.ToString(),
                status = outcome.NewStatus,
            });
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
                    && meta.ValueKind == JsonValueKind.Object
                    && meta.TryGetProperty("subscription_id", out var sid))
                {
                    var sidStr = sid.ValueKind == JsonValueKind.String
                        ? sid.GetString()
                        : sid.ValueKind == JsonValueKind.Number ? sid.GetRawText() : null;
                    if (long.TryParse(sidStr, out var parsedId))
                        localId = parsedId;
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
