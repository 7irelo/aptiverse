using System.Security.Claims;
using System.Text.Json;
using System.Text.Json.Serialization;
using Aptiverse.Api.Data;
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
        ILogger<PaymentsController> logger) : ControllerBase
    {
        private readonly ApplicationDbContext _db = db;
        private readonly IPaystackClient _paystack = paystack;
        private readonly IPaystackSubscriptionService _lifecycle = lifecycle;
        private readonly ILogger<PaymentsController> _logger = logger;

        private string? CurrentUserId()
            => User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirst("sub")?.Value
            ?? User.FindFirst("userId")?.Value;

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
}
