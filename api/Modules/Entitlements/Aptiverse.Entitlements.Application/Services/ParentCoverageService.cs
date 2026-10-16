using Aptiverse.Api.Data;
using Aptiverse.Domain.Models;
using Aptiverse.Entitlements.Domain.Models;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Entitlements.Application.Services
{
    public class ParentCoverageService(ApplicationDbContext db) : IParentCoverageService
    {
        private readonly ApplicationDbContext _db = db;

        // The two plan codes a coverage sub can carry. Anything else is not a
        // coverage sub and is ignored by every query here. Kept as a List, not a
        // string[]: on an array, `.Contains` binds to the span-based
        // MemoryExtensions.Contains (via the implicit array to ReadOnlySpan
        // conversion), which EF Core cannot translate and throws on at query
        // time. List.Contains is the plain, translatable instance method.
        private static readonly List<string> CoveragePlanCodes = ["student.pro", "student.max"];

        // Parent-tier plan codes. Holding one of these, active, is what funds
        // coverage; MaxMembers on the plan is how many children it covers.
        private static readonly List<string> ParentPlanCodes =
            ["parent", "parent.2", "parent.3", "parent.4"];

        public async Task EnsureCoverageAsync(string parentId, string childId, string planCode, CancellationToken ct = default)
        {
            var coverage = await _db.Set<Subscription>()
                .Where(s => s.OwnerUserId == parentId
                    && CoveragePlanCodes.Contains(s.PlanCode)
                    && s.Members.Any(m => m.UserId == childId))
                .FirstOrDefaultAsync(ct);

            if (coverage is null)
            {
                // Snapshot the child's display name onto the coverage sub, the
                // same way the admin create-subscription flow names a sub.
                var child = await _db.Set<User>().AsNoTracking()
                    .Where(u => u.Id == childId)
                    .Select(u => new { u.FirstName, u.LastName })
                    .FirstOrDefaultAsync(ct);
                var name = child is null ? null : $"{child.FirstName} {child.LastName}".Trim();

                var sub = new Subscription
                {
                    OwnerUserId = parentId,
                    PlanCode = planCode,
                    Status = "active",
                    Name = string.IsNullOrWhiteSpace(name) ? null : name,
                };
                _db.Set<Subscription>().Add(sub);
                _db.Set<SubscriptionMember>().Add(new SubscriptionMember
                {
                    Subscription = sub,
                    UserId = childId,
                    Role = "member",
                    InvitedByUserId = parentId,
                });
            }
            else if (!string.Equals(coverage.PlanCode, planCode, StringComparison.Ordinal))
            {
                coverage.PlanCode = planCode;
                coverage.UpdatedAt = DateTime.UtcNow;
            }
            else
            {
                // Already covered at this exact plan — nothing to persist.
                return;
            }

            await _db.SaveChangesAsync(ct);
        }

        public async Task<string?> GetChildPlanAsync(string parentId, string childId, CancellationToken ct = default)
        {
            return await _db.Set<Subscription>()
                .AsNoTracking()
                .Where(s => s.OwnerUserId == parentId
                    && s.Status == "active"
                    && CoveragePlanCodes.Contains(s.PlanCode)
                    && s.Members.Any(m => m.UserId == childId))
                .Select(s => s.PlanCode)
                .FirstOrDefaultAsync(ct);
        }

        public async Task<int> CoveredCountAsync(string parentId, CancellationToken ct = default)
        {
            return await _db.Set<Subscription>()
                .AsNoTracking()
                .Where(s => s.OwnerUserId == parentId
                    && s.Status == "active"
                    && CoveragePlanCodes.Contains(s.PlanCode))
                .CountAsync(ct);
        }

        public async Task<int> ChildCapacityAsync(string parentId, CancellationToken ct = default)
        {
            var parentPlanCodes = await _db.Set<Subscription>().AsNoTracking()
                .Where(s => s.OwnerUserId == parentId
                    && s.Status == "active"
                    && ParentPlanCodes.Contains(s.PlanCode))
                .Select(s => s.PlanCode)
                .ToListAsync(ct);
            if (parentPlanCodes.Count == 0) return 0;

            var maxMembers = await _db.Set<Plan>().AsNoTracking()
                .Where(p => parentPlanCodes.Contains(p.Code))
                .Select(p => p.MaxMembers)
                .ToListAsync(ct);
            return maxMembers.Count == 0 ? 0 : maxMembers.Max();
        }

        public async Task<bool> CanCoverAsync(string parentId, string childId, CancellationToken ct = default)
        {
            // Already covered: this is a tier change, not a new seat.
            if (await GetChildPlanAsync(parentId, childId, ct) is not null) return true;

            var capacity = await ChildCapacityAsync(parentId, ct);
            if (capacity <= 0) return false;

            var covered = await CoveredCountAsync(parentId, ct);
            return covered + 1 <= capacity;
        }
    }
}
