using System.Security.Claims;
using System.Text.Json.Serialization;
using Aptiverse.Api.Services.Audit;
using Aptiverse.Audit.Domain.Models.Audit;
using Aptiverse.Entitlements.Infrastructure.Paystack;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Aptiverse.Api.Controllers
{
    // The Paystack cockpit. Everything an operator would otherwise sign in to
    // the Paystack dashboard to see or do: the balance, the transactions, the
    // settlements that actually reached the bank, a customer's history, and the
    // two write actions that matter (refund a payment, pause or resume a
    // subscription).
    //
    // Separate from AdminController on purpose. This one depends on the Paystack
    // client and speaks to an external service on every call, so its failure
    // modes (Paystack down, rate limited, misconfigured key) are different from
    // the local reads next door, and keeping them apart means a Paystack outage
    // cannot take the rest of the back office with it.
    //
    // Reads are Admin or Superuser. Refunds move real money and are gated to
    // Superuser. Every write is recorded to the audit trail.
    [ApiController]
    [Route("api/admin/paystack")]
    [Authorize(Roles = "Admin,Superuser")]
    public class AdminPaystackController(
        IPaystackClient paystack,
        IAuditTrail audit,
        ILogger<AdminPaystackController> logger) : ControllerBase
    {
        private readonly IPaystackClient _paystack = paystack;
        private readonly IAuditTrail _audit = audit;
        private readonly ILogger<AdminPaystackController> _logger = logger;

        private bool IsSuperuser() => User.IsInRole("Superuser");
        private string? CurrentUserId()
            => User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirst("sub")?.Value;

        // Whether the cockpit can show anything at all. The frontend reads this
        // first so a missing key renders as "connect Paystack" rather than as a
        // page full of failed requests.
        [HttpGet("status")]
        public ActionResult<PaystackStatusDto> GetStatus()
            => Ok(new PaystackStatusDto { Configured = _paystack.IsConfigured });

        // ---- Reads ---------------------------------------------------------

        [HttpGet("balance")]
        public async Task<ActionResult<IEnumerable<PaystackBalanceDto>>> GetBalance(CancellationToken ct)
        {
            if (!_paystack.IsConfigured) return NotConfigured();
            var balances = await _paystack.GetBalanceAsync(ct);
            return Ok(balances.Select(b => new PaystackBalanceDto
            {
                Currency = b.Currency,
                Available = ToMajor(b.AvailableMinor),
                Pending = ToMajor(b.PendingMinor),
            }));
        }

        [HttpGet("transactions")]
        public async Task<ActionResult<PaystackTransactionPageDto>> GetTransactions(
            [FromQuery] int page = 1,
            [FromQuery] int perPage = 50,
            [FromQuery] string? status = null,
            [FromQuery] DateTime? from = null,
            [FromQuery] DateTime? to = null,
            CancellationToken ct = default)
        {
            if (!_paystack.IsConfigured) return NotConfigured();
            var result = await _paystack.ListRecentTransactionsAsync(page, perPage, status, from, to, ct);
            return Ok(new PaystackTransactionPageDto
            {
                Rows = result.Rows.Select(ToTxnDto).ToList(),
                Page = result.Page,
                PageCount = result.PageCount,
                Total = result.Total,
            });
        }

        [HttpGet("settlements")]
        public async Task<ActionResult<PaystackSettlementPageDto>> GetSettlements(
            [FromQuery] int page = 1, [FromQuery] int perPage = 50, CancellationToken ct = default)
        {
            if (!_paystack.IsConfigured) return NotConfigured();
            var result = await _paystack.ListSettlementsAsync(page, perPage, ct);
            return Ok(new PaystackSettlementPageDto
            {
                Rows = result.Rows.Select(s => new PaystackSettlementDto
                {
                    Id = s.Id,
                    Amount = ToMajor(s.AmountMinor),
                    Currency = s.Currency,
                    Status = s.Status,
                    SettledAt = s.SettledAt,
                    BankName = s.BankName,
                    AccountLast4 = s.AccountLast4,
                }).ToList(),
                Page = result.Page,
                PageCount = result.PageCount,
                Total = result.Total,
            });
        }

        [HttpGet("customer")]
        public async Task<ActionResult<PaystackCustomerDto>> GetCustomer(
            [FromQuery] string query, CancellationToken ct)
        {
            if (!_paystack.IsConfigured) return NotConfigured();
            if (string.IsNullOrWhiteSpace(query))
                return BadRequest(new { message = "Provide an email or customer code." });

            var c = await _paystack.FetchCustomerAsync(query, ct);
            if (c is null) return NotFound(new { message = "Paystack has no customer for that." });

            return Ok(new PaystackCustomerDto
            {
                CustomerCode = c.CustomerCode,
                Email = c.Email,
                FirstName = c.FirstName,
                LastName = c.LastName,
                Transactions = c.Transactions.Select(ToTxnDto).ToList(),
            });
        }

        // ---- Writes --------------------------------------------------------

        // Refund a transaction. Money leaves the account and does not come back.
        // Gated on the payments.refund permission, which the model grants to
        // Admin and Superuser both; gating it tighter here than the permission
        // model states would show the button and then reject the click. The
        // real friction is the frontend confirmation of amount and recipient
        // plus this audit line, not a narrower role. Every call is recorded
        // whether or not Paystack accepted it.
        [HttpPost("refund")]
        [Authorize(Roles = "Admin,Superuser")]
        public async Task<ActionResult<PaystackRefundDto>> Refund(
            [FromBody] RefundInput body, CancellationToken ct)
        {
            if (!_paystack.IsConfigured) return NotConfigured();
            if (string.IsNullOrWhiteSpace(body?.Reference))
                return BadRequest(new { message = "A transaction reference is required." });

            long? amountMinor = body.Amount is > 0 ? (long)Math.Round(body.Amount.Value * 100m) : null;

            var result = await _paystack.RefundTransactionAsync(body.Reference, amountMinor, ct);

            // Audited whether it succeeded or not: a rejected refund attempt on
            // someone's payment is exactly the kind of thing the trail exists to
            // show. Warning severity because it moves money.
            await _audit.RecordAsync(new AuditEntry
            {
                Action = result.Success ? "Paystack.Refund" : "Paystack.RefundRejected",
                Category = "Payments",
                Severity = AuditSeverity.Warning,
                EntityType = "PaystackTransaction",
                EntityId = body.Reference,
                NewValues = new
                {
                    requestedAmount = body.Amount,
                    refundedAmount = ToMajor(result.RefundedAmountMinor),
                    status = result.Status,
                    error = result.Error,
                },
            }, ct);

            if (!result.Success)
            {
                _logger.LogWarning("Refund rejected for {Reference}: {Error}", body.Reference, result.Error);
                return UnprocessableEntity(new { message = result.Error ?? "Paystack rejected the refund." });
            }

            return Ok(new PaystackRefundDto
            {
                Status = result.Status,
                RefundedAmount = ToMajor(result.RefundedAmountMinor),
                Currency = result.Currency,
            });
        }

        // Pause or resume a Paystack-managed subscription. Reversible and no
        // money moves, so Admin may do it, but it changes whether a customer is
        // billed and is therefore audited.
        [HttpPost("subscription/{code}/{action}")]
        public async Task<IActionResult> SetSubscriptionState(
            string code, string action, CancellationToken ct)
        {
            if (!_paystack.IsConfigured) return NotConfigured();

            var enable = action.Equals("enable", StringComparison.OrdinalIgnoreCase);
            var disable = action.Equals("disable", StringComparison.OrdinalIgnoreCase);
            if (!enable && !disable)
                return BadRequest(new { message = "Action must be enable or disable." });

            // Paystack needs the current email_token to toggle a subscription;
            // fetch it rather than trusting the caller to supply one.
            var sub = await _paystack.FetchSubscriptionAsync(code, ct);
            if (sub is null || string.IsNullOrWhiteSpace(sub.EmailToken))
                return NotFound(new { message = "No such Paystack subscription, or it has no active token." });

            var ok = enable
                ? await _paystack.EnableSubscriptionAsync(code, sub.EmailToken, ct)
                : await _paystack.DisableSubscriptionAsync(code, sub.EmailToken, ct);

            await _audit.RecordAsync(new AuditEntry
            {
                Action = enable ? "Paystack.SubscriptionEnabled" : "Paystack.SubscriptionDisabled",
                Category = "Payments",
                Severity = AuditSeverity.Info,
                EntityType = "PaystackSubscription",
                EntityId = code,
                OldValues = new { status = sub.Status },
                NewValues = new { requested = enable ? "enable" : "disable", accepted = ok },
            }, ct);

            if (!ok) return UnprocessableEntity(new { message = "Paystack did not accept the change." });
            return NoContent();
        }

        // ---- helpers -------------------------------------------------------

        private ActionResult NotConfigured() =>
            StatusCode(StatusCodes.Status503ServiceUnavailable,
                new { message = "Paystack is not configured on this environment." });

        // Minor units (cents) to major (rand), as a decimal for display. The
        // API surface speaks rand; only the Paystack client speaks cents.
        private static decimal ToMajor(long minor) => minor / 100m;

        private static PaystackTransactionDto ToTxnDto(PaystackTransactionRow t) => new()
        {
            Reference = t.Reference,
            Amount = ToMajor(t.AmountMinor),
            Currency = t.Currency,
            Status = t.Status,
            PaidAt = t.PaidAt,
            CustomerEmail = t.CustomerEmail,
            Channel = t.Channel,
            Card = t.CardBrand is null && t.CardLast4 is null
                ? null
                : $"{t.CardBrand} ···· {t.CardLast4}".Trim(),
            // Only a settled card payment can be refunded from the cockpit.
            Refundable = string.Equals(t.Status, "success", StringComparison.OrdinalIgnoreCase),
        };

        // ---- DTOs ----------------------------------------------------------

        public record PaystackStatusDto
        {
            [JsonPropertyName("configured")] public bool Configured { get; init; }
        }

        public record PaystackBalanceDto
        {
            [JsonPropertyName("currency")] public required string Currency { get; init; }
            [JsonPropertyName("available")] public decimal Available { get; init; }
            [JsonPropertyName("pending")] public decimal Pending { get; init; }
        }

        public record PaystackTransactionDto
        {
            [JsonPropertyName("reference")] public required string Reference { get; init; }
            [JsonPropertyName("amount")] public decimal Amount { get; init; }
            [JsonPropertyName("currency")] public string Currency { get; init; } = "ZAR";
            [JsonPropertyName("status")] public string? Status { get; init; }
            [JsonPropertyName("paidAt")] public DateTime? PaidAt { get; init; }
            [JsonPropertyName("customerEmail")] public string? CustomerEmail { get; init; }
            [JsonPropertyName("channel")] public string? Channel { get; init; }
            [JsonPropertyName("card")] public string? Card { get; init; }
            [JsonPropertyName("refundable")] public bool Refundable { get; init; }
        }

        public record PaystackTransactionPageDto
        {
            [JsonPropertyName("rows")] public IReadOnlyList<PaystackTransactionDto> Rows { get; init; } = [];
            [JsonPropertyName("page")] public int Page { get; init; }
            [JsonPropertyName("pageCount")] public int PageCount { get; init; }
            [JsonPropertyName("total")] public int Total { get; init; }
        }

        public record PaystackSettlementDto
        {
            [JsonPropertyName("id")] public long Id { get; init; }
            [JsonPropertyName("amount")] public decimal Amount { get; init; }
            [JsonPropertyName("currency")] public string Currency { get; init; } = "ZAR";
            [JsonPropertyName("status")] public string? Status { get; init; }
            [JsonPropertyName("settledAt")] public DateTime? SettledAt { get; init; }
            [JsonPropertyName("bankName")] public string? BankName { get; init; }
            [JsonPropertyName("accountLast4")] public string? AccountLast4 { get; init; }
        }

        public record PaystackSettlementPageDto
        {
            [JsonPropertyName("rows")] public IReadOnlyList<PaystackSettlementDto> Rows { get; init; } = [];
            [JsonPropertyName("page")] public int Page { get; init; }
            [JsonPropertyName("pageCount")] public int PageCount { get; init; }
            [JsonPropertyName("total")] public int Total { get; init; }
        }

        public record PaystackCustomerDto
        {
            [JsonPropertyName("customerCode")] public required string CustomerCode { get; init; }
            [JsonPropertyName("email")] public string? Email { get; init; }
            [JsonPropertyName("firstName")] public string? FirstName { get; init; }
            [JsonPropertyName("lastName")] public string? LastName { get; init; }
            [JsonPropertyName("transactions")] public IReadOnlyList<PaystackTransactionDto> Transactions { get; init; } = [];
        }

        public record PaystackRefundDto
        {
            [JsonPropertyName("status")] public string? Status { get; init; }
            [JsonPropertyName("refundedAmount")] public decimal RefundedAmount { get; init; }
            [JsonPropertyName("currency")] public string? Currency { get; init; }
        }

        public record RefundInput
        {
            [JsonPropertyName("reference")] public string? Reference { get; init; }
            // In rand. Null or 0 means a full refund. The controller converts to
            // minor units before it reaches Paystack.
            [JsonPropertyName("amount")] public decimal? Amount { get; init; }
        }
    }
}
