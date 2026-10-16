using System.Globalization;
using System.Security.Claims;
using System.Text;
using Aptiverse.Affiliates.Application;
using Aptiverse.Affiliates.Application.Frontend.Dtos;
using Aptiverse.Affiliates.Application.Services;
using Aptiverse.Affiliates.Domain.Models;
using Aptiverse.Api.Data;
using Aptiverse.Api.Utilities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Affiliates.Controllers
{
    // The affiliate's own view of the referral programme.
    //
    // Everything here is scoped to the signed-in user. An affiliate can see
    // their code, who signed up on it, what they have earned and what has been
    // paid; they can never see another affiliate's anything, and they never
    // see the name or email of a person they referred.
    [ApiController]
    [Route("api/affiliates")]
    [Authorize]
    public class AffiliatesController(
        ApplicationDbContext db,
        IAffiliateService affiliates,
        ILogger<AffiliatesController> logger) : ControllerBase
    {
        private string? CurrentUserId()
            => User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirst("sub")?.Value
            ?? User.FindFirst("userId")?.Value;

        private static string ShareUrlFor(string code) => WebApp.Url($"/?ref={code}");

        // The dashboard header. Everything a person needs to answer "how much
        // have I made" without reading a table.
        [HttpGet("me")]
        public async Task<ActionResult<FrontendAffiliateSummaryDto>> GetMe(CancellationToken ct)
        {
            var userId = CurrentUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            // Mint on read. Every account has a code; this is simply where the
            // ones created before the programme existed, or through OAuth, get
            // theirs the first time they look.
            var affiliate = await affiliates.EnsureAffiliateAsync(userId, ct: ct);

            var referrals = await db.Set<Referral>().AsNoTracking()
                .Where(r => r.AffiliateId == affiliate.Id)
                .Select(r => r.Status)
                .ToListAsync(ct);

            var entries = await db.Set<CommissionEntry>().AsNoTracking()
                .Where(e => e.AffiliateId == affiliate.Id)
                .Select(e => new { e.Status, e.AmountZar, e.EntryType, e.HoldUntil })
                .ToListAsync(ct);

            decimal SumOf(CommissionStatus status)
                => AffiliateProgramme.ToCents(
                    entries.Where(e => e.Status == status).Sum(e => e.AmountZar));

            var payable = SumOf(CommissionStatus.Payable);
            var paid = SumOf(CommissionStatus.Paid);
            var held = SumOf(CommissionStatus.Held);
            var pending = SumOf(CommissionStatus.Pending);

            // Lifetime earned is what survived: accruals net of the reversals
            // that cancelled them. A reversed accrual and its reversal cancel
            // to zero, which is exactly right.
            var lifetime = AffiliateProgramme.ToCents(
                entries.Where(e => e.Status != CommissionStatus.Pending).Sum(e => e.AmountZar));

            var reversed = AffiliateProgramme.ToCents(
                entries.Where(e => e.EntryType == CommissionEntryType.Reversal).Sum(e => e.AmountZar));

            var nextRelease = entries
                .Where(e => e.Status == CommissionStatus.Held && e.HoldUntil is not null)
                .Select(e => e.HoldUntil!.Value)
                .DefaultIfEmpty()
                .Min();

            var hasDetails = affiliate.HasPayoutDetails();

            return Ok(new FrontendAffiliateSummaryDto
            {
                ReferralCode = affiliate.ReferralCode,
                ShareUrl = ShareUrlFor(affiliate.ReferralCode),
                Status = affiliate.Status.ToString().ToLowerInvariant(),
                Audience = affiliate.Audience,
                PayoutOnboardingStatus = ToSnake(affiliate.PayoutOnboardingStatus.ToString()),
                HasPayoutDetails = hasDetails,
                NeedsPayoutDetails = (payable + held + pending) > 0m
                    && affiliate.PayoutOnboardingStatus != PayoutOnboardingStatus.Approved,
                ReviewNotes = affiliate.ReviewNotes,

                CommissionRatePercent = AffiliateProgramme.CommissionRate * 100m,
                CommissionablePayments = AffiliateProgramme.CommissionablePayments,
                HoldDays = AffiliateProgramme.HoldDays,
                AttributionIsLifetime = AffiliateProgramme.AttributionWindow is null,

                ReferralsTotal = referrals.Count,
                ReferralsSignedUp = referrals.Count(s => s == ReferralStatus.Signed),
                ReferralsEarning = referrals.Count(s => s == ReferralStatus.Earning),
                ReferralsCompleted = referrals.Count(s => s == ReferralStatus.Completed),
                ReferralsFlagged = referrals.Count(s => s == ReferralStatus.Flagged),

                LifetimeEarnedZar = lifetime,
                PendingZar = pending,
                OnHoldZar = held,
                PayableZar = payable,
                PaidZar = paid,
                ReversedZar = reversed,
                CarriedBalanceZar = payable < 0m ? payable : 0m,
                NextHoldReleaseAt = nextRelease == default ? null : nextRelease,
            });
        }

        [HttpGet("me/referrals")]
        public async Task<ActionResult<IEnumerable<FrontendReferralDto>>> GetMyReferrals(CancellationToken ct)
        {
            var userId = CurrentUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();
            var affiliate = await affiliates.EnsureAffiliateAsync(userId, ct: ct);

            var referrals = await db.Set<Referral>().AsNoTracking()
                .Where(r => r.AffiliateId == affiliate.Id)
                .OrderByDescending(r => r.SignedUpAt)
                .ToListAsync(ct);

            var ids = referrals.Select(r => r.Id).ToList();
            var entries = await db.Set<CommissionEntry>().AsNoTracking()
                .Where(e => ids.Contains(e.ReferralId))
                .Select(e => new { e.ReferralId, e.AmountZar, e.EntryType, e.Status, e.SourcePlanCode })
                .ToListAsync(ct);

            return Ok(referrals.Select(r =>
            {
                var mine = entries.Where(e => e.ReferralId == r.Id).ToList();
                var live = mine.Count(e => e.EntryType == CommissionEntryType.Accrual
                                        && e.Status != CommissionStatus.Reversed);
                return new FrontendReferralDto
                {
                    Id = r.Id.ToString(CultureInfo.InvariantCulture),
                    Status = ToSnake(r.Status.ToString()),
                    SignedUpAt = r.SignedUpAt,
                    FirstPaymentAt = r.FirstPaymentAt,
                    PaymentsCommissioned = live,
                    PaymentsRemaining = Math.Max(0, AffiliateProgramme.CommissionablePayments - live),
                    EarnedZar = AffiliateProgramme.ToCents(
                        mine.Where(e => e.Status != CommissionStatus.Pending).Sum(e => e.AmountZar)),
                    PlanCode = mine.Select(e => e.SourcePlanCode).FirstOrDefault(p => p is not null),
                };
            }).ToList());
        }

        [HttpGet("me/commissions")]
        public async Task<ActionResult<IEnumerable<FrontendCommissionEntryDto>>> GetMyCommissions(
            CancellationToken ct)
        {
            var userId = CurrentUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();
            var affiliate = await affiliates.EnsureAffiliateAsync(userId, ct: ct);

            var entries = await db.Set<CommissionEntry>().AsNoTracking()
                .Where(e => e.AffiliateId == affiliate.Id)
                .OrderByDescending(e => e.OccurredAt)
                .Take(500)
                .ToListAsync(ct);

            var payoutIds = entries.Where(e => e.PayoutId is not null)
                .Select(e => e.PayoutId!.Value).Distinct().ToList();
            var references = await db.Set<AffiliatePayout>().AsNoTracking()
                .Where(p => payoutIds.Contains(p.Id))
                .ToDictionaryAsync(p => p.Id, p => p.PaymentReference, ct);

            return Ok(entries.Select(e => ToDto(e, references)).ToList());
        }

        [HttpGet("me/payouts")]
        public async Task<ActionResult<IEnumerable<FrontendPayoutDto>>> GetMyPayouts(CancellationToken ct)
        {
            var userId = CurrentUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();
            var affiliate = await affiliates.EnsureAffiliateAsync(userId, ct: ct);

            var payouts = await db.Set<AffiliatePayout>().AsNoTracking()
                .Where(p => p.AffiliateId == affiliate.Id && p.Status != PayoutStatus.Cancelled)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync(ct);

            return Ok(payouts.Select(p => new FrontendPayoutDto
            {
                Id = p.Id.ToString(CultureInfo.InvariantCulture),
                RunReference = p.RunReference,
                PeriodStart = p.PeriodStart,
                PeriodEnd = p.PeriodEnd,
                TotalZar = p.TotalZar,
                EntryCount = p.EntryCount,
                Status = ToSnake(p.Status.ToString()),
                PaymentReference = p.PaymentReference,
                PaidAt = p.PaidAt,
                Notes = p.Notes,
            }).ToList());
        }

        // Which South African tax years this person has anything to declare
        // for. 1 March to end of February, named for the year it starts in.
        [HttpGet("me/tax-years")]
        public async Task<ActionResult<IEnumerable<FrontendTaxYearDto>>> GetMyTaxYears(CancellationToken ct)
        {
            var userId = CurrentUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();
            var affiliate = await affiliates.EnsureAffiliateAsync(userId, ct: ct);

            var entries = await db.Set<CommissionEntry>().AsNoTracking()
                .Where(e => e.AffiliateId == affiliate.Id)
                .Select(e => new { e.OccurredAt, e.AmountZar })
                .ToListAsync(ct);
            var payouts = await db.Set<AffiliatePayout>().AsNoTracking()
                .Where(p => p.AffiliateId == affiliate.Id && p.Status == PayoutStatus.Paid && p.PaidAt != null)
                .Select(p => new { p.PaidAt, p.TotalZar })
                .ToListAsync(ct);

            var years = entries.Select(e => AffiliateProgramme.TaxYearOf(e.OccurredAt))
                .Concat(payouts.Select(p => AffiliateProgramme.TaxYearOf(p.PaidAt!.Value)))
                .Distinct()
                .OrderByDescending(y => y)
                .ToList();

            // Always offer the current year even when it is empty, so the
            // download is never a dead end.
            var current = AffiliateProgramme.TaxYearOf(DateTime.UtcNow);
            if (!years.Contains(current)) years.Insert(0, current);

            return Ok(years.Select(y =>
            {
                var (start, end) = AffiliateProgramme.TaxYearBounds(y);
                return new FrontendTaxYearDto
                {
                    TaxYear = y,
                    Label = AffiliateProgramme.TaxYearLabel(y),
                    StartsOn = start,
                    EndsOn = end.AddDays(-1),
                    AccruedZar = AffiliateProgramme.ToCents(entries
                        .Where(e => e.OccurredAt >= start && e.OccurredAt < end)
                        .Sum(e => e.AmountZar)),
                    PaidZar = AffiliateProgramme.ToCents(payouts
                        .Where(p => p.PaidAt >= start && p.PaidAt < end)
                        .Sum(p => p.TotalZar)),
                    PayoutCount = payouts.Count(p => p.PaidAt >= start && p.PaidAt < end),
                };
            }).ToList());
        }

        // The affiliate's own statement for a South African tax year, as CSV,
        // so they can declare the income.
        //
        // Two sections on purpose. What was PAID in the year is the number a
        // sole proprietor paying cash actually put in their hands; what
        // ACCRUED in the year is what the ledger says they earned. They differ
        // whenever a hold straddles the end of February, and a statement that
        // showed only one of them would be answering half the question.
        [HttpGet("me/statement")]
        public async Task<IActionResult> GetMyStatement([FromQuery] int? taxYear, CancellationToken ct)
        {
            var userId = CurrentUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();
            var affiliate = await affiliates.EnsureAffiliateAsync(userId, ct: ct);

            var year = taxYear ?? AffiliateProgramme.TaxYearOf(DateTime.UtcNow);
            var csv = await BuildStatementCsvAsync(affiliate, year, ct);

            return File(Encoding.UTF8.GetBytes(csv), "text/csv",
                $"aptiverse-affiliate-statement-{AffiliateProgramme.TaxYearLabel(year).Replace('/', '-')}.csv");
        }

        private async Task<string> BuildStatementCsvAsync(
            Affiliate affiliate, int taxYear, CancellationToken ct)
        {
            var (start, end) = AffiliateProgramme.TaxYearBounds(taxYear);

            var entries = await db.Set<CommissionEntry>().AsNoTracking()
                .Where(e => e.AffiliateId == affiliate.Id
                         && e.OccurredAt >= start && e.OccurredAt < end)
                .OrderBy(e => e.OccurredAt)
                .ToListAsync(ct);

            var payouts = await db.Set<AffiliatePayout>().AsNoTracking()
                .Where(p => p.AffiliateId == affiliate.Id
                         && p.Status == PayoutStatus.Paid
                         && p.PaidAt >= start && p.PaidAt < end)
                .OrderBy(p => p.PaidAt)
                .ToListAsync(ct);

            var sb = new StringBuilder();
            sb.AppendLine("Aptiverse affiliate commission statement");
            sb.AppendLine($"Tax year,{AffiliateProgramme.TaxYearLabel(taxYear)} (1 March {taxYear} to end February {taxYear + 1})");
            sb.AppendLine($"Affiliate,{Csv(affiliate.ReferralCode)}");
            sb.AppendLine($"Name,{Csv($"{affiliate.LegalFirstName} {affiliate.LegalLastName}".Trim())}");
            sb.AppendLine($"Tax reference,{Csv(affiliate.TaxReferenceNumber ?? "")}");
            sb.AppendLine($"Generated,{DateTime.UtcNow:yyyy-MM-dd HH:mm} UTC");
            sb.AppendLine();

            sb.AppendLine("SECTION 1: COMMISSION PAID TO YOU IN THIS TAX YEAR");
            sb.AppendLine("Date paid,Payment reference,Period start,Period end,Entries,Amount ZAR");
            foreach (var p in payouts)
            {
                sb.AppendLine(string.Join(",",
                    p.PaidAt?.ToString("yyyy-MM-dd") ?? "",
                    Csv(p.PaymentReference ?? ""),
                    p.PeriodStart.ToString("yyyy-MM-dd"),
                    p.PeriodEnd.ToString("yyyy-MM-dd"),
                    p.EntryCount.ToString(CultureInfo.InvariantCulture),
                    p.TotalZar.ToString("0.00", CultureInfo.InvariantCulture)));
            }
            sb.AppendLine($"TOTAL PAID,,,,,{AffiliateProgramme.ToCents(payouts.Sum(p => p.TotalZar)).ToString("0.00", CultureInfo.InvariantCulture)}");
            sb.AppendLine();

            sb.AppendLine("SECTION 2: COMMISSION EARNED IN THIS TAX YEAR");
            sb.AppendLine("Date earned,Type,Payment number,Source payment ref,Source amount ZAR,Rate,Commission ZAR,Status,Reason");
            foreach (var e in entries)
            {
                sb.AppendLine(string.Join(",",
                    e.OccurredAt.ToString("yyyy-MM-dd"),
                    e.EntryType.ToString(),
                    e.PaymentNumber.ToString(CultureInfo.InvariantCulture),
                    Csv(e.SourcePaymentReference),
                    e.SourcePaymentAmountZar.ToString("0.00", CultureInfo.InvariantCulture),
                    (e.CommissionRate * 100m).ToString("0.##", CultureInfo.InvariantCulture) + "%",
                    e.AmountZar.ToString("0.00", CultureInfo.InvariantCulture),
                    e.Status.ToString(),
                    Csv(e.Reason ?? "")));
            }
            sb.AppendLine($"TOTAL EARNED,,,,,,{AffiliateProgramme.ToCents(entries.Sum(e => e.AmountZar)).ToString("0.00", CultureInfo.InvariantCulture)}");
            sb.AppendLine();
            sb.AppendLine("This statement is a record of commission from the Aptiverse referral programme.");
            sb.AppendLine("It is not tax advice. Amounts are in South African rand.");
            return sb.ToString();
        }

        // Submit or update the identity + banking detail a payout record
        // needs. Deliberately not asked for at signup: nobody should be asked
        // for their ID number while they are trying to start studying.
        [HttpPut("me/payout-details")]
        public async Task<ActionResult<FrontendAffiliateSummaryDto>> SavePayoutDetails(
            [FromBody] PayoutDetailsDto body, CancellationToken ct)
        {
            var userId = CurrentUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var missing = new List<string>();
            void Require(string value, string label)
            {
                if (string.IsNullOrWhiteSpace(value)) missing.Add(label);
            }
            Require(body.LegalFirstName, "legal first name");
            Require(body.LegalLastName, "legal last name");
            Require(body.IdNumber, "ID or passport number");
            Require(body.AddressLine1, "street address");
            Require(body.City, "city");
            Require(body.PostalCode, "postal code");
            Require(body.BankName, "bank name");
            Require(body.AccountHolderName, "account holder name");
            Require(body.AccountNumber, "account number");
            Require(body.BranchCode, "branch code");
            if (missing.Count > 0)
                return BadRequest($"Please complete: {string.Join(", ", missing)}.");

            var affiliate = await affiliates.EnsureAffiliateAsync(userId, ct: ct);

            affiliate.LegalFirstName = body.LegalFirstName.Trim();
            affiliate.LegalLastName = body.LegalLastName.Trim();
            affiliate.IdType = string.Equals(body.IdType, "passport", StringComparison.OrdinalIgnoreCase)
                ? "passport" : "sa_id";
            affiliate.IdNumber = body.IdNumber.Trim();
            affiliate.TaxReferenceNumber = Trimmed(body.TaxReferenceNumber);
            affiliate.AddressLine1 = body.AddressLine1.Trim();
            affiliate.AddressLine2 = Trimmed(body.AddressLine2);
            affiliate.City = body.City.Trim();
            affiliate.Province = Trimmed(body.Province);
            affiliate.PostalCode = body.PostalCode.Trim();
            affiliate.Country = Trimmed(body.Country) ?? "South Africa";
            affiliate.BankName = body.BankName.Trim();
            affiliate.AccountHolderName = body.AccountHolderName.Trim();
            affiliate.AccountNumber = body.AccountNumber.Trim();
            affiliate.BranchCode = body.BranchCode.Trim();
            affiliate.AccountType = Trimmed(body.AccountType) ?? "cheque";
            affiliate.ContactEmail = Trimmed(body.ContactEmail);
            affiliate.ContactPhone = Trimmed(body.ContactPhone);

            // Re-submitting after a rejection puts them back in the queue
            // rather than leaving them stuck as rejected forever.
            affiliate.PayoutOnboardingStatus = PayoutOnboardingStatus.Submitted;
            affiliate.DetailsSubmittedAt = DateTime.UtcNow;
            affiliate.ReviewNotes = null;
            affiliate.UpdatedAt = DateTime.UtcNow;

            await db.SaveChangesAsync(ct);
            logger.LogInformation("Affiliate {Id} submitted payout details.", affiliate.Id);

            return await GetMe(ct);
        }

        // Bind the signed-in account to whoever referred them.
        //
        // Called by the web app on the first authenticated page load after a
        // referral link is followed, which covers email signup and OAuth
        // alike. First touch wins, permanently, and using your own code is
        // refused rather than quietly accepted.
        [HttpPost("referrals/claim")]
        public async Task<IActionResult> ClaimReferral([FromBody] ClaimReferralDto body, CancellationToken ct)
        {
            var userId = CurrentUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var result = await affiliates.ClaimReferralAsync(new ReferralClaim
            {
                ReferredUserId = userId,
                Code = body.Code,
                Source = "app",
                LandingPath = body.LandingPath,
                DeviceId = body.DeviceId,
            }, ct);

            return Ok(new { recorded = result.Recorded, outcome = result.Outcome });
        }

        // Does this code exist? Used by the landing page to say "you were
        // referred" rather than silently swallowing a typo. Deliberately says
        // nothing about who owns it.
        [HttpGet("code/{code}")]
        [AllowAnonymous]
        public async Task<ActionResult<ReferralCodeCheckDto>> CheckCode(string code, CancellationToken ct)
        {
            var affiliate = await affiliates.FindByCodeAsync(code, ct);
            return Ok(new ReferralCodeCheckDto
            {
                Valid = affiliate is not null && affiliate.Status == AffiliateStatus.Active,
                Code = AffiliateProgramme.NormaliseCode(code),
            });
        }

        // ---- shared helpers -------------------------------------------------

        internal static FrontendCommissionEntryDto ToDto(
            CommissionEntry e, IReadOnlyDictionary<long, string?> payoutReferences)
            => new()
            {
                Id = e.Id.ToString(CultureInfo.InvariantCulture),
                ReferralId = e.ReferralId.ToString(CultureInfo.InvariantCulture),
                EntryType = ToSnake(e.EntryType.ToString()),
                Status = ToSnake(e.Status.ToString()),
                PaymentNumber = e.PaymentNumber,
                SourcePaymentAmountZar = e.SourcePaymentAmountZar,
                CommissionRatePercent = e.CommissionRate * 100m,
                AmountZar = e.AmountZar,
                OccurredAt = e.OccurredAt,
                HoldUntil = e.HoldUntil,
                PaidAt = e.PaidAt,
                PlanCode = e.SourcePlanCode,
                Reason = e.Reason,
                PaymentReference = e.PayoutId is { } id && payoutReferences.TryGetValue(id, out var r) ? r : null,
            };

        internal static string ToSnake(string pascal)
        {
            var sb = new StringBuilder(pascal.Length + 4);
            for (var i = 0; i < pascal.Length; i++)
            {
                if (char.IsUpper(pascal[i]) && i > 0) sb.Append('_');
                sb.Append(char.ToLowerInvariant(pascal[i]));
            }
            return sb.ToString();
        }

        internal static string Csv(string value)
        {
            if (value.Contains(',') || value.Contains('"') || value.Contains('\n'))
                return "\"" + value.Replace("\"", "\"\"") + "\"";
            return value;
        }

        private static string? Trimmed(string? value)
            => string.IsNullOrWhiteSpace(value) ? null : value.Trim();
    }
}
