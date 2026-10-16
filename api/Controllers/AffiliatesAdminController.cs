using System.Globalization;
using System.Security.Claims;
using System.Text;
using Aptiverse.Affiliates.Application;
using Aptiverse.Affiliates.Application.Frontend.Dtos;
using Aptiverse.Affiliates.Application.Services;
using Aptiverse.Affiliates.Domain.Models;
using Aptiverse.Api.Data;
using Aptiverse.Domain.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Affiliates.Controllers
{
    // Running the programme: review payout onboarding, review flagged
    // referrals, see everything owed, and generate the monthly payout list.
    //
    // Nothing here moves money and nothing here ever will. The payout run
    // produces a list; the founder pays it from his own banking app and comes
    // back with the reference he used.
    [ApiController]
    [Route("api/affiliates/admin")]
    [Authorize(Roles = "Admin,Superuser")]
    public class AffiliatesAdminController(
        ApplicationDbContext db,
        IAffiliateService affiliates,
        IAffiliateLedger ledger,
        ILogger<AffiliatesAdminController> logger) : ControllerBase
    {
        private string ActorUserId()
            => User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirst("sub")?.Value
            ?? "admin";

        // The number he looks at first: what does the programme owe, and can
        // it actually be paid.
        [HttpGet("summary")]
        public async Task<ActionResult<AdminProgrammeSummaryDto>> GetSummary(CancellationToken ct)
        {
            var entries = await db.Set<CommissionEntry>().AsNoTracking()
                .Select(e => new { e.AffiliateId, e.Status, e.AmountZar })
                .ToListAsync(ct);

            var payableByAffiliate = entries
                .Where(e => e.Status == CommissionStatus.Payable)
                .GroupBy(e => e.AffiliateId)
                .ToDictionary(g => g.Key, g => g.Sum(e => e.AmountZar));

            var unpayable = await db.Set<Affiliate>().AsNoTracking()
                .Where(a => a.PayoutOnboardingStatus != PayoutOnboardingStatus.Approved)
                .Select(a => a.Id)
                .ToListAsync(ct);

            var referralStatuses = await db.Set<Referral>().AsNoTracking()
                .Select(r => new { r.Status, r.AffiliateId })
                .ToListAsync(ct);

            var drafts = await db.Set<AffiliatePayout>().AsNoTracking()
                .Where(p => p.Status == PayoutStatus.Draft)
                .Select(p => p.TotalZar)
                .ToListAsync(ct);

            decimal SumStatus(CommissionStatus s)
                => AffiliateProgramme.ToCents(entries.Where(e => e.Status == s).Sum(e => e.AmountZar));

            return Ok(new AdminProgrammeSummaryDto
            {
                AffiliateCount = await db.Set<Affiliate>().CountAsync(ct),
                ActiveReferrerCount = referralStatuses.Select(r => r.AffiliateId).Distinct().Count(),
                ReferralCount = referralStatuses.Count,
                PayingReferralCount = referralStatuses.Count(r =>
                    r.Status is ReferralStatus.Earning or ReferralStatus.Completed),
                AwaitingReview = await db.Set<Affiliate>()
                    .CountAsync(a => a.PayoutOnboardingStatus == PayoutOnboardingStatus.Submitted, ct),
                FlaggedReferrals = referralStatuses.Count(r => r.Status == ReferralStatus.Flagged),
                PendingZar = SumStatus(CommissionStatus.Pending),
                OnHoldZar = SumStatus(CommissionStatus.Held),
                PayableZar = SumStatus(CommissionStatus.Payable),
                BlockedOnDetailsZar = AffiliateProgramme.ToCents(
                    payableByAffiliate.Where(kv => unpayable.Contains(kv.Key)).Sum(kv => kv.Value)),
                PaidZar = SumStatus(CommissionStatus.Paid),
                DraftPayoutCount = drafts.Count,
                DraftPayoutZar = AffiliateProgramme.ToCents(drafts.Sum()),
            });
        }

        // Affiliates, filterable by where they are in payout onboarding.
        // `status=submitted` is the review queue.
        [HttpGet]
        public async Task<ActionResult<IEnumerable<AdminAffiliateDto>>> ListAffiliates(
            [FromQuery] string? status, [FromQuery] string? search, CancellationToken ct)
        {
            var query = db.Set<Affiliate>().AsNoTracking().AsQueryable();

            if (!string.IsNullOrWhiteSpace(status) && status != "all")
            {
                var wanted = ParseOnboarding(status);
                if (wanted is null) return BadRequest($"Unknown status '{status}'.");
                query = query.Where(a => a.PayoutOnboardingStatus == wanted);
            }

            if (!string.IsNullOrWhiteSpace(search))
            {
                var term = search.Trim().ToUpperInvariant();
                query = query.Where(a => a.ReferralCode.Contains(term));
            }

            var list = await query
                .OrderByDescending(a => a.DetailsSubmittedAt ?? a.CreatedAt)
                .Take(500)
                .ToListAsync(ct);

            return Ok(await EnrichAsync(list, includeDetails: false, ct));
        }

        [HttpGet("{id:long}")]
        public async Task<ActionResult<AdminAffiliateDto>> GetAffiliate(long id, CancellationToken ct)
        {
            var affiliate = await db.Set<Affiliate>().AsNoTracking()
                .FirstOrDefaultAsync(a => a.Id == id, ct);
            if (affiliate is null) return NotFound();

            var enriched = await EnrichAsync([affiliate], includeDetails: true, ct);
            return Ok(enriched[0]);
        }

        [HttpPost("{id:long}/approve")]
        public async Task<IActionResult> Approve(long id, [FromBody] ReviewDto body, CancellationToken ct)
        {
            var affiliate = await db.Set<Affiliate>().FirstOrDefaultAsync(a => a.Id == id, ct);
            if (affiliate is null) return NotFound();
            if (!affiliate.HasPayoutDetails())
                return BadRequest("This affiliate has not supplied complete payout details yet.");

            affiliate.PayoutOnboardingStatus = PayoutOnboardingStatus.Approved;
            affiliate.ReviewedAt = DateTime.UtcNow;
            affiliate.ReviewedByUserId = ActorUserId();
            affiliate.ReviewNotes = body.Notes;
            affiliate.UpdatedAt = DateTime.UtcNow;
            await db.SaveChangesAsync(ct);

            logger.LogInformation("Affiliate {Id} approved for payout by {Actor}.", id, ActorUserId());
            return Ok(new { status = "approved" });
        }

        [HttpPost("{id:long}/reject")]
        public async Task<IActionResult> Reject(long id, [FromBody] ReviewDto body, CancellationToken ct)
        {
            var affiliate = await db.Set<Affiliate>().FirstOrDefaultAsync(a => a.Id == id, ct);
            if (affiliate is null) return NotFound();

            affiliate.PayoutOnboardingStatus = PayoutOnboardingStatus.Rejected;
            affiliate.ReviewedAt = DateTime.UtcNow;
            affiliate.ReviewedByUserId = ActorUserId();
            affiliate.ReviewNotes = body.Notes;
            affiliate.UpdatedAt = DateTime.UtcNow;
            await db.SaveChangesAsync(ct);

            // Earnings are untouched. Rejecting the banking detail does not
            // erase what somebody earned; it stops it being paid until the
            // detail is right.
            return Ok(new { status = "rejected" });
        }

        [HttpPost("{id:long}/suspend")]
        public async Task<IActionResult> Suspend(long id, [FromBody] ReviewDto body, CancellationToken ct)
        {
            var affiliate = await db.Set<Affiliate>().FirstOrDefaultAsync(a => a.Id == id, ct);
            if (affiliate is null) return NotFound();

            affiliate.Status = AffiliateStatus.Suspended;
            affiliate.ReviewNotes = body.Notes;
            affiliate.UpdatedAt = DateTime.UtcNow;
            await db.SaveChangesAsync(ct);
            return Ok(new { status = "suspended" });
        }

        [HttpPost("{id:long}/reinstate")]
        public async Task<IActionResult> Reinstate(long id, CancellationToken ct)
        {
            var affiliate = await db.Set<Affiliate>().FirstOrDefaultAsync(a => a.Id == id, ct);
            if (affiliate is null) return NotFound();

            affiliate.Status = AffiliateStatus.Active;
            affiliate.UpdatedAt = DateTime.UtcNow;
            await db.SaveChangesAsync(ct);
            return Ok(new { status = "active" });
        }

        // ---- Flagged referrals ---------------------------------------------

        [HttpGet("referrals/flagged")]
        public async Task<ActionResult<IEnumerable<AdminFlaggedReferralDto>>> ListFlagged(
            CancellationToken ct)
        {
            var referrals = await db.Set<Referral>().AsNoTracking()
                .Where(r => r.Status == ReferralStatus.Flagged || r.Status == ReferralStatus.Blocked)
                .OrderByDescending(r => r.UpdatedAt)
                .Take(200)
                .ToListAsync(ct);
            if (referrals.Count == 0) return Ok(Array.Empty<AdminFlaggedReferralDto>());

            var affiliateIds = referrals.Select(r => r.AffiliateId).Distinct().ToList();
            var referralIds = referrals.Select(r => r.Id).ToList();

            var affiliateRows = await db.Set<Affiliate>().AsNoTracking()
                .Where(a => affiliateIds.Contains(a.Id))
                .ToDictionaryAsync(a => a.Id, ct);

            var userIds = affiliateRows.Values.Select(a => a.UserId)
                .Concat(referrals.Select(r => r.ReferredUserId)).Distinct().ToList();
            var users = await db.Set<User>().AsNoTracking()
                .Where(u => userIds.Contains(u.Id))
                .Select(u => new { u.Id, u.FirstName, u.LastName, u.Email })
                .ToDictionaryAsync(u => u.Id, ct);

            var signals = await db.Set<ReferralFraudSignal>().AsNoTracking()
                .Where(s => s.ReferralId != null && referralIds.Contains(s.ReferralId!.Value))
                .ToListAsync(ct);

            var parked = await db.Set<CommissionEntry>().AsNoTracking()
                .Where(e => referralIds.Contains(e.ReferralId) && e.Status == CommissionStatus.Pending)
                .Select(e => new { e.ReferralId, e.AmountZar })
                .ToListAsync(ct);

            return Ok(referrals.Select(r =>
            {
                var affiliate = affiliateRows.GetValueOrDefault(r.AffiliateId);
                users.TryGetValue(affiliate?.UserId ?? "", out var affiliateUser);
                users.TryGetValue(r.ReferredUserId, out var referredUser);
                return new AdminFlaggedReferralDto
                {
                    Id = r.Id.ToString(CultureInfo.InvariantCulture),
                    AffiliateId = r.AffiliateId.ToString(CultureInfo.InvariantCulture),
                    AffiliateName = affiliateUser is null
                        ? "" : $"{affiliateUser.FirstName} {affiliateUser.LastName}".Trim(),
                    AffiliateCode = affiliate?.ReferralCode ?? r.CodeUsed,
                    ReferredName = referredUser is null
                        ? "" : $"{referredUser.FirstName} {referredUser.LastName}".Trim(),
                    ReferredEmail = referredUser?.Email,
                    Status = AffiliatesController.ToSnake(r.Status.ToString()),
                    FlagReason = r.FlagReason,
                    SignedUpAt = r.SignedUpAt,
                    ParkedZar = AffiliateProgramme.ToCents(
                        parked.Where(p => p.ReferralId == r.Id).Sum(p => p.AmountZar)),
                    Signals = signals.Where(s => s.ReferralId == r.Id)
                        .Select(s => new AdminFraudSignalDto
                        {
                            SignalType = s.SignalType,
                            Severity = AffiliatesController.ToSnake(s.Severity.ToString()),
                            Detail = s.Detail,
                            OccurredAt = s.OccurredAt,
                        }).ToList(),
                };
            }).ToList());
        }

        // Cleared on review. The parked commission starts its 30-day hold from
        // the payment date it came from, not from today, so a slow review does
        // not cost the affiliate a month.
        [HttpPost("referrals/{id:long}/clear")]
        public async Task<IActionResult> ClearReferral(
            long id, [FromBody] ReviewDto body, CancellationToken ct)
        {
            var referral = await db.Set<Referral>().FirstOrDefaultAsync(r => r.Id == id, ct);
            if (referral is null) return NotFound();

            var now = DateTime.UtcNow;
            referral.Status = referral.FirstPaymentAt is null
                ? ReferralStatus.Signed
                : ReferralStatus.Earning;
            referral.FlagReason = null;
            referral.ReviewedAt = now;
            referral.ReviewedByUserId = ActorUserId();
            referral.ReviewNotes = body.Notes;
            referral.UpdatedAt = now;

            var parked = await db.Set<CommissionEntry>()
                .Where(e => e.ReferralId == id && e.Status == CommissionStatus.Pending)
                .ToListAsync(ct);
            foreach (var entry in parked)
            {
                entry.Status = CommissionStatus.Held;
                entry.HoldUntil = entry.OccurredAt.AddDays(AffiliateProgramme.HoldDays);
                entry.UpdatedAt = now;
                db.Set<CommissionEntryEvent>().Add(new CommissionEntryEvent
                {
                    CommissionEntryId = entry.Id,
                    FromStatus = CommissionStatus.Pending,
                    ToStatus = CommissionStatus.Held,
                    Reason = $"Referral cleared on review. {body.Notes}".Trim(),
                    ActorUserId = ActorUserId(),
                    OccurredAt = now,
                });
            }

            await db.SaveChangesAsync(ct);
            return Ok(new { status = "cleared", released = parked.Count });
        }

        // Blocked on review. Everything parked against it is reversed with a
        // reason rather than deleted, because the ledger is append-only.
        [HttpPost("referrals/{id:long}/block")]
        public async Task<IActionResult> BlockReferral(
            long id, [FromBody] ReviewDto body, CancellationToken ct)
        {
            var referral = await db.Set<Referral>().FirstOrDefaultAsync(r => r.Id == id, ct);
            if (referral is null) return NotFound();

            var now = DateTime.UtcNow;
            var reason = string.IsNullOrWhiteSpace(body.Notes)
                ? "Referral blocked on review."
                : body.Notes!.Trim();

            referral.Status = ReferralStatus.Blocked;
            referral.ReviewedAt = now;
            referral.ReviewedByUserId = ActorUserId();
            referral.ReviewNotes = reason;
            referral.UpdatedAt = now;
            await db.SaveChangesAsync(ct);

            var references = await db.Set<CommissionEntry>().AsNoTracking()
                .Where(e => e.ReferralId == id
                         && e.EntryType == CommissionEntryType.Accrual
                         && e.Status != CommissionStatus.Reversed)
                .Select(e => e.SourcePaymentReference)
                .Distinct()
                .ToListAsync(ct);

            var reversed = 0;
            foreach (var reference in references)
            {
                reversed += await ledger.ReverseForPaymentAsync(reference, reason, ActorUserId(), ct);
            }

            return Ok(new { status = "blocked", reversed });
        }

        // ---- Payouts --------------------------------------------------------

        // Build the list the founder acts on. Creates Draft payouts and moves
        // no money.
        [HttpPost("payouts/generate")]
        public async Task<ActionResult<PayoutRunResult>> GenerateRun(
            [FromBody] GeneratePayoutRunDto body, CancellationToken ct)
        {
            // Release anything whose hold matured but whose worker tick has
            // not landed yet, so a run started at 09:00 on the first of the
            // month is not missing yesterday's maturities.
            await affiliates.ReleaseMaturedHoldsAsync(ct);

            var periodEnd = body.PeriodEnd ?? DateTime.UtcNow;
            var minimum = body.MinimumZar ?? 0m;
            var result = await affiliates.GeneratePayoutRunAsync(periodEnd, minimum, ActorUserId(), ct);
            return Ok(result);
        }

        [HttpGet("payouts")]
        public async Task<ActionResult<IEnumerable<AdminPayoutLineDto>>> ListPayouts(
            [FromQuery] string? status, [FromQuery] string? runReference, CancellationToken ct)
        {
            var query = db.Set<AffiliatePayout>().AsNoTracking().AsQueryable();

            if (!string.IsNullOrWhiteSpace(status) && status != "all")
            {
                var wanted = ParsePayoutStatus(status);
                if (wanted is null) return BadRequest($"Unknown status '{status}'.");
                query = query.Where(p => p.Status == wanted);
            }
            if (!string.IsNullOrWhiteSpace(runReference))
                query = query.Where(p => p.RunReference == runReference);

            var payouts = await query
                .OrderByDescending(p => p.CreatedAt)
                .Take(500)
                .ToListAsync(ct);

            var codes = await db.Set<Affiliate>().AsNoTracking()
                .Where(a => payouts.Select(p => p.AffiliateId).Contains(a.Id))
                .ToDictionaryAsync(a => a.Id, a => a.ReferralCode, ct);

            return Ok(payouts.Select(p => ToLine(p, codes)).ToList());
        }

        // The list as a CSV, for the founder to work through in his banking
        // app or hand to a bookkeeper.
        [HttpGet("payouts/export")]
        public async Task<IActionResult> ExportPayouts(
            [FromQuery] string? runReference, [FromQuery] string? status, CancellationToken ct)
        {
            var query = db.Set<AffiliatePayout>().AsNoTracking().AsQueryable();
            if (!string.IsNullOrWhiteSpace(runReference))
                query = query.Where(p => p.RunReference == runReference);
            var wanted = ParsePayoutStatus(status ?? "draft");
            if (wanted is not null) query = query.Where(p => p.Status == wanted);

            var payouts = await query.OrderBy(p => p.Id).ToListAsync(ct);
            var codes = await db.Set<Affiliate>().AsNoTracking()
                .Where(a => payouts.Select(p => p.AffiliateId).Contains(a.Id))
                .ToDictionaryAsync(a => a.Id, a => a.ReferralCode, ct);

            var sb = new StringBuilder();
            sb.AppendLine("Payout ID,Run,Affiliate code,Payee name,Bank,Account holder,Account number,Branch code,Account type,Amount ZAR,Entries,Period start,Period end,Suggested reference,Status,Payment reference,Paid at");
            foreach (var p in payouts)
            {
                var line = ToLine(p, codes);
                sb.AppendLine(string.Join(",",
                    line.Id,
                    Csv(line.RunReference),
                    Csv(line.AffiliateCode),
                    Csv(line.PayeeName),
                    Csv(line.BankName ?? ""),
                    Csv(line.AccountHolderName ?? ""),
                    Csv(line.AccountNumber ?? ""),
                    Csv(line.BranchCode ?? ""),
                    Csv(line.AccountType ?? ""),
                    line.AmountZar.ToString("0.00", CultureInfo.InvariantCulture),
                    line.EntryCount.ToString(CultureInfo.InvariantCulture),
                    line.PeriodStart.ToString("yyyy-MM-dd"),
                    line.PeriodEnd.ToString("yyyy-MM-dd"),
                    Csv(line.SuggestedReference),
                    line.Status,
                    Csv(line.PaymentReference ?? ""),
                    line.PaidAt?.ToString("yyyy-MM-dd") ?? ""));
            }

            var name = string.IsNullOrWhiteSpace(runReference) ? "payouts" : runReference;
            return File(Encoding.UTF8.GetBytes(sb.ToString()), "text/csv",
                $"aptiverse-affiliate-{name}.csv");
        }

        // Which commission entries a payout settles. Read before paying, and
        // read again years later when a bank statement line needs explaining.
        [HttpGet("payouts/{id:long}/entries")]
        public async Task<ActionResult<IEnumerable<FrontendCommissionEntryDto>>> GetPayoutEntries(
            long id, CancellationToken ct)
        {
            var payout = await db.Set<AffiliatePayout>().AsNoTracking()
                .FirstOrDefaultAsync(p => p.Id == id, ct);
            if (payout is null) return NotFound();

            var itemIds = await db.Set<AffiliatePayoutItem>().AsNoTracking()
                .Where(i => i.PayoutId == id)
                .Select(i => i.CommissionEntryId)
                .ToListAsync(ct);

            var entries = await db.Set<CommissionEntry>().AsNoTracking()
                .Where(e => itemIds.Contains(e.Id))
                .OrderBy(e => e.OccurredAt)
                .ToListAsync(ct);

            var references = new Dictionary<long, string?> { [payout.Id] = payout.PaymentReference };
            return Ok(entries.Select(e => AffiliatesController.ToDto(e, references)).ToList());
        }

        // He has paid it. The reference is what his bank statement will show,
        // and it is what makes this row reconcilable.
        [HttpPost("payouts/{id:long}/mark-paid")]
        public async Task<IActionResult> MarkPaid(
            long id, [FromBody] MarkPayoutPaidDto body, CancellationToken ct)
        {
            if (string.IsNullOrWhiteSpace(body.PaymentReference))
                return BadRequest("A payment reference is required. Use the reference you typed into your banking app.");

            var payout = await affiliates.MarkPayoutPaidAsync(
                id, body.PaymentReference, body.PaidAt ?? DateTime.UtcNow, body.Notes, ActorUserId(), ct);
            if (payout is null) return NotFound("No draft payout with that id.");

            logger.LogInformation(
                "Payout {Id} marked paid by {Actor} with reference {Reference}.",
                id, ActorUserId(), payout.PaymentReference);

            return Ok(new
            {
                status = "paid",
                paymentReference = payout.PaymentReference,
                paidAt = payout.PaidAt,
                entryCount = payout.EntryCount,
            });
        }

        [HttpPost("payouts/{id:long}/cancel")]
        public async Task<IActionResult> CancelPayout(
            long id, [FromBody] ReviewDto body, CancellationToken ct)
        {
            var reason = string.IsNullOrWhiteSpace(body.Notes) ? "Cancelled before payment." : body.Notes!;
            var payout = await affiliates.CancelPayoutAsync(id, reason, ActorUserId(), ct);
            if (payout is null) return NotFound("No draft payout with that id.");
            return Ok(new { status = "cancelled" });
        }

        // ---- Ledger ---------------------------------------------------------

        [HttpGet("commissions")]
        public async Task<ActionResult<IEnumerable<FrontendCommissionEntryDto>>> ListCommissions(
            [FromQuery] long? affiliateId, [FromQuery] string? status, CancellationToken ct)
        {
            var query = db.Set<CommissionEntry>().AsNoTracking().AsQueryable();
            if (affiliateId is { } aid) query = query.Where(e => e.AffiliateId == aid);
            if (!string.IsNullOrWhiteSpace(status) && status != "all")
            {
                var wanted = ParseCommissionStatus(status);
                if (wanted is null) return BadRequest($"Unknown status '{status}'.");
                query = query.Where(e => e.Status == wanted);
            }

            var entries = await query.OrderByDescending(e => e.OccurredAt).Take(500).ToListAsync(ct);
            var payoutIds = entries.Where(e => e.PayoutId is not null)
                .Select(e => e.PayoutId!.Value).Distinct().ToList();
            var references = await db.Set<AffiliatePayout>().AsNoTracking()
                .Where(p => payoutIds.Contains(p.Id))
                .ToDictionaryAsync(p => p.Id, p => p.PaymentReference, ct);

            return Ok(entries.Select(e => AffiliatesController.ToDto(e, references)).ToList());
        }

        // Manual clawback, for a refund that came back through a channel the
        // webhook did not cover. Writes an offsetting entry with a reason;
        // never edits or deletes the original.
        [HttpPost("commissions/{id:long}/reverse")]
        public async Task<IActionResult> ReverseCommission(
            long id, [FromBody] ReverseCommissionDto body, CancellationToken ct)
        {
            if (string.IsNullOrWhiteSpace(body.Reason))
                return BadRequest("A reason is required. A correction with no stated reason is worth very little later.");

            var entry = await db.Set<CommissionEntry>().AsNoTracking()
                .FirstOrDefaultAsync(e => e.Id == id, ct);
            if (entry is null) return NotFound();

            var count = await ledger.ReverseForPaymentAsync(
                entry.SourcePaymentReference, body.Reason.Trim(), ActorUserId(), ct);
            return Ok(new { reversed = count });
        }

        // ---- helpers ---------------------------------------------------------

        private async Task<IList<AdminAffiliateDto>> EnrichAsync(
            IList<Affiliate> list, bool includeDetails, CancellationToken ct)
        {
            var ids = list.Select(a => a.Id).ToList();
            var userIds = list.Select(a => a.UserId).ToList();

            var users = await db.Set<User>().AsNoTracking()
                .Where(u => userIds.Contains(u.Id))
                .Select(u => new { u.Id, u.FirstName, u.LastName, u.Email })
                .ToDictionaryAsync(u => u.Id, ct);

            var referralCounts = (await db.Set<Referral>().AsNoTracking()
                .Where(r => ids.Contains(r.AffiliateId))
                .Select(r => r.AffiliateId)
                .ToListAsync(ct))
                .GroupBy(x => x)
                .ToDictionary(g => g.Key, g => g.Count());

            var entries = await db.Set<CommissionEntry>().AsNoTracking()
                .Where(e => ids.Contains(e.AffiliateId))
                .Select(e => new { e.AffiliateId, e.Status, e.AmountZar })
                .ToListAsync(ct);

            decimal Sum(long affiliateId, CommissionStatus status)
                => AffiliateProgramme.ToCents(entries
                    .Where(e => e.AffiliateId == affiliateId && e.Status == status)
                    .Sum(e => e.AmountZar));

            return list.Select(a =>
            {
                users.TryGetValue(a.UserId, out var user);
                return new AdminAffiliateDto
                {
                    Id = a.Id.ToString(CultureInfo.InvariantCulture),
                    UserId = a.UserId,
                    DisplayName = user is null ? "" : $"{user.FirstName} {user.LastName}".Trim(),
                    Email = user?.Email,
                    ReferralCode = a.ReferralCode,
                    Status = AffiliatesController.ToSnake(a.Status.ToString()),
                    Audience = a.Audience,
                    PayoutOnboardingStatus = AffiliatesController.ToSnake(a.PayoutOnboardingStatus.ToString()),
                    HasPayoutDetails = a.HasPayoutDetails(),
                    DetailsSubmittedAt = a.DetailsSubmittedAt,
                    ReferralCount = referralCounts.GetValueOrDefault(a.Id),
                    PayableZar = Sum(a.Id, CommissionStatus.Payable),
                    OnHoldZar = Sum(a.Id, CommissionStatus.Held),
                    PendingZar = Sum(a.Id, CommissionStatus.Pending),
                    PaidZar = Sum(a.Id, CommissionStatus.Paid),
                    PayoutDetails = includeDetails
                        ? new AdminPayoutDetailsDto
                        {
                            LegalName = $"{a.LegalFirstName} {a.LegalLastName}".Trim(),
                            IdType = a.IdType,
                            IdNumber = a.IdNumber,
                            TaxReferenceNumber = a.TaxReferenceNumber,
                            Address = string.Join(", ", new[]
                            {
                                a.AddressLine1, a.AddressLine2, a.City, a.Province, a.PostalCode, a.Country,
                            }.Where(s => !string.IsNullOrWhiteSpace(s))),
                            BankName = a.BankName,
                            AccountHolderName = a.AccountHolderName,
                            AccountNumber = a.AccountNumber,
                            BranchCode = a.BranchCode,
                            AccountType = a.AccountType,
                            ContactEmail = a.ContactEmail,
                            ContactPhone = a.ContactPhone,
                        }
                        : null,
                };
            }).ToList();
        }

        private static AdminPayoutLineDto ToLine(
            AffiliatePayout p, IReadOnlyDictionary<long, string> codes)
        {
            var code = codes.GetValueOrDefault(p.AffiliateId, "");
            return new AdminPayoutLineDto
            {
                Id = p.Id.ToString(CultureInfo.InvariantCulture),
                RunReference = p.RunReference,
                AffiliateId = p.AffiliateId.ToString(CultureInfo.InvariantCulture),
                AffiliateCode = code,
                PayeeName = p.PayeeName ?? "",
                BankName = p.BankName,
                AccountHolderName = p.AccountHolderName,
                AccountNumber = p.AccountNumber,
                BranchCode = p.BranchCode,
                AccountType = p.AccountType,
                AmountZar = p.TotalZar,
                EntryCount = p.EntryCount,
                PeriodStart = p.PeriodStart,
                PeriodEnd = p.PeriodEnd,
                Status = AffiliatesController.ToSnake(p.Status.ToString()),
                PaymentReference = p.PaymentReference,
                PaidAt = p.PaidAt,
                // Short enough for a bank reference field, and unambiguous:
                // the code identifies who, the payout id identifies which.
                SuggestedReference = $"APTV{code}-{p.Id}",
            };
        }

        private static string Csv(string value) => AffiliatesController.Csv(value);

        private static PayoutOnboardingStatus? ParseOnboarding(string value) => value.ToLowerInvariant() switch
        {
            "not_started" => PayoutOnboardingStatus.NotStarted,
            "submitted" => PayoutOnboardingStatus.Submitted,
            "approved" => PayoutOnboardingStatus.Approved,
            "rejected" => PayoutOnboardingStatus.Rejected,
            _ => null,
        };

        private static PayoutStatus? ParsePayoutStatus(string value) => value.ToLowerInvariant() switch
        {
            "draft" => PayoutStatus.Draft,
            "paid" => PayoutStatus.Paid,
            "cancelled" => PayoutStatus.Cancelled,
            _ => null,
        };

        private static CommissionStatus? ParseCommissionStatus(string value) => value.ToLowerInvariant() switch
        {
            "pending" => CommissionStatus.Pending,
            "held" => CommissionStatus.Held,
            "payable" => CommissionStatus.Payable,
            "paid" => CommissionStatus.Paid,
            "reversed" => CommissionStatus.Reversed,
            _ => null,
        };
    }
}
