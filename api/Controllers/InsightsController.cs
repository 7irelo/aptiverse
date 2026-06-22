using System.Text;
using System.Text.Json;
using Aptiverse.Api.Data;
using Aptiverse.Audit.Domain.Models.Audit;
using Aptiverse.Insights.Application.Frontend.Dtos;
using Aptiverse.Mastery.Domain.Models.Mastery;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Insights.Controllers
{
    // Live activity + gaps/differentiation, sourced from REAL signals.
    //
    // Live activity is projected from the append-only audit trail
    // (audit.audit_logs joined to audit.audit_actions for a human-readable
    // action label). Gaps/differentiation read the Mastery module's
    // mastery.knowledge_gaps / mastery.topic_masteries tables when populated,
    // and return honest empty arrays otherwise.
    //
    // Data access lives in the controller deliberately: it is the one place
    // in the unified host that links every module's Domain assembly, so it
    // can read AuditLog (Audit module) and KnowledgeGap/TopicMastery (Mastery
    // module) alongside the Insights DTOs without cross-module references.
    [ApiController]
    [Route("api/insights")]
    [Authorize]
    public class InsightsController(ApplicationDbContext db) : ControllerBase
    {
        private readonly ApplicationDbContext _db = db;

        private static readonly JsonSerializerOptions JsonOpts = new(JsonSerializerDefaults.Web);

        // How often the SSE loop polls the audit trail for new rows.
        private static readonly TimeSpan PollInterval = TimeSpan.FromSeconds(5);
        // Keepalive comment cadence so proxies/EventSource don't reconnect-loop
        // during quiet periods.
        private static readonly TimeSpan HeartbeatInterval = TimeSpan.FromSeconds(15);

        [HttpGet("live-activity")]
        public async Task<ActionResult<IEnumerable<FrontendLiveActivityDto>>> GetLiveActivity(
            [FromQuery] int take = 30,
            CancellationToken ct = default)
        {
            take = Math.Clamp(take, 1, 200);
            var items = await ReadRecentActivityAsync(take, afterId: null, ct);
            return Ok(items);
        }

        // SSE stream — emits real activity as it appears by polling the audit
        // trail on an interval, plus a heartbeat comment as keepalive. The UI's
        // EventSource consumes `activity` events (JSON payload) and ignores the
        // `: heartbeat` comment lines.
        [HttpGet("live-activity/stream")]
        public async Task LiveActivityStream(CancellationToken ct)
        {
            Response.Headers["Content-Type"] = "text/event-stream";
            Response.Headers["Cache-Control"] = "no-cache";
            Response.Headers["Connection"] = "keep-alive";
            // Disable proxy buffering (nginx) so events flush immediately.
            Response.Headers["X-Accel-Buffering"] = "no";

            // Seed the cursor at the newest existing row so we only stream
            // genuinely new activity from connect-time onward (the initial
            // backlog is served by the GET live-activity endpoint).
            long lastId = await _db.Set<AuditLog>()
                .AsNoTracking()
                .OrderByDescending(a => a.Id)
                .Select(a => (long?)a.Id)
                .FirstOrDefaultAsync(ct) ?? 0L;

            var lastHeartbeat = DateTime.UtcNow;

            while (!ct.IsCancellationRequested)
            {
                IList<FrontendLiveActivityDto> fresh;
                try
                {
                    fresh = await ReadRecentActivityAsync(take: 50, afterId: lastId, ct);
                }
                catch (OperationCanceledException)
                {
                    break;
                }
                catch
                {
                    // Transient DB hiccup — keep the connection alive and retry
                    // on the next tick rather than tearing down the stream.
                    fresh = Array.Empty<FrontendLiveActivityDto>();
                }

                if (fresh.Count > 0)
                {
                    // ReadRecentActivityAsync returns newest-first; emit oldest
                    // -first so the UI appends in chronological order, and
                    // advance the cursor past the highest id seen.
                    foreach (var item in fresh.Reverse())
                    {
                        var payload = JsonSerializer.Serialize(item, JsonOpts);
                        await WriteSseAsync("activity", payload, ct);
                        if (long.TryParse(item.Id, out var id) && id > lastId)
                            lastId = id;
                    }
                    lastHeartbeat = DateTime.UtcNow;
                }
                else if (DateTime.UtcNow - lastHeartbeat >= HeartbeatInterval)
                {
                    await Response.WriteAsync(": heartbeat\n\n", ct);
                    await Response.Body.FlushAsync(ct);
                    lastHeartbeat = DateTime.UtcNow;
                }

                try { await Task.Delay(PollInterval, ct); }
                catch (TaskCanceledException) { break; }
            }
        }

        private async Task WriteSseAsync(string eventName, string data, CancellationToken ct)
        {
            var sb = new StringBuilder();
            sb.Append("event: ").Append(eventName).Append('\n');
            sb.Append("data: ").Append(data).Append("\n\n");
            await Response.WriteAsync(sb.ToString(), ct);
            await Response.Body.FlushAsync(ct);
        }

        // Projects audit-trail rows into FrontendLiveActivityDto, newest-first.
        // Joins the action catalogue for a readable label and falls back to the
        // entity type for the "subject"/"detail" surface. `afterId` (exclusive)
        // is used by the SSE poller to fetch only rows newer than the cursor.
        private async Task<IList<FrontendLiveActivityDto>> ReadRecentActivityAsync(
            int take, long? afterId, CancellationToken ct)
        {
            var query = _db.Set<AuditLog>().AsNoTracking();

            if (afterId is { } cursor)
                query = query.Where(a => a.Id > cursor);

            // Left-join the action catalogue so a missing/!active action row
            // doesn't drop the activity item.
            var rows = await query
                .OrderByDescending(a => a.Id)
                .Take(take)
                .Select(a => new
                {
                    a.Id,
                    a.UserId,
                    a.UserEmail,
                    a.EntityType,
                    a.EntityId,
                    a.CreatedAt,
                    ActionName = _db.Set<AuditAction>()
                        .Where(act => act.Id == a.ActionId)
                        .Select(act => act.Name)
                        .FirstOrDefault()
                })
                .ToListAsync(ct);

            return rows
                .Select(r => new FrontendLiveActivityDto
                {
                    Id = r.Id.ToString(),
                    StudentId = r.UserId ?? "",
                    Student = string.IsNullOrWhiteSpace(r.UserEmail) ? "Unknown" : r.UserEmail,
                    Action = !string.IsNullOrWhiteSpace(r.ActionName)
                        ? r.ActionName!
                        : (string.IsNullOrWhiteSpace(r.EntityType) ? "Activity" : r.EntityType),
                    Subject = string.IsNullOrWhiteSpace(r.EntityType) ? null : r.EntityType,
                    Detail = string.IsNullOrWhiteSpace(r.EntityId) ? null : $"#{r.EntityId}",
                    Ts = DateTime.SpecifyKind(r.CreatedAt, DateTimeKind.Utc)
                })
                .ToList();
        }

        // Gaps: aggregate the Mastery module's knowledge_gaps into per-(concept,
        // subject) struggling cohorts. "strugglingPct" is the share of gaps in
        // that cohort marked High/Critical severity; "sample" is the cohort size.
        // Honest empty when the table is unpopulated.
        [HttpGet("gaps")]
        [Authorize(Roles = "Teacher,SchoolAdmin,Admin,Superuser")]
        public async Task<ActionResult<IEnumerable<FrontendGapDto>>> GetGaps(CancellationToken ct = default)
        {
            var grouped = await _db.Set<KnowledgeGap>()
                .AsNoTracking()
                .GroupBy(g => new { g.Concept, g.StudentSubjectId })
                .Select(grp => new
                {
                    grp.Key.Concept,
                    grp.Key.StudentSubjectId,
                    Sample = grp.Count(),
                    Struggling = grp.Count(x =>
                        x.Severity == "High" || x.Severity == "Critical")
                })
                .OrderByDescending(x => x.Struggling)
                .ThenByDescending(x => x.Sample)
                .Take(50)
                .ToListAsync(ct);

            var gaps = grouped
                .Select(x => new FrontendGapDto
                {
                    Topic = string.IsNullOrWhiteSpace(x.Concept) ? "Unspecified" : x.Concept,
                    ClassName = $"Subject {x.StudentSubjectId}",
                    StrugglingPct = x.Sample == 0
                        ? 0
                        : (int)Math.Round(100.0 * x.Struggling / x.Sample),
                    Sample = x.Sample
                })
                .ToList();

            return Ok(gaps);
        }

        // Differentiation: bucket students by mastery band off topic_masteries.
        // MasteryLevel is a 0..1 score; we tier into Stretch / On track /
        // Support cohorts (distinct students per band) with an action hint.
        // Honest empty when the table is unpopulated.
        [HttpGet("differentiation")]
        [Authorize(Roles = "Teacher,SchoolAdmin,Admin,Superuser")]
        public async Task<ActionResult<IEnumerable<FrontendDifferentiationTierDto>>> GetDifferentiation(
            CancellationToken ct = default)
        {
            // Per-student average mastery, computed in the DB.
            var perStudent = await _db.Set<TopicMastery>()
                .AsNoTracking()
                .GroupBy(m => m.StudentSubjectId)
                .Select(grp => new { Avg = grp.Average(x => x.MasteryLevel) })
                .ToListAsync(ct);

            if (perStudent.Count == 0)
                return Ok(Array.Empty<FrontendDifferentiationTierDto>());

            var stretch = perStudent.Count(s => s.Avg >= 0.8);
            var onTrack = perStudent.Count(s => s.Avg >= 0.5 && s.Avg < 0.8);
            var support = perStudent.Count(s => s.Avg < 0.5);

            var tiers = new List<FrontendDifferentiationTierDto>
            {
                new()
                {
                    Label = "Stretch",
                    Count = stretch,
                    Suggestion = "Offer extension tasks and peer-mentoring roles."
                },
                new()
                {
                    Label = "On track",
                    Count = onTrack,
                    Suggestion = "Maintain pace with regular formative checks."
                },
                new()
                {
                    Label = "Needs support",
                    Count = support,
                    Suggestion = "Schedule targeted intervention on weak concepts."
                },
            };

            return Ok(tiers);
        }
    }
}
