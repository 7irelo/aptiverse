using Aptiverse.Api.Data;
using Aptiverse.Entitlements.Domain.Models;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Entitlements.Application.Services
{
    public class EntitlementService(ApplicationDbContext db) : IEntitlementService
    {
        private readonly ApplicationDbContext _db = db;

        // A user's features are the union of:
        //   - all features of the Free plan (always included implicitly)
        //   - features of every plan they're an active member of
        public async Task<IReadOnlySet<string>> GetFeaturesAsync(string userId, CancellationToken ct = default)
        {
            // Free-tier features (always included).
            var freeFeatures = await _db.Set<PlanFeature>()
                .AsNoTracking()
                .Where(pf => pf.PlanCode == "free")
                .Select(pf => pf.FeatureKey)
                .ToListAsync(ct);

            // Plan codes the user is an active member of.
            var memberPlanCodes = await _db.Set<SubscriptionMember>()
                .AsNoTracking()
                .Where(m => m.UserId == userId)
                .Join(_db.Set<Subscription>().AsNoTracking(),
                      m => m.SubscriptionId,
                      s => s.Id,
                      (m, s) => new { s.PlanCode, s.Status })
                .Where(x => x.Status == "active" || x.Status == "trialing")
                .Select(x => x.PlanCode)
                .Distinct()
                .ToListAsync(ct);

            // Features of all those plans.
            var memberFeatures = memberPlanCodes.Count == 0
                ? []
                : await _db.Set<PlanFeature>()
                    .AsNoTracking()
                    .Where(pf => memberPlanCodes.Contains(pf.PlanCode))
                    .Select(pf => pf.FeatureKey)
                    .ToListAsync(ct);

            return freeFeatures.Concat(memberFeatures).ToHashSet(StringComparer.OrdinalIgnoreCase);
        }

        public async Task<bool> HasFeatureAsync(string userId, string featureKey, CancellationToken ct = default)
        {
            var set = await GetFeaturesAsync(userId, ct);
            return set.Contains(featureKey);
        }

        public async Task<UserEntitlementsDto> GetEntitlementsAsync(string userId, CancellationToken ct = default)
        {
            var memberships = await _db.Set<SubscriptionMember>()
                .AsNoTracking()
                .Where(m => m.UserId == userId)
                .Join(_db.Set<Subscription>().AsNoTracking(),
                      m => m.SubscriptionId,
                      s => s.Id,
                      (m, s) => new { m, s })
                .Where(x => x.s.Status == "active" || x.s.Status == "trialing")
                .Join(_db.Set<Plan>().AsNoTracking(),
                      x => x.s.PlanCode,
                      p => p.Code,
                      (x, p) => new MembershipDto
                      {
                          SubscriptionId = x.s.Id,
                          PlanCode = p.Code,
                          PlanName = p.Name,
                          Role = x.m.Role,
                          Status = x.s.Status,
                          JoinedAt = x.m.JoinedAt,
                      })
                .ToListAsync(ct);

            var features = await GetFeaturesAsync(userId, ct);

            // Pick the "primary" plan for display purposes — the highest
            // tier the user is on. school > family > student > free.
            var rank = new Dictionary<string, int> { ["school"] = 4, ["family"] = 3, ["student"] = 2, ["free"] = 1 };
            var primary = memberships
                .Select(m => m.PlanCode)
                .OrderByDescending(c => rank.TryGetValue(c, out var r) ? r : 0)
                .FirstOrDefault() ?? "free";

            return new UserEntitlementsDto
            {
                Features = features,
                Memberships = memberships,
                PrimaryPlanCode = primary,
            };
        }
    }
}
