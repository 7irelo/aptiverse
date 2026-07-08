using System.Security.Claims;
using System.Text.Json.Serialization;
using Aptiverse.Api.Data;
using Aptiverse.Entitlements.Application.Services;
using Aptiverse.Entitlements.Domain.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Entitlements.Controllers
{
    [ApiController]
    [Route("api/entitlements")]
    [Authorize]
    public class EntitlementsController(
        ApplicationDbContext db,
        IEntitlementService entitlements,
        IUsageMeter usage) : ControllerBase
    {
        private readonly ApplicationDbContext _db = db;
        private readonly IEntitlementService _entitlements = entitlements;
        private readonly IUsageMeter _usage = usage;

        // Quota keys this app meters. Keeping them in one place avoids
        // typos drifting between the controller, the bot, and the seeder.
        private static readonly string[] QuotaKeys =
            ["ai.quick", "ai.deep", "whatsapp", "practice.generate"];

        private string? CurrentUserId()
            => User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirst("sub")?.Value
            ?? User.FindFirst("userId")?.Value;

        // What can I do — used by the frontend to gate UI without
        // re-issuing the JWT. The token already carries `features` but
        // this endpoint also returns the membership detail (plan name,
        // role, status) for the settings + admin pages.
        [HttpGet("me")]
        public async Task<ActionResult<FrontendUserEntitlementsDto>> GetMe()
        {
            var userId = CurrentUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var ent = await _entitlements.GetEntitlementsAsync(userId);
            return Ok(new FrontendUserEntitlementsDto
            {
                Features = ent.Features.ToList(),
                PrimaryPlanCode = ent.PrimaryPlanCode,
                Memberships = ent.Memberships.Select(m => new FrontendMembershipDto
                {
                    SubscriptionId = m.SubscriptionId.ToString(),
                    PlanCode = m.PlanCode,
                    PlanName = m.PlanName,
                    Role = m.Role,
                    Status = m.Status,
                    JoinedAt = m.JoinedAt,
                }).ToList(),
            });
        }

        // Current-month usage across every metered quota. Drives the
        // help-bot meter, the billing-page allowance card, and any
        // dashboard widget that wants to surface "X / Y left this month".
        //
        // -1 limit means unlimited (school plan) — surfaced via the
        // unlimited:true flag so the UI shows ∞ instead of a progress bar.
        [HttpGet("me/usage")]
        public async Task<ActionResult<FrontendUsageSummaryDto>> GetMyUsage(CancellationToken ct)
        {
            var userId = CurrentUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var byKey = new Dictionary<string, FrontendQuotaSnapshotDto>();
            foreach (var key in QuotaKeys)
            {
                var snap = await _usage.GetUsageAsync(userId, key, ct);
                byKey[key] = new FrontendQuotaSnapshotDto
                {
                    QuotaKey = key,
                    Used = snap.Used,
                    Limit = snap.Limit,
                    Remaining = snap.Unlimited ? -1 : snap.Remaining,
                    Unlimited = snap.Unlimited,
                    PeriodStart = snap.PeriodStart,
                };
            }

            return Ok(new FrontendUsageSummaryDto
            {
                AiQuick = byKey["ai.quick"],
                AiDeep = byKey["ai.deep"],
                Whatsapp = byKey["whatsapp"],
                PracticeGenerate = byKey["practice.generate"],
            });
        }

        // Public catalog — used by the pricing page client-side and the
        // upgrade-CTA cards inside FeatureGuard fallbacks. Anonymous so
        // signed-out visitors can see plan info.
        [HttpGet("plans")]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<FrontendPlanDto>>> GetPlans()
        {
            var plans = await _db.Set<Plan>()
                .AsNoTracking()
                .OrderBy(p => p.MonthlyPriceZar ?? decimal.MaxValue)
                .Select(p => new FrontendPlanDto
                {
                    Code = p.Code,
                    Name = p.Name,
                    Description = p.Description,
                    MonthlyPriceZar = p.MonthlyPriceZar,
                    AnnualPriceZar = p.AnnualPriceZar,
                    MaxMembers = p.MaxMembers,
                    Kind = p.Kind,
                    CommissionPercent = p.CommissionPercent,
                })
                .ToListAsync();

            // Attach feature lists (separate query — keeps the Plan
            // projection clean and lets EF translate cleanly).
            var featuresByPlan = await _db.Set<PlanFeature>()
                .AsNoTracking()
                .GroupBy(pf => pf.PlanCode)
                .Select(g => new { Plan = g.Key, Features = g.Select(pf => pf.FeatureKey).ToList() })
                .ToDictionaryAsync(x => x.Plan, x => x.Features);

            // Attach per-plan quotas (ai.quick / ai.deep / whatsapp etc.)
            // so the marketing pricing page can render the monthly
            // allowance card without re-stating the seeded numbers.
            var quotasByPlan = await _db.Set<PlanQuota>()
                .AsNoTracking()
                .Select(q => new { q.PlanCode, q.QuotaKey, q.PerMonth })
                .GroupBy(q => q.PlanCode)
                .Select(g => new
                {
                    PlanCode = g.Key,
                    Quotas = g.Select(x => new FrontendPlanQuotaDto
                    {
                        QuotaKey = x.QuotaKey,
                        PerMonth = x.PerMonth,
                    }).ToList(),
                })
                .ToDictionaryAsync(x => x.PlanCode, x => x.Quotas);

            foreach (var p in plans)
            {
                p.Features = featuresByPlan.TryGetValue(p.Code, out var fs) ? fs : new List<string>();
                p.Quotas = quotasByPlan.TryGetValue(p.Code, out var qs) ? qs : new List<FrontendPlanQuotaDto>();
            }

            return Ok(plans);
        }

        // Admin-only — assign a user to a plan. Creates a fresh
        // Subscription (no Paystack linkage; that comes when payments
        // are wired). Used for granting comps, internal accounts, etc.
        [HttpPost("subscriptions")]
        [Authorize(Roles = "Admin,Superuser")]
        public async Task<ActionResult<FrontendSubscriptionAdminDto>> CreateSubscription(
            [FromBody] FrontendCreateSubscriptionDto body)
        {
            if (string.IsNullOrWhiteSpace(body.PlanCode)) return BadRequest("planCode is required.");
            if (string.IsNullOrWhiteSpace(body.OwnerUserId)) return BadRequest("ownerUserId is required.");

            var plan = await _db.Set<Plan>().FirstOrDefaultAsync(p => p.Code == body.PlanCode);
            if (plan is null) return BadRequest($"Unknown plan '{body.PlanCode}'.");

            var subscription = new Subscription
            {
                PlanCode = body.PlanCode,
                OwnerUserId = body.OwnerUserId,
                Name = string.IsNullOrWhiteSpace(body.Name) ? null : body.Name.Trim(),
                Status = "active",
            };
            _db.Set<Subscription>().Add(subscription);

            _db.Set<SubscriptionMember>().Add(new SubscriptionMember
            {
                Subscription = subscription,
                UserId = body.OwnerUserId,
                Role = "owner",
                InvitedByUserId = CurrentUserId(),
            });

            await _db.SaveChangesAsync();
            return CreatedAtAction(nameof(GetMe), new FrontendSubscriptionAdminDto
            {
                Id = subscription.Id.ToString(),
                PlanCode = subscription.PlanCode,
                OwnerUserId = subscription.OwnerUserId,
                Name = subscription.Name,
                Status = subscription.Status,
                CreatedAt = subscription.CreatedAt,
            });
        }

        // Admin-only — add another user to an existing subscription.
        // Respects the plan's MaxMembers cap.
        [HttpPost("subscriptions/{id}/members")]
        [Authorize(Roles = "Admin,Superuser")]
        public async Task<IActionResult> AddMember(string id, [FromBody] FrontendAddMemberDto body)
        {
            if (!long.TryParse(id, out var subscriptionId)) return NotFound();
            if (string.IsNullOrWhiteSpace(body.UserId)) return BadRequest("userId is required.");

            var subscription = await _db.Set<Subscription>().FirstOrDefaultAsync(s => s.Id == subscriptionId);
            if (subscription is null) return NotFound();

            var plan = await _db.Set<Plan>().AsNoTracking().FirstOrDefaultAsync(p => p.Code == subscription.PlanCode);
            if (plan is null) return Problem("Subscription points at an unknown plan.");

            var currentCount = await _db.Set<SubscriptionMember>()
                .CountAsync(m => m.SubscriptionId == subscriptionId);
            if (currentCount >= plan.MaxMembers)
            {
                return BadRequest($"This subscription is at its {plan.MaxMembers}-member cap.");
            }

            var alreadyMember = await _db.Set<SubscriptionMember>()
                .AnyAsync(m => m.SubscriptionId == subscriptionId && m.UserId == body.UserId);
            if (alreadyMember) return Conflict("That user is already a member of this subscription.");

            _db.Set<SubscriptionMember>().Add(new SubscriptionMember
            {
                SubscriptionId = subscriptionId,
                UserId = body.UserId,
                Role = "member",
                InvitedByUserId = CurrentUserId(),
            });
            subscription.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();
            return NoContent();
        }
    }

    public record FrontendUserEntitlementsDto
    {
        [JsonPropertyName("primaryPlanCode")] public string PrimaryPlanCode { get; init; } = "";
        [JsonPropertyName("features")] public IList<string> Features { get; init; } = [];
        [JsonPropertyName("memberships")] public IList<FrontendMembershipDto> Memberships { get; init; } = [];
    }

    public record FrontendMembershipDto
    {
        [JsonPropertyName("subscriptionId")] public string SubscriptionId { get; init; } = "";
        [JsonPropertyName("planCode")] public string PlanCode { get; init; } = "";
        [JsonPropertyName("planName")] public string PlanName { get; init; } = "";
        [JsonPropertyName("role")] public string Role { get; init; } = "";
        [JsonPropertyName("status")] public string Status { get; init; } = "";
        [JsonPropertyName("joinedAt")] public DateTime JoinedAt { get; init; }
    }

    public class FrontendPlanDto
    {
        [JsonPropertyName("code")] public string Code { get; set; } = "";
        [JsonPropertyName("name")] public string Name { get; set; } = "";
        [JsonPropertyName("description")] public string? Description { get; set; }
        [JsonPropertyName("monthlyPriceZar")] public decimal? MonthlyPriceZar { get; set; }
        [JsonPropertyName("annualPriceZar")] public decimal? AnnualPriceZar { get; set; }
        [JsonPropertyName("maxMembers")] public int MaxMembers { get; set; }
        [JsonPropertyName("kind")] public string Kind { get; set; } = "paid";
        // 0.15 = 15% marketplace cut, null on non-marketplace plans.
        [JsonPropertyName("commissionPercent")] public decimal? CommissionPercent { get; set; }
        [JsonPropertyName("features")] public IList<string> Features { get; set; } = [];
        [JsonPropertyName("quotas")] public IList<FrontendPlanQuotaDto> Quotas { get; set; } = [];
    }

    public record FrontendPlanQuotaDto
    {
        [JsonPropertyName("quotaKey")] public string QuotaKey { get; init; } = "";
        // -1 = unlimited (within fair-use enforced at the HTTP layer).
        [JsonPropertyName("perMonth")] public int PerMonth { get; init; }
    }

    public record FrontendCreateSubscriptionDto
    {
        [JsonPropertyName("planCode")] public string PlanCode { get; init; } = "";
        [JsonPropertyName("ownerUserId")] public string OwnerUserId { get; init; } = "";
        [JsonPropertyName("name")] public string? Name { get; init; }
    }

    public record FrontendAddMemberDto
    {
        [JsonPropertyName("userId")] public string UserId { get; init; } = "";
    }

    public record FrontendSubscriptionAdminDto
    {
        [JsonPropertyName("id")] public string Id { get; init; } = "";
        [JsonPropertyName("planCode")] public string PlanCode { get; init; } = "";
        [JsonPropertyName("ownerUserId")] public string OwnerUserId { get; init; } = "";
        [JsonPropertyName("name")] public string? Name { get; init; }
        [JsonPropertyName("status")] public string Status { get; init; } = "";
        [JsonPropertyName("createdAt")] public DateTime CreatedAt { get; init; }
    }

    public record FrontendQuotaSnapshotDto
    {
        [JsonPropertyName("quotaKey")] public string QuotaKey { get; init; } = "";
        [JsonPropertyName("used")] public int Used { get; init; }
        [JsonPropertyName("limit")] public int Limit { get; init; }
        [JsonPropertyName("remaining")] public int Remaining { get; init; }
        [JsonPropertyName("unlimited")] public bool Unlimited { get; init; }
        [JsonPropertyName("periodStart")] public DateTime PeriodStart { get; init; }
    }

    public record FrontendUsageSummaryDto
    {
        [JsonPropertyName("aiQuick")] public FrontendQuotaSnapshotDto AiQuick { get; init; } = new();
        [JsonPropertyName("aiDeep")] public FrontendQuotaSnapshotDto AiDeep { get; init; } = new();
        [JsonPropertyName("whatsapp")] public FrontendQuotaSnapshotDto Whatsapp { get; init; } = new();
        [JsonPropertyName("practiceGenerate")] public FrontendQuotaSnapshotDto PracticeGenerate { get; init; } = new();
    }
}
