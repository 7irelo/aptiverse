using Aptiverse.Api.Data;
using Aptiverse.Audit.Application.Frontend.Dtos;
using Aptiverse.Audit.Domain.Models.Audit;
using Aptiverse.Domain.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Audit.Controllers
{
    // The admin audit viewer, reading the append-only trail in
    // audit.audit_logs joined to the audit.audit_actions catalogue.
    //
    // This used to return Array.Empty<T>() unconditionally while the page in
    // front of it promised "every admin action, immutable, exportable". The
    // tables were real and indexed the whole time; nothing read them and
    // nothing wrote them. Aptiverse.Api.Services.Audit.AuditTrail is the writer
    // half; this is the read half.
    //
    // Admin-only, deliberately narrower than it was. The trail is
    // platform-wide and carries every user's id, email and IP address, so a
    // SchoolAdmin has no business in it: they see their own school through the
    // school-admin area, not every account on the platform.
    [ApiController]
    [Route("api/audit")]
    [Authorize(Roles = "Admin,Superuser")]
    public class AuditController(ApplicationDbContext db) : ControllerBase
    {
        private readonly ApplicationDbContext _db = db;

        // Filtered page of the trail, newest first.
        //
        // Every filter is optional and they compose. `q` is a free-text match
        // across the actor's email and the entity, which is what you actually
        // reach for when chasing a specific record.
        [HttpGet("logs")]
        public async Task<ActionResult<FrontendAuditLogPageDto>> GetAuditLogs(
            [FromQuery] string? userId = null,
            [FromQuery] string? action = null,
            [FromQuery] string? entityType = null,
            [FromQuery] string? severity = null,
            [FromQuery] string? q = null,
            [FromQuery] DateTime? from = null,
            [FromQuery] DateTime? to = null,
            [FromQuery] int take = 50,
            [FromQuery] int skip = 0,
            CancellationToken ct = default)
        {
            take = Math.Clamp(take, 1, 200);
            skip = Math.Max(skip, 0);

            var query = _db.Set<AuditLog>().AsNoTracking();

            if (!string.IsNullOrWhiteSpace(userId))
                query = query.Where(a => a.UserId == userId);

            if (!string.IsNullOrWhiteSpace(entityType))
                query = query.Where(a => a.EntityType == entityType);

            if (!string.IsNullOrWhiteSpace(action))
            {
                var actionIds = _db.Set<AuditAction>()
                    .Where(x => x.Name == action)
                    .Select(x => x.Id);
                query = query.Where(a => actionIds.Contains(a.ActionId));
            }

            if (!string.IsNullOrWhiteSpace(severity)
                && Enum.TryParse<AuditSeverity>(severity, ignoreCase: true, out var sev))
            {
                var sevIds = _db.Set<AuditAction>()
                    .Where(x => x.Severity == sev)
                    .Select(x => x.Id);
                query = query.Where(a => sevIds.Contains(a.ActionId));
            }

            // Dates arrive as calendar days from a date picker. Compare in UTC,
            // and treat `to` as inclusive of the whole day the admin picked
            // rather than midnight at its start, which is what a person means
            // by "up to the 12th".
            if (from is { } f)
            {
                var fromUtc = DateTime.SpecifyKind(f.Date, DateTimeKind.Utc);
                query = query.Where(a => a.CreatedAt >= fromUtc);
            }
            if (to is { } t)
            {
                var toUtc = DateTime.SpecifyKind(t.Date.AddDays(1), DateTimeKind.Utc);
                query = query.Where(a => a.CreatedAt < toUtc);
            }

            if (!string.IsNullOrWhiteSpace(q))
            {
                var needle = q.Trim();
                query = query.Where(a =>
                    EF.Functions.ILike(a.UserEmail, $"%{needle}%")
                    || EF.Functions.ILike(a.EntityId, $"%{needle}%")
                    || EF.Functions.ILike(a.EntityType, $"%{needle}%"));
            }

            var total = await query.CountAsync(ct);

            var rows = await query
                .OrderByDescending(a => a.Id)
                .Skip(skip)
                .Take(take)
                .Select(a => new
                {
                    a.Id,
                    a.UserId,
                    a.UserEmail,
                    a.UserRole,
                    a.EntityType,
                    a.EntityId,
                    a.OldValues,
                    a.NewValues,
                    a.IpAddress,
                    a.ServiceName,
                    a.CorrelationId,
                    a.CreatedAt,
                    Action = _db.Set<AuditAction>()
                        .Where(x => x.Id == a.ActionId)
                        .Select(x => new { x.Name, x.Category, x.Severity })
                        .FirstOrDefault(),
                })
                .ToListAsync(ct);

            // Resolve actor names in one round trip so the table can show a
            // person rather than a GUID. The email is still shown: unlike the
            // student-facing activity feed, this view exists precisely to
            // identify who did something, and it is admin-only.
            var actorIds = rows
                .Select(r => r.UserId)
                .Where(id => !string.IsNullOrWhiteSpace(id))
                .Distinct()
                .ToList();

            var names = actorIds.Count == 0
                ? []
                : await _db.Set<User>().AsNoTracking()
                    .Where(u => actorIds.Contains(u.Id))
                    .Select(u => new { u.Id, u.FirstName, u.LastName })
                    .ToDictionaryAsync(u => u.Id, u => $"{u.FirstName} {u.LastName}".Trim(), ct);

            var items = rows.Select(r => new FrontendAuditLogDto
            {
                Id = r.Id.ToString(),
                Ts = DateTime.SpecifyKind(r.CreatedAt, DateTimeKind.Utc),
                ActorId = r.UserId ?? "",
                Actor = ActorName(r.UserId, r.UserEmail, names),
                ActorEmail = r.UserEmail ?? "",
                ActorRole = r.UserRole ?? "",
                Action = r.Action?.Name ?? "Unknown",
                Category = r.Action?.Category ?? "",
                Severity = (r.Action?.Severity ?? AuditSeverity.Info).ToString().ToLowerInvariant(),
                EntityType = r.EntityType ?? "",
                EntityId = r.EntityId ?? "",
                Resource = string.IsNullOrWhiteSpace(r.EntityType)
                    ? ""
                    : string.IsNullOrWhiteSpace(r.EntityId) ? r.EntityType : $"{r.EntityType}/{r.EntityId}",
                OldValues = NullIfEmpty(r.OldValues),
                NewValues = NullIfEmpty(r.NewValues),
                Ip = r.IpAddress ?? "",
                Service = r.ServiceName ?? "",
                CorrelationId = r.CorrelationId ?? "",
            }).ToList();

            return Ok(new FrontendAuditLogPageDto
            {
                Items = items,
                Total = total,
                Skip = skip,
                Take = take,
            });
        }

        // The action catalogue, for the viewer's filter dropdown. Only actions
        // that have actually been recorded are offered, so the filter can never
        // present a choice that returns nothing.
        [HttpGet("actions")]
        public async Task<ActionResult<IEnumerable<FrontendAuditActionDto>>> GetActions(CancellationToken ct)
        {
            var used = await _db.Set<AuditLog>().AsNoTracking()
                .Select(a => a.ActionId)
                .Distinct()
                .ToListAsync(ct);

            var actions = await _db.Set<AuditAction>().AsNoTracking()
                .Where(a => used.Contains(a.Id))
                .OrderBy(a => a.Category).ThenBy(a => a.Name)
                .ToListAsync(ct);

            return Ok(actions.Select(a => new FrontendAuditActionDto
            {
                Name = a.Name,
                Category = a.Category,
                Severity = a.Severity.ToString().ToLowerInvariant(),
            }).ToList());
        }

        private static string ActorName(string? userId, string? email, IDictionary<string, string> names)
        {
            if (!string.IsNullOrWhiteSpace(userId)
                && names.TryGetValue(userId, out var name)
                && !string.IsNullOrWhiteSpace(name))
            {
                return name;
            }
            // Deleted account, or an entry written by the system rather than a
            // person. The email as recorded at the time is the next best label.
            return string.IsNullOrWhiteSpace(email) ? "System" : email;
        }

        private static string? NullIfEmpty(string? value)
            => string.IsNullOrWhiteSpace(value) ? null : value;
    }
}
