using System.Security.Claims;
using System.Text.Json.Serialization;
using Aptiverse.Api.Data;
using Aptiverse.Api.Services.Audit;
using Aptiverse.Application.Auth.Services;
using Aptiverse.Audit.Domain.Models.Audit;
using Aptiverse.Domain.Models;
using Aptiverse.Entitlements.Domain.Models;
using Aptiverse.Events.Domain.Models;
using Aptiverse.Marketplace.Domain.Models.Marketplace;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Api.Controllers
{
    // Back office. Everything the /admin area needs to operate the real
    // platform: accounts, subscriptions, marketplace tutors, and the counts on
    // the admin home.
    //
    // It lives in one controller rather than being sprinkled across the
    // per-module controllers on purpose. Those are shaped for the person whose
    // data it is ("my subscription", "my profile") and adding a platform-wide
    // read to each one means an admin-only branch inside an endpoint every
    // student calls. The unified host links every module's Domain assembly, so
    // this can read across them the way InsightsController already does.
    //
    // Reads are Admin or Superuser. Writes say so per action, and every write
    // records to the audit trail.
    [ApiController]
    [Route("api/admin")]
    [Authorize(Roles = "Admin,Superuser")]
    public class AdminController(
        ApplicationDbContext db,
        UserManager<User> userManager,
        IAuditTrail audit) : ControllerBase
    {
        private readonly ApplicationDbContext _db = db;
        private readonly UserManager<User> _userManager = userManager;
        private readonly IAuditTrail _audit = audit;

        // Roles an admin may hand out here. Deliberately not "every role in the
        // database": the privileged two are separated below so that granting
        // them needs a Superuser.
        private static readonly string[] AssignableRoles =
            ["Student", "Parent", "Teacher", "Tutor", "SchoolAdmin", "Admin", "Superuser"];

        private static readonly string[] PrivilegedRoles = ["Admin", "Superuser"];

        // A List, not an array, because it is used inside an EF query
        // expression. On an array, .Contains binds to the span-based
        // MemoryExtensions.Contains and EF cannot translate it; it throws at
        // query time. EntitlementsController documents the same trap.
        private static readonly List<string> LiveSubscriptionStatuses =
            ["active", "trialing", "past_due"];

        private string? CurrentUserId()
            => User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirst("sub")?.Value
            ?? User.FindFirst("userId")?.Value;

        private bool IsSuperuser() => User.IsInRole("Superuser");

        // ---- Overview ------------------------------------------------------

        // The numbers on the admin home. Every one of them is a count of real
        // rows; there is no modelled or projected figure here, which is why
        // there is no "revenue" or "churn" tile. Monthly recurring revenue is
        // the one derived number and it is derived honestly: the list price of
        // the plan behind each live subscription, annual plans divided by
        // twelve, discounts and failed renewals not modelled.
        [HttpGet("overview")]
        public async Task<ActionResult<AdminOverviewDto>> GetOverview(CancellationToken ct)
        {
            var userCount = await _db.Set<User>().CountAsync(ct);

            var roleCounts = await (
                from ur in _db.Set<IdentityUserRole<string>>()
                join r in _db.Set<IdentityRole>() on ur.RoleId equals r.Id
                group ur by r.Name into g
                select new { Role = g.Key, Count = g.Count() })
                .ToListAsync(ct);

            var subs = await _db.Set<Subscription>().AsNoTracking()
                .Select(s => new { s.PlanCode, s.Status, s.Billing })
                .ToListAsync(ct);

            var plans = await _db.Set<Plan>().AsNoTracking()
                .ToDictionaryAsync(p => p.Code, p => new { p.MonthlyPriceZar, p.AnnualPriceZar }, ct);

            var live = subs.Where(s => LiveSubscriptionStatuses.Contains(s.Status)).ToList();

            decimal mrr = 0m;
            foreach (var s in live)
            {
                if (!plans.TryGetValue(s.PlanCode, out var p)) continue;
                var annual = string.Equals(s.Billing, "annual", StringComparison.OrdinalIgnoreCase);
                if (annual && p.AnnualPriceZar is { } a) mrr += a / 12m;
                else if (p.MonthlyPriceZar is { } m) mrr += m;
            }

            var enquiriesTotal = await _db.Set<Aptiverse.Sales.Domain.Models.SchoolEnquiry>()
                .CountAsync(ct);
            var enquiriesFresh = await _db.Set<Aptiverse.Sales.Domain.Models.SchoolEnquiry>()
                .CountAsync(e => !e.Contacted, ct);

            var outboxPending = await _db.Set<OutboxMessage>().CountAsync(m => m.ProcessedAt == null, ct);

            var auditToday = await _db.Set<AuditLog>()
                .CountAsync(a => a.CreatedAt >= DateTime.UtcNow.AddDays(-1), ct);

            var tutorCount = await _db.Set<Tutor>().CountAsync(ct);
            var tutorsUnverified = await _db.Set<Tutor>().CountAsync(t => !t.IsVerified, ct);

            return Ok(new AdminOverviewDto
            {
                Users = userCount,
                UsersByRole = roleCounts
                    .Where(x => x.Role is not null)
                    .ToDictionary(x => PermissionResolver.Normalise(x.Role!), x => x.Count),
                SubscriptionsLive = live.Count,
                SubscriptionsPastDue = subs.Count(s => s.Status == "past_due"),
                SubscriptionsCancelled = subs.Count(s => s.Status == "cancelled"),
                MonthlyRecurringRevenueZar = Math.Round(mrr, 2),
                SchoolEnquiries = enquiriesTotal,
                SchoolEnquiriesUncontacted = enquiriesFresh,
                OutboxPending = outboxPending,
                AuditEventsLast24h = auditToday,
                Tutors = tutorCount,
                TutorsUnverified = tutorsUnverified,
            });
        }

        // ---- Users ---------------------------------------------------------

        // Every account, with the roles Identity actually holds for them.
        //
        // The pre-existing GET /api/users returns UserDto with a Roles property
        // that nothing populates, which is why the admin list could not show a
        // role and invented fifty accounts instead. Roles are loaded here in one
        // join rather than per user through UserManager.
        [HttpGet("users")]
        public async Task<ActionResult<AdminUserPageDto>> GetUsers(
            [FromQuery] string? q = null,
            [FromQuery] string? role = null,
            [FromQuery] int take = 50,
            [FromQuery] int skip = 0,
            CancellationToken ct = default)
        {
            take = Math.Clamp(take, 1, 200);
            skip = Math.Max(skip, 0);

            var query = _db.Set<User>().AsNoTracking();

            if (!string.IsNullOrWhiteSpace(q))
            {
                var needle = q.Trim();
                query = query.Where(u =>
                    EF.Functions.ILike(u.Email!, $"%{needle}%")
                    || EF.Functions.ILike(u.FirstName, $"%{needle}%")
                    || EF.Functions.ILike(u.LastName, $"%{needle}%")
                    || u.Id == needle);
            }

            if (!string.IsNullOrWhiteSpace(role))
            {
                var identityRole = role.Trim();
                var userIds =
                    from ur in _db.Set<IdentityUserRole<string>>()
                    join r in _db.Set<IdentityRole>() on ur.RoleId equals r.Id
                    where r.Name == identityRole
                    select ur.UserId;
                query = query.Where(u => userIds.Contains(u.Id));
            }

            var total = await query.CountAsync(ct);

            var page = await query
                .OrderByDescending(u => u.CreatedAt)
                .Skip(skip)
                .Take(take)
                .Select(u => new
                {
                    u.Id,
                    u.FirstName,
                    u.LastName,
                    u.Email,
                    u.EmailConfirmed,
                    u.PhoneNumber,
                    u.School,
                    u.Grade,
                    u.EducationLevel,
                    u.CreatedAt,
                    u.LockoutEnd,
                })
                .ToListAsync(ct);

            var ids = page.Select(u => u.Id).ToList();
            var rolesById = await RolesByUserAsync(ids, ct);
            var plansById = await PlanCodesByUserAsync(ids, ct);

            var items = page.Select(u => new AdminUserRowDto
            {
                Id = u.Id,
                Name = $"{u.FirstName} {u.LastName}".Trim(),
                Email = u.Email ?? "",
                EmailConfirmed = u.EmailConfirmed,
                PhoneNumber = u.PhoneNumber,
                School = u.School,
                Grade = u.Grade,
                EducationLevel = u.EducationLevel,
                Roles = rolesById.TryGetValue(u.Id, out var rs) ? rs : [],
                Role = PermissionResolver.PrimaryRole(rolesById.TryGetValue(u.Id, out var rs2) ? rs2 : []),
                PlanCodes = plansById.TryGetValue(u.Id, out var ps) ? ps : [],
                CreatedAt = DateTime.SpecifyKind(u.CreatedAt, DateTimeKind.Utc),
                LockedOut = u.LockoutEnd.HasValue && u.LockoutEnd > DateTimeOffset.UtcNow,
            }).ToList();

            return Ok(new AdminUserPageDto { Items = items, Total = total, Skip = skip, Take = take });
        }

        // One account in full: profile, roles, and every subscription they own
        // or belong to. This is the "look at one account properly" view, so it
        // resolves the things you would otherwise open four pages to find.
        [HttpGet("users/{id}")]
        public async Task<ActionResult<AdminUserDetailDto>> GetUser(string id, CancellationToken ct)
        {
            var u = await _db.Set<User>().AsNoTracking().FirstOrDefaultAsync(x => x.Id == id, ct);
            if (u is null) return NotFound();

            var roles = (await RolesByUserAsync([id], ct)).TryGetValue(id, out var rs) ? rs : [];

            var owned = await _db.Set<Subscription>().AsNoTracking()
                .Where(s => s.OwnerUserId == id)
                .OrderByDescending(s => s.CreatedAt)
                .ToListAsync(ct);

            var memberOf = await (
                from m in _db.Set<SubscriptionMember>().AsNoTracking()
                where m.UserId == id
                join s in _db.Set<Subscription>().AsNoTracking() on m.SubscriptionId equals s.Id
                select new { m.Role, m.JoinedAt, Sub = s })
                .ToListAsync(ct);

            var planNames = await _db.Set<Plan>().AsNoTracking()
                .ToDictionaryAsync(p => p.Code, p => p.Name, ct);

            var recentActions = await _db.Set<AuditLog>().AsNoTracking()
                .Where(a => a.UserId == id || (a.EntityType == "User" && a.EntityId == id))
                .OrderByDescending(a => a.Id)
                .Take(10)
                .Select(a => new
                {
                    a.Id,
                    a.CreatedAt,
                    a.EntityType,
                    a.EntityId,
                    ActionName = _db.Set<AuditAction>().Where(x => x.Id == a.ActionId).Select(x => x.Name).FirstOrDefault(),
                })
                .ToListAsync(ct);

            return Ok(new AdminUserDetailDto
            {
                Id = u.Id,
                Name = $"{u.FirstName} {u.LastName}".Trim(),
                FirstName = u.FirstName,
                LastName = u.LastName,
                Email = u.Email ?? "",
                EmailConfirmed = u.EmailConfirmed,
                PhoneNumber = u.PhoneNumber,
                School = u.School,
                Grade = u.Grade,
                CurriculumId = u.CurriculumId,
                EducationLevel = u.EducationLevel,
                InstitutionId = u.InstitutionId,
                Roles = roles,
                Role = PermissionResolver.PrimaryRole(roles),
                CreatedAt = DateTime.SpecifyKind(u.CreatedAt, DateTimeKind.Utc),
                UpdatedAt = u.UpdatedAt,
                LockedOut = u.LockoutEnd.HasValue && u.LockoutEnd > DateTimeOffset.UtcNow,
                Subscriptions = owned.Select(s => ToSubscriptionRow(s, planNames, ownerName: $"{u.FirstName} {u.LastName}".Trim(), ownerEmail: u.Email ?? "", memberCount: null)).ToList(),
                Memberships = memberOf.Select(m => new AdminMembershipDto
                {
                    SubscriptionId = m.Sub.Id.ToString(),
                    PlanCode = m.Sub.PlanCode,
                    PlanName = planNames.TryGetValue(m.Sub.PlanCode, out var pn) ? pn : m.Sub.PlanCode,
                    Status = m.Sub.Status,
                    Role = m.Role,
                    JoinedAt = m.JoinedAt,
                    IsOwner = m.Sub.OwnerUserId == id,
                }).ToList(),
                RecentAudit = recentActions.Select(a => new AdminUserAuditDto
                {
                    Id = a.Id.ToString(),
                    Action = a.ActionName ?? "Unknown",
                    Resource = string.IsNullOrWhiteSpace(a.EntityType) ? "" : $"{a.EntityType}/{a.EntityId}",
                    Ts = DateTime.SpecifyKind(a.CreatedAt, DateTimeKind.Utc),
                }).ToList(),
            });
        }

        // The roles an admin may assign, so the UI never offers a role the
        // server would reject.
        [HttpGet("roles")]
        public ActionResult<IEnumerable<AdminRoleDto>> GetAssignableRoles()
            => Ok(AssignableRoles.Select(r => new AdminRoleDto
            {
                Name = r,
                Label = PermissionResolver.Normalise(r),
                Privileged = PrivilegedRoles.Contains(r),
            }).ToList());

        // Set a user's roles wholesale.
        //
        // Four rails, all of which are about the same thing: an Admin should
        // not be able to quietly widen their own reach or anyone else's beyond
        // their own.
        //   1. You cannot change your own roles. Self-promotion by PUT is not a
        //      support workflow, and locking yourself out by accident is worse.
        //   2. Granting or removing Admin / Superuser needs Superuser.
        //   3. Editing an account that already holds a privileged role needs
        //      Superuser, so a plain Admin cannot strip a Superuser.
        //   4. The last Superuser cannot be demoted, because an estate with no
        //      Superuser has no way back without database access.
        [HttpPut("users/{id}/roles")]
        public async Task<IActionResult> SetUserRoles(
            string id, [FromBody] SetRolesInput body, CancellationToken ct)
        {
            var actorId = CurrentUserId();
            if (string.IsNullOrEmpty(actorId)) return Unauthorized();
            if (string.Equals(actorId, id, StringComparison.Ordinal))
                return BadRequest(new { message = "You cannot change your own roles." });

            var requested = (body.Roles ?? [])
                .Select(r => r?.Trim() ?? "")
                .Where(r => r.Length > 0)
                .Distinct(StringComparer.Ordinal)
                .ToList();

            var unknown = requested.Where(r => !AssignableRoles.Contains(r)).ToList();
            if (unknown.Count > 0)
                return BadRequest(new { message = $"Unknown role(s): {string.Join(", ", unknown)}." });

            var user = await _userManager.FindByIdAsync(id);
            if (user is null) return NotFound();

            var current = (await _userManager.GetRolesAsync(user)).ToList();

            var touchesPrivileged =
                requested.Any(PrivilegedRoles.Contains) || current.Any(PrivilegedRoles.Contains);
            if (touchesPrivileged && !IsSuperuser())
                return Forbid();

            var toAdd = requested.Except(current, StringComparer.Ordinal).ToList();
            var toRemove = current.Except(requested, StringComparer.Ordinal).ToList();
            if (toAdd.Count == 0 && toRemove.Count == 0)
                return NoContent();

            if (toRemove.Contains("Superuser"))
            {
                var superuserCount = await (
                    from ur in _db.Set<IdentityUserRole<string>>()
                    join r in _db.Set<IdentityRole>() on ur.RoleId equals r.Id
                    where r.Name == "Superuser"
                    select ur.UserId).CountAsync(ct);
                if (superuserCount <= 1)
                    return BadRequest(new { message = "This is the last Superuser; promote someone else first." });
            }

            if (toRemove.Count > 0)
            {
                var removed = await _userManager.RemoveFromRolesAsync(user, toRemove);
                if (!removed.Succeeded)
                    return BadRequest(new { message = string.Join(", ", removed.Errors.Select(e => e.Description)) });
            }
            if (toAdd.Count > 0)
            {
                var added = await _userManager.AddToRolesAsync(user, toAdd);
                if (!added.Succeeded)
                    return BadRequest(new { message = string.Join(", ", added.Errors.Select(e => e.Description)) });
            }

            await _audit.RecordAsync(new AuditEntry
            {
                Action = "User.RolesChanged",
                Category = "Users",
                Severity = touchesPrivileged ? AuditSeverity.Warning : AuditSeverity.Info,
                EntityType = "User",
                EntityId = id,
                OldValues = new { roles = current },
                NewValues = new { roles = requested, email = user.Email },
            }, ct);

            return NoContent();
        }

        // ---- Subscriptions -------------------------------------------------

        // Every subscription on the platform with the plan behind it and the
        // person paying for it. This is the billing truth we hold locally:
        // status, interval, what the plan costs, when the last charge landed,
        // when the next one is due, the saved card, and how many renewal
        // attempts have failed in a row.
        //
        // What it deliberately is not is a receipt-by-receipt ledger. Charges
        // live at Paystack and there is no local transactions table, so rather
        // than a page of invented rows the admin gets the subscription state
        // that we can actually stand behind.
        [HttpGet("subscriptions")]
        public async Task<ActionResult<IEnumerable<AdminSubscriptionDto>>> GetSubscriptions(
            [FromQuery] string? status = null,
            [FromQuery] string? planCode = null,
            CancellationToken ct = default)
        {
            var query = _db.Set<Subscription>().AsNoTracking();
            if (!string.IsNullOrWhiteSpace(status))
                query = query.Where(s => s.Status == status);
            if (!string.IsNullOrWhiteSpace(planCode))
                query = query.Where(s => s.PlanCode == planCode);

            var subs = await query.OrderByDescending(s => s.CreatedAt).ToListAsync(ct);
            if (subs.Count == 0) return Ok(Array.Empty<AdminSubscriptionDto>());

            var ownerIds = subs.Select(s => s.OwnerUserId).Distinct().ToList();
            var owners = await _db.Set<User>().AsNoTracking()
                .Where(u => ownerIds.Contains(u.Id))
                .Select(u => new { u.Id, u.FirstName, u.LastName, u.Email })
                .ToListAsync(ct);
            var ownerById = owners.ToDictionary(o => o.Id);

            var subIds = subs.Select(s => s.Id).ToList();
            var memberCounts = await _db.Set<SubscriptionMember>().AsNoTracking()
                .Where(m => subIds.Contains(m.SubscriptionId))
                .GroupBy(m => m.SubscriptionId)
                .Select(g => new { SubscriptionId = g.Key, Count = g.Count() })
                .ToDictionaryAsync(x => x.SubscriptionId, x => x.Count, ct);

            var planNames = await _db.Set<Plan>().AsNoTracking()
                .ToDictionaryAsync(p => p.Code, p => p.Name, ct);

            var rows = subs.Select(s =>
            {
                ownerById.TryGetValue(s.OwnerUserId, out var o);
                memberCounts.TryGetValue(s.Id, out var members);
                return ToSubscriptionRow(
                    s, planNames,
                    ownerName: o is null ? "" : $"{o.FirstName} {o.LastName}".Trim(),
                    ownerEmail: o?.Email ?? "",
                    memberCount: members);
            }).ToList();

            return Ok(rows);
        }

        // ---- Marketplace tutors --------------------------------------------

        // Every tutor profile, not just the discoverable ones. The public
        // /api/marketplace/tutors filters to tutors accepting students, which
        // is right for discovery and wrong for a back office that needs to see
        // the ones who are paused or unverified.
        [HttpGet("tutors")]
        public async Task<ActionResult<IEnumerable<AdminTutorDto>>> GetTutors(CancellationToken ct)
        {
            var rows = await (from t in _db.Set<Tutor>().AsNoTracking()
                              join u in _db.Set<User>().AsNoTracking() on t.UserId equals u.Id
                              select new { t, u })
                .ToListAsync(ct);

            return Ok(rows
                .OrderBy(x => x.t.IsVerified)
                .ThenByDescending(x => x.t.Rating)
                .Select(x => new AdminTutorDto
                {
                    UserId = x.t.UserId,
                    Name = $"{x.u.FirstName} {x.u.LastName}".Trim(),
                    Email = x.u.Email ?? "",
                    Qualification = x.t.Qualification ?? "",
                    Subjects = string.IsNullOrWhiteSpace(x.t.Subjects)
                        ? []
                        : x.t.Subjects.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries),
                    Rating = x.t.Rating,
                    ReviewCount = x.t.TotalReviews,
                    YearsOfExperience = x.t.YearsOfExperience,
                    Verified = x.t.IsVerified,
                    AcceptingStudents = x.t.AcceptingStudents,
                    TutorKind = string.IsNullOrWhiteSpace(x.t.TutorKind) ? "university_student" : x.t.TutorKind,
                    Institution = x.t.Institution ?? "",
                    CreatedAt = x.t.CreatedAt,
                })
                .ToList());
        }

        // Verify or un-verify a tutor. IsVerified was documented as
        // "system-managed" and had no management path at all, which is why the
        // admin tutors table shipped a Verify button that did nothing.
        [HttpPost("tutors/{userId}/verification")]
        public async Task<IActionResult> SetTutorVerification(
            string userId, [FromBody] SetVerifiedInput body, CancellationToken ct)
        {
            var tutor = await _db.Set<Tutor>().FirstOrDefaultAsync(t => t.UserId == userId, ct);
            if (tutor is null) return NotFound();

            if (tutor.IsVerified == body.Verified) return NoContent();

            var previous = tutor.IsVerified;
            tutor.IsVerified = body.Verified;
            tutor.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync(ct);

            await _audit.RecordAsync(new AuditEntry
            {
                Action = body.Verified ? "Tutor.Verified" : "Tutor.VerificationRevoked",
                Category = "Marketplace",
                Severity = AuditSeverity.Info,
                EntityType = "Tutor",
                EntityId = userId,
                OldValues = new { verified = previous },
                NewValues = new { verified = body.Verified },
            }, ct);

            return NoContent();
        }

        // ---- System --------------------------------------------------------

        // What the API can actually tell you about itself: whether the database
        // answers and how quickly, the size of the outbox backlog, and how much
        // is in the tables the platform runs on.
        //
        // The page this replaces listed eight named microservices with p95 and
        // RPS figures generated in the browser, for an architecture that is one
        // process. None of it was measured.
        [HttpGet("system")]
        public async Task<ActionResult<AdminSystemDto>> GetSystem(CancellationToken ct)
        {
            var sw = System.Diagnostics.Stopwatch.StartNew();
            var dbOk = true;
            try
            {
                await _db.Database.ExecuteSqlRawAsync("SELECT 1", ct);
            }
            catch
            {
                dbOk = false;
            }
            sw.Stop();

            var pending = dbOk ? await _db.Set<OutboxMessage>().CountAsync(m => m.ProcessedAt == null, ct) : 0;
            var processed = dbOk ? await _db.Set<OutboxMessage>().CountAsync(m => m.ProcessedAt != null, ct) : 0;
            DateTime? oldestPending = null;
            if (dbOk && pending > 0)
            {
                oldestPending = await _db.Set<OutboxMessage>()
                    .Where(m => m.ProcessedAt == null)
                    .OrderBy(m => m.OccurredAt)
                    .Select(m => (DateTime?)m.OccurredAt)
                    .FirstOrDefaultAsync(ct);
            }

            var proc = System.Diagnostics.Process.GetCurrentProcess();

            return Ok(new AdminSystemDto
            {
                DatabaseOk = dbOk,
                DatabaseLatencyMs = (int)sw.ElapsedMilliseconds,
                OutboxPending = pending,
                OutboxProcessed = processed,
                OldestPendingOccurredAt = oldestPending,
                Environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Production",
                ServerTimeUtc = DateTime.UtcNow,
                UptimeSeconds = (long)(DateTime.UtcNow - proc.StartTime.ToUniversalTime()).TotalSeconds,
                DotnetVersion = System.Runtime.InteropServices.RuntimeInformation.FrameworkDescription,
            });
        }

        // ---- helpers -------------------------------------------------------

        private async Task<Dictionary<string, List<string>>> RolesByUserAsync(
            IList<string> userIds, CancellationToken ct)
        {
            if (userIds.Count == 0) return [];
            var pairs = await (
                from ur in _db.Set<IdentityUserRole<string>>().AsNoTracking()
                where userIds.Contains(ur.UserId)
                join r in _db.Set<IdentityRole>().AsNoTracking() on ur.RoleId equals r.Id
                select new { ur.UserId, RoleName = r.Name })
                .ToListAsync(ct);

            return pairs
                .GroupBy(p => p.UserId)
                .ToDictionary(
                    g => g.Key,
                    g => g.Select(x => x.RoleName ?? "").Where(x => x.Length > 0).ToList());
        }

        // Plan codes a user is entitled to right now, through any live
        // subscription they own or belong to.
        private async Task<Dictionary<string, List<string>>> PlanCodesByUserAsync(
            IList<string> userIds, CancellationToken ct)
        {
            if (userIds.Count == 0) return [];
            var rows = await (
                from m in _db.Set<SubscriptionMember>().AsNoTracking()
                where userIds.Contains(m.UserId)
                join s in _db.Set<Subscription>().AsNoTracking() on m.SubscriptionId equals s.Id
                where LiveSubscriptionStatuses.Contains(s.Status)
                select new { m.UserId, s.PlanCode })
                .ToListAsync(ct);

            return rows
                .GroupBy(r => r.UserId)
                .ToDictionary(g => g.Key, g => g.Select(x => x.PlanCode).Distinct().ToList());
        }

        private static AdminSubscriptionDto ToSubscriptionRow(
            Subscription s,
            IDictionary<string, string> planNames,
            string ownerName,
            string ownerEmail,
            int? memberCount)
        {
            var annual = string.Equals(s.Billing, "annual", StringComparison.OrdinalIgnoreCase);
            return new AdminSubscriptionDto
            {
                Id = s.Id.ToString(),
                PlanCode = s.PlanCode,
                PlanName = planNames.TryGetValue(s.PlanCode, out var n) ? n : s.PlanCode,
                Name = s.Name,
                OwnerUserId = s.OwnerUserId,
                OwnerName = ownerName,
                OwnerEmail = ownerEmail,
                Status = s.Status,
                Billing = annual ? "annual" : "monthly",
                MemberCount = memberCount,
                StartedAt = DateTime.SpecifyKind(s.StartedAt, DateTimeKind.Utc),
                ValidUntil = s.ValidUntil,
                CancelledAt = s.CancelledAt,
                LastChargeAt = s.LastChargeAt,
                RenewalFailureCount = s.RenewalFailureCount,
                PendingPlanCode = s.PendingPlanCode,
                CardBrand = s.CardBrand,
                CardLast4 = s.CardLast4,
                BillingEmail = s.BillingEmail,
                // Paid through Paystack at some point, versus provisioned by
                // hand. Worth showing: a comped account has no card and will
                // never renew, and that is not the same as a failed one.
                Paid = !string.IsNullOrWhiteSpace(s.PaystackCustomerCode)
                    || !string.IsNullOrWhiteSpace(s.PaystackAuthorizationCode),
            };
        }
    }

    // ---- DTOs --------------------------------------------------------------

    public record AdminOverviewDto
    {
        [JsonPropertyName("users")] public int Users { get; init; }
        [JsonPropertyName("usersByRole")] public IDictionary<string, int> UsersByRole { get; init; } = new Dictionary<string, int>();
        [JsonPropertyName("subscriptionsLive")] public int SubscriptionsLive { get; init; }
        [JsonPropertyName("subscriptionsPastDue")] public int SubscriptionsPastDue { get; init; }
        [JsonPropertyName("subscriptionsCancelled")] public int SubscriptionsCancelled { get; init; }
        [JsonPropertyName("monthlyRecurringRevenueZar")] public decimal MonthlyRecurringRevenueZar { get; init; }
        [JsonPropertyName("schoolEnquiries")] public int SchoolEnquiries { get; init; }
        [JsonPropertyName("schoolEnquiriesUncontacted")] public int SchoolEnquiriesUncontacted { get; init; }
        [JsonPropertyName("outboxPending")] public int OutboxPending { get; init; }
        [JsonPropertyName("auditEventsLast24h")] public int AuditEventsLast24h { get; init; }
        [JsonPropertyName("tutors")] public int Tutors { get; init; }
        [JsonPropertyName("tutorsUnverified")] public int TutorsUnverified { get; init; }
    }

    public record AdminUserRowDto
    {
        [JsonPropertyName("id")] public string Id { get; init; } = "";
        [JsonPropertyName("name")] public string Name { get; init; } = "";
        [JsonPropertyName("email")] public string Email { get; init; } = "";
        [JsonPropertyName("emailConfirmed")] public bool EmailConfirmed { get; init; }
        [JsonPropertyName("phoneNumber")] public string? PhoneNumber { get; init; }
        [JsonPropertyName("school")] public string? School { get; init; }
        [JsonPropertyName("grade")] public int? Grade { get; init; }
        [JsonPropertyName("educationLevel")] public string EducationLevel { get; init; } = "";
        [JsonPropertyName("roles")] public IList<string> Roles { get; init; } = [];
        [JsonPropertyName("role")] public string Role { get; init; } = "";
        [JsonPropertyName("planCodes")] public IList<string> PlanCodes { get; init; } = [];
        [JsonPropertyName("createdAt")] public DateTime CreatedAt { get; init; }
        [JsonPropertyName("lockedOut")] public bool LockedOut { get; init; }
    }

    public record AdminUserPageDto
    {
        [JsonPropertyName("items")] public IList<AdminUserRowDto> Items { get; init; } = [];
        [JsonPropertyName("total")] public int Total { get; init; }
        [JsonPropertyName("skip")] public int Skip { get; init; }
        [JsonPropertyName("take")] public int Take { get; init; }
    }

    public record AdminUserDetailDto
    {
        [JsonPropertyName("id")] public string Id { get; init; } = "";
        [JsonPropertyName("name")] public string Name { get; init; } = "";
        [JsonPropertyName("firstName")] public string FirstName { get; init; } = "";
        [JsonPropertyName("lastName")] public string LastName { get; init; } = "";
        [JsonPropertyName("email")] public string Email { get; init; } = "";
        [JsonPropertyName("emailConfirmed")] public bool EmailConfirmed { get; init; }
        [JsonPropertyName("phoneNumber")] public string? PhoneNumber { get; init; }
        [JsonPropertyName("school")] public string? School { get; init; }
        [JsonPropertyName("grade")] public int? Grade { get; init; }
        [JsonPropertyName("curriculumId")] public string? CurriculumId { get; init; }
        [JsonPropertyName("educationLevel")] public string EducationLevel { get; init; } = "";
        [JsonPropertyName("institutionId")] public string? InstitutionId { get; init; }
        [JsonPropertyName("roles")] public IList<string> Roles { get; init; } = [];
        [JsonPropertyName("role")] public string Role { get; init; } = "";
        [JsonPropertyName("createdAt")] public DateTime CreatedAt { get; init; }
        [JsonPropertyName("updatedAt")] public DateTime? UpdatedAt { get; init; }
        [JsonPropertyName("lockedOut")] public bool LockedOut { get; init; }
        [JsonPropertyName("subscriptions")] public IList<AdminSubscriptionDto> Subscriptions { get; init; } = [];
        [JsonPropertyName("memberships")] public IList<AdminMembershipDto> Memberships { get; init; } = [];
        [JsonPropertyName("recentAudit")] public IList<AdminUserAuditDto> RecentAudit { get; init; } = [];
    }

    public record AdminMembershipDto
    {
        [JsonPropertyName("subscriptionId")] public string SubscriptionId { get; init; } = "";
        [JsonPropertyName("planCode")] public string PlanCode { get; init; } = "";
        [JsonPropertyName("planName")] public string PlanName { get; init; } = "";
        [JsonPropertyName("status")] public string Status { get; init; } = "";
        [JsonPropertyName("role")] public string Role { get; init; } = "";
        [JsonPropertyName("joinedAt")] public DateTime JoinedAt { get; init; }
        [JsonPropertyName("isOwner")] public bool IsOwner { get; init; }
    }

    public record AdminUserAuditDto
    {
        [JsonPropertyName("id")] public string Id { get; init; } = "";
        [JsonPropertyName("action")] public string Action { get; init; } = "";
        [JsonPropertyName("resource")] public string Resource { get; init; } = "";
        [JsonPropertyName("ts")] public DateTime Ts { get; init; }
    }

    public record AdminRoleDto
    {
        [JsonPropertyName("name")] public string Name { get; init; } = "";
        [JsonPropertyName("label")] public string Label { get; init; } = "";
        [JsonPropertyName("privileged")] public bool Privileged { get; init; }
    }

    public record SetRolesInput
    {
        [JsonPropertyName("roles")] public IList<string>? Roles { get; init; }
    }

    public record SetVerifiedInput
    {
        [JsonPropertyName("verified")] public bool Verified { get; init; }
    }

    public record AdminSubscriptionDto
    {
        [JsonPropertyName("id")] public string Id { get; init; } = "";
        [JsonPropertyName("planCode")] public string PlanCode { get; init; } = "";
        [JsonPropertyName("planName")] public string PlanName { get; init; } = "";
        [JsonPropertyName("name")] public string? Name { get; init; }
        [JsonPropertyName("ownerUserId")] public string OwnerUserId { get; init; } = "";
        [JsonPropertyName("ownerName")] public string OwnerName { get; init; } = "";
        [JsonPropertyName("ownerEmail")] public string OwnerEmail { get; init; } = "";
        [JsonPropertyName("status")] public string Status { get; init; } = "";
        [JsonPropertyName("billing")] public string Billing { get; init; } = "monthly";
        [JsonPropertyName("memberCount")] public int? MemberCount { get; init; }
        [JsonPropertyName("startedAt")] public DateTime StartedAt { get; init; }
        [JsonPropertyName("validUntil")] public DateTime? ValidUntil { get; init; }
        [JsonPropertyName("cancelledAt")] public DateTime? CancelledAt { get; init; }
        [JsonPropertyName("lastChargeAt")] public DateTime? LastChargeAt { get; init; }
        [JsonPropertyName("renewalFailureCount")] public int RenewalFailureCount { get; init; }
        [JsonPropertyName("pendingPlanCode")] public string? PendingPlanCode { get; init; }
        [JsonPropertyName("cardBrand")] public string? CardBrand { get; init; }
        [JsonPropertyName("cardLast4")] public string? CardLast4 { get; init; }
        [JsonPropertyName("billingEmail")] public string? BillingEmail { get; init; }
        [JsonPropertyName("paid")] public bool Paid { get; init; }
    }

    public record AdminTutorDto
    {
        [JsonPropertyName("userId")] public string UserId { get; init; } = "";
        [JsonPropertyName("name")] public string Name { get; init; } = "";
        [JsonPropertyName("email")] public string Email { get; init; } = "";
        [JsonPropertyName("qualification")] public string Qualification { get; init; } = "";
        [JsonPropertyName("subjects")] public IList<string> Subjects { get; init; } = [];
        [JsonPropertyName("rating")] public double Rating { get; init; }
        [JsonPropertyName("reviewCount")] public int ReviewCount { get; init; }
        [JsonPropertyName("yearsOfExperience")] public int YearsOfExperience { get; init; }
        [JsonPropertyName("verified")] public bool Verified { get; init; }
        [JsonPropertyName("acceptingStudents")] public bool AcceptingStudents { get; init; }
        [JsonPropertyName("tutorKind")] public string TutorKind { get; init; } = "";
        [JsonPropertyName("institution")] public string Institution { get; init; } = "";
        [JsonPropertyName("createdAt")] public DateTime CreatedAt { get; init; }
    }

    public record AdminSystemDto
    {
        [JsonPropertyName("databaseOk")] public bool DatabaseOk { get; init; }
        [JsonPropertyName("databaseLatencyMs")] public int DatabaseLatencyMs { get; init; }
        [JsonPropertyName("outboxPending")] public int OutboxPending { get; init; }
        [JsonPropertyName("outboxProcessed")] public int OutboxProcessed { get; init; }
        [JsonPropertyName("oldestPendingOccurredAt")] public DateTime? OldestPendingOccurredAt { get; init; }
        [JsonPropertyName("environment")] public string Environment { get; init; } = "";
        [JsonPropertyName("serverTimeUtc")] public DateTime ServerTimeUtc { get; init; }
        [JsonPropertyName("uptimeSeconds")] public long UptimeSeconds { get; init; }
        [JsonPropertyName("dotnetVersion")] public string DotnetVersion { get; init; } = "";
    }
}
