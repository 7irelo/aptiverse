using System.Security.Claims;
using Aptiverse.AcademicPlanning.Domain.Models.AcademicPlanning;
using Aptiverse.Api.Data;
using Aptiverse.Mastery.Application.Frontend.Dtos;
using Aptiverse.Practice.Domain.Models.Practice;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Mastery.Controllers
{
    // Mastery is COMPUTED ON READ from real signals the .NET side already
    // stores: practice per-topic correctness (AttemptScoreSummary.PerTopic)
    // and graded SBA marks (Assessment.ActualMark / Weight). No ML and no
    // writes to the mastery.* tables — those stay owned by the Python AI
    // service. This is a deterministic, explainable projection that returns
    // honest empty arrays until a student has practice attempts / graded
    // assessments, and can later be swapped to read the Python-populated
    // tables without changing the API contract.
    //
    // Cross-module reads live in the controller by design: the host is the one
    // place that links every module's Domain assembly, so it can read Practice
    // and AcademicPlanning entities alongside the Mastery DTOs without
    // cross-module project references (same pattern as InsightsController).
    [ApiController]
    [Route("api/mastery")]
    [Authorize]
    public class MasteryController(ApplicationDbContext db) : ControllerBase
    {
        private readonly ApplicationDbContext _db = db;

        private string? CurrentUserId()
            => User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirst("sub")?.Value
            ?? User.FindFirst("userId")?.Value;

        // ── Topic mastery ────────────────────────────────────────────────
        // Per (subject, topic): cumulative correctness across all submitted
        // practice attempts, plus a trend (latest attempt's topic score minus
        // the first). Weakest topics surface first.
        [HttpGet("topic-mastery")]
        public async Task<ActionResult<IEnumerable<FrontendTopicMasteryDto>>> GetTopicMastery(
            [FromQuery] string? subjectId = null,
            CancellationToken ct = default)
        {
            var userId = CurrentUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var rows = await ComputeTopicMasteryAsync(userId, ct);
            if (rows.Count == 0) return Ok(Array.Empty<FrontendTopicMasteryDto>());

            var names = await SubjectNamesAsync(ct);

            var dtos = rows
                .Where(r => subjectId == null || r.SubjectId == subjectId)
                .OrderBy(r => r.SubjectId)
                .ThenBy(r => r.Mastery)
                .Select(r => new FrontendTopicMasteryDto
                {
                    SubjectId = r.SubjectId,
                    Subject = names.GetValueOrDefault(r.SubjectId, r.SubjectId),
                    Topic = r.Topic,
                    Mastery = r.Mastery,
                    Trend = r.Trend,
                })
                .ToList();

            return Ok(dtos);
        }

        // ── Period predictions ───────────────────────────────────────────
        // Weighted average of the current reporting period's graded work,
        // nudged toward the practice-mastery signal and the recent mark trend,
        // capped so a single good/bad practice run can't swing the projection
        // wildly. Confidence grows with the amount of evidence.
        //
        // The period is a school term for a high-school student and a semester
        // for a tertiary one. The wire field names say "Term" because that is
        // what shipped first, not because the figure is school-only; see the
        // note on FrontendTermPredictionDto. Nothing here is CAPS-specific:
        // it is weighted graded work, whatever the work is called.
        [HttpGet("predictions")]
        public async Task<ActionResult<IEnumerable<FrontendTermPredictionDto>>> GetPredictions(
            CancellationToken ct = default)
        {
            var userId = CurrentUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            // A logged actual mark is what counts as graded here — the status
            // field is a separate workflow flag the student may not have flipped
            // to "graded" when they entered their mark. Keying off ActualMark
            // keeps predictions in step with the assessments list and detail.
            var graded = await _db.Set<Assessment>()
                .AsNoTracking()
                .Where(x => x.StudentId == userId && x.ActualMark != null)
                .Select(x => new { x.SubjectId, x.ActualMark, x.Weight, x.DueDate })
                .ToListAsync(ct);

            if (graded.Count == 0) return Ok(Array.Empty<FrontendTermPredictionDto>());

            // Subject-level practice mastery (mean across the subject's topics).
            var masteryRows = await ComputeTopicMasteryAsync(userId, ct);
            var subjectMastery = masteryRows
                .GroupBy(r => r.SubjectId)
                .ToDictionary(g => g.Key, g => g.Average(x => x.Mastery));

            var names = await SubjectNamesAsync(ct);

            var predictions = graded
                .GroupBy(a => a.SubjectId)
                .Select(g =>
                {
                    var marks = g.Select(x => (double)x.ActualMark!.Value).ToList();
                    var weightSum = g.Sum(x => x.Weight);
                    var currentTermRaw = weightSum > 0
                        ? g.Sum(x => x.ActualMark!.Value * (double)x.Weight) / weightSum
                        : marks.Average();

                    // Recent-vs-older mark trend, split by due date.
                    var ordered = g.OrderBy(x => x.DueDate)
                        .Select(x => (double)x.ActualMark!.Value)
                        .ToList();
                    double assessmentTrend = 0;
                    if (ordered.Count >= 2)
                    {
                        var half = ordered.Count / 2;
                        assessmentTrend = ordered.Skip(half).Average() - ordered.Take(half).Average();
                    }

                    var hasMastery = subjectMastery.TryGetValue(g.Key, out var sm);
                    var masteryGap = hasMastery ? sm - currentTermRaw : 0;
                    var momentum = Math.Clamp(0.5 * assessmentTrend + 0.3 * masteryGap, -10, 10);
                    var predicted = (int)Math.Clamp(Math.Round(currentTermRaw + momentum), 0, 100);

                    // More graded marks (and a practice signal) => more trust.
                    var confidence = Math.Clamp(0.35 + 0.12 * g.Count() + (hasMastery ? 0.15 : 0), 0.2, 0.95);

                    return new FrontendTermPredictionDto
                    {
                        SubjectId = g.Key,
                        Subject = names.GetValueOrDefault(g.Key, g.Key),
                        CurrentTerm = (int)Math.Round(currentTermRaw),
                        PredictedNextTerm = predicted,
                        Confidence = Math.Round(confidence, 2),
                    };
                })
                .OrderBy(p => p.Subject)
                .ToList();

            return Ok(predictions);
        }

        // ── helpers ──────────────────────────────────────────────────────

        // Materialise this student's submitted attempts (with the test's
        // subject and the per-topic score summary), then fold to one row per
        // (subject, topic). Grouping is done in memory because PerTopic is a
        // jsonb value list, not a relational shape to GROUP BY.
        private async Task<List<TopicMasteryRow>> ComputeTopicMasteryAsync(
            string userId, CancellationToken ct)
        {
            var summaries = await (
                from a in _db.Set<PracticeAttempt>().AsNoTracking()
                where a.StudentId == userId && a.Status == AttemptStatus.Submitted
                join t in _db.Set<PracticeTest>().AsNoTracking() on a.TestId equals t.Id
                join s in _db.Set<AttemptScoreSummary>().AsNoTracking() on a.Id equals s.AttemptId
                select new { t.SubjectId, a.SubmittedAt, Summary = s }
            ).ToListAsync(ct);

            var flat = summaries
                .SelectMany(x => (x.Summary.PerTopic ?? new List<TopicScore>())
                    .Where(ts => ts.Total > 0)
                    .Select(ts => new
                    {
                        x.SubjectId,
                        x.SubmittedAt,
                        ts.Topic,
                        ts.Correct,
                        ts.Total,
                        ts.Percent,
                    }))
                .ToList();

            return flat
                .GroupBy(r => new { r.SubjectId, r.Topic })
                .Select(g =>
                {
                    var ordered = g.OrderBy(x => x.SubmittedAt ?? DateTime.MinValue).ToList();
                    var sumCorrect = ordered.Sum(x => x.Correct);
                    var sumTotal = ordered.Sum(x => x.Total);
                    var mastery = sumTotal > 0 ? (int)Math.Round(100.0 * sumCorrect / sumTotal) : 0;
                    var trend = ordered.Count >= 2 ? ordered[^1].Percent - ordered[0].Percent : 0;
                    return new TopicMasteryRow
                    {
                        SubjectId = g.Key.SubjectId,
                        Topic = g.Key.Topic,
                        Mastery = mastery,
                        Trend = trend,
                    };
                })
                .ToList();
        }

        // Display names for whatever study units this student's work is keyed
        // on. Mastery keys on a single string id per unit: a CAPS subject slug
        // for a high-school student, a Course.PracticeKey ("wits:appm1006a")
        // for a tertiary one. This resolved only the first kind, so every
        // prediction and mastery row a university student got back carried
        // `subject: "wits:appm1006a"` — the raw id, dressed up as a name. The
        // dashboard hid it by resolving names from its own course query, but
        // anything reading the field as documented printed the slug at a
        // student.
        //
        // Courses are looked up through the student's enrolments rather than
        // the whole shared catalog: the map only has to cover ids this student
        // can actually have work against, and every institution's course list
        // would grow without bound. PracticeKey is a computed property, so the
        // join is materialised first and keyed in memory.
        private async Task<Dictionary<string, string>> SubjectNamesAsync(CancellationToken ct)
        {
            var names = await _db.Set<Subject>()
                .AsNoTracking()
                .ToDictionaryAsync(x => x.Id, x => x.Name, ct);

            var userId = CurrentUserId();
            if (string.IsNullOrEmpty(userId)) return names;

            var courses = await (
                from sc in _db.Set<StudentCourse>().AsNoTracking()
                join c in _db.Set<Course>().AsNoTracking() on sc.CourseId equals c.Id
                where sc.StudentId == userId
                select new { c.InstitutionId, c.Slug, c.Name }
            ).ToListAsync(ct);

            foreach (var c in courses)
            {
                names[$"{c.InstitutionId}:{c.Slug}"] = c.Name;
            }

            return names;
        }

        private sealed class TopicMasteryRow
        {
            public string SubjectId { get; set; } = "";
            public string Topic { get; set; } = "";
            public int Mastery { get; set; }
            public int Trend { get; set; }
        }
    }
}
