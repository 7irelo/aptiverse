using Aptiverse.Api.Data;
using Aptiverse.Entitlements.Domain.Models;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Entitlements.Application.Services
{
    public class UsageMeter(ApplicationDbContext db) : IUsageMeter
    {
        private readonly ApplicationDbContext _db = db;

        // First-of-month UTC. Used as the period key for FeatureUsage.
        private static DateTime CurrentPeriod() =>
            new(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1, 0, 0, 0, DateTimeKind.Utc);

        public async Task<int> GetLimitAsync(string userId, string quotaKey, CancellationToken ct = default)
        {
            // The plan codes the user is currently entitled to: every
            // active subscription they're a member of, plus the implicit
            // "free" plan (everyone gets it).
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
            memberPlanCodes.Add("free");

            // For each plan, look up the quota row for this key. Take the
            // max — higher plans win. Any -1 (unlimited) short-circuits.
            var quotas = await _db.Set<PlanQuota>()
                .AsNoTracking()
                .Where(q => memberPlanCodes.Contains(q.PlanCode) && q.QuotaKey == quotaKey)
                .Select(q => q.PerMonth)
                .ToListAsync(ct);

            if (quotas.Count == 0) return 0;             // no row → no allowance
            if (quotas.Any(q => q == -1)) return -1;     // unlimited wins
            return quotas.Max();
        }

        public async Task<int> GetUsedAsync(string userId, string quotaKey, CancellationToken ct = default)
        {
            var period = CurrentPeriod();
            var row = await _db.Set<FeatureUsage>()
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.UserId == userId && u.QuotaKey == quotaKey && u.PeriodStart == period, ct);
            return row?.Used ?? 0;
        }

        public async Task<UsageSnapshot> GetUsageAsync(string userId, string quotaKey, CancellationToken ct = default)
        {
            var limit = await GetLimitAsync(userId, quotaKey, ct);
            var used = await GetUsedAsync(userId, quotaKey, ct);
            var unlimited = limit < 0;
            return new UsageSnapshot
            {
                Used = used,
                Limit = limit,
                Remaining = unlimited ? int.MaxValue : Math.Max(0, limit - used),
                Unlimited = unlimited,
                PeriodStart = CurrentPeriod(),
            };
        }

        public async Task<bool> TryConsumeAsync(string userId, string quotaKey, int amount = 1, CancellationToken ct = default)
        {
            if (amount <= 0) return true;

            var limit = await GetLimitAsync(userId, quotaKey, ct);
            if (limit == 0) return false;        // explicitly disabled (Free quotas for paid-only features)

            var period = CurrentPeriod();
            var row = await _db.Set<FeatureUsage>()
                .FirstOrDefaultAsync(u => u.UserId == userId && u.QuotaKey == quotaKey && u.PeriodStart == period, ct);

            if (row is null)
            {
                if (limit > 0 && amount > limit) return false;
                _db.Set<FeatureUsage>().Add(new FeatureUsage
                {
                    UserId = userId,
                    QuotaKey = quotaKey,
                    PeriodStart = period,
                    Used = amount,
                });
            }
            else
            {
                if (limit > 0 && row.Used + amount > limit) return false;
                row.Used += amount;
                row.UpdatedAt = DateTime.UtcNow;
            }

            await _db.SaveChangesAsync(ct);
            return true;
        }
    }
}
