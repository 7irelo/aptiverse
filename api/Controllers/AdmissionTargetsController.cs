using System.Security.Claims;
using Aptiverse.AcademicPlanning.Application.Frontend.Dtos;
using Aptiverse.AcademicPlanning.Domain.Models.AcademicPlanning;
using Aptiverse.Api.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.AcademicPlanning.Controllers
{
    // Admission and progression targets: the requirements a student researched
    // for the place they are trying to get to.
    //
    // This controller is deliberately thin, and deliberately incurious. It
    // stores what the student entered, validates that it is well-formed, and
    // hands it back. It does not know what UCT wants, does not score the
    // student against anything, and does not generate a goal itself.
    //
    // Goal generation is the client's job, through the existing POST /api/goals.
    // That is not laziness: the goals endpoint owns the baseline rule (a
    // rewarded target at or below the student's baseline is refused), and
    // routing generation through it means a goal born from a target is
    // measured, priced and paid by exactly the same code as a goal the student
    // typed by hand. A bulk-create path here would be a second implementation
    // of that rule, and the two would drift.
    //
    // No [RequiresFeature]. This is free for everyone, on purpose: a student
    // who cannot afford a subscription is precisely the student who most needs
    // to know they are 12 marks short of the degree they want.
    [ApiController]
    [Route("api/admission-targets")]
    [Authorize]
    public class AdmissionTargetsController(ApplicationDbContext db) : ControllerBase
    {
        private readonly ApplicationDbContext _db = db;

        // An institution or programme name long enough to be a paste accident
        // rather than a name. Free text, but not unbounded free text.
        private const int MaxNameLength = 160;
        private const int MaxNoteLength = 500;

        // A target with more granular rows than this is not granular, it is a
        // stuck key. High school runs 7 subjects; a degree year runs maybe 10.
        private const int MaxRequirements = 30;

        private string? CurrentUserId()
            => User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirst("sub")?.Value
            ?? User.FindFirst("userId")?.Value;

        [HttpGet]
        public async Task<ActionResult<IEnumerable<FrontendAdmissionTargetDto>>> GetTargets(CancellationToken ct)
        {
            var userId = CurrentUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var targets = await _db.Set<AdmissionTarget>()
                .AsNoTracking()
                .Include(t => t.Requirements)
                .Where(t => t.StudentId == userId)
                .OrderBy(t => t.Status == AdmissionTargetStatuses.Archived)
                .ThenBy(t => t.Deadline ?? DateTime.MaxValue)
                .ThenByDescending(t => t.CreatedAt)
                .ToListAsync(ct);

            return Ok(targets.Select(ToDto).ToList());
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<FrontendAdmissionTargetDto>> GetTarget(string id, CancellationToken ct)
        {
            var userId = CurrentUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();
            if (!long.TryParse(id, out var targetId)) return NotFound();

            var target = await _db.Set<AdmissionTarget>()
                .AsNoTracking()
                .Include(t => t.Requirements)
                .FirstOrDefaultAsync(t => t.Id == targetId && t.StudentId == userId, ct);
            if (target is null) return NotFound();

            return Ok(ToDto(target));
        }

        [HttpPost]
        public async Task<ActionResult<FrontendAdmissionTargetDto>> CreateTarget(
            [FromBody] FrontendCreateAdmissionTargetDto body, CancellationToken ct)
        {
            var userId = CurrentUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var institution = Clean(body.Institution, MaxNameLength);
            var programme = Clean(body.Programme, MaxNameLength);
            if (string.IsNullOrEmpty(institution)) return BadRequest("Name the institution you're aiming at.");
            if (string.IsNullOrEmpty(programme)) return BadRequest("Name the programme you're aiming at.");

            var kind = string.IsNullOrWhiteSpace(body.Kind) ? AdmissionTargetKinds.Admission : body.Kind!.Trim();
            if (!AdmissionTargetKinds.All.Contains(kind)) return BadRequest($"Unknown target kind '{kind}'.");

            var stageError = ValidateStage(kind, body.Stage, out var stage);
            if (stageError is not null) return BadRequest(stageError);

            var overallError = ValidateOverall(body.OverallUnit, body.OverallRequired, out var overallUnit, out var overallRequired);
            if (overallError is not null) return BadRequest(overallError);

            var requirementsError = NormaliseRequirements(body.Requirements, out var requirements);
            if (requirementsError is not null) return BadRequest(requirementsError);

            var target = new AdmissionTarget
            {
                StudentId = userId,
                Institution = institution,
                Programme = programme,
                Kind = kind,
                Stage = stage,
                OverallUnit = overallUnit,
                OverallRequired = overallRequired,
                Deadline = body.Deadline,
                SourceNote = Clean(body.SourceNote, MaxNoteLength) is { Length: > 0 } n ? n : null,
                Status = AdmissionTargetStatuses.Active,
            };

            foreach (var (unitId, minimum) in requirements)
            {
                target.Requirements.Add(new AdmissionRequirement { UnitId = unitId, MinimumPercent = minimum });
            }

            _db.Set<AdmissionTarget>().Add(target);
            await _db.SaveChangesAsync(ct);

            return CreatedAtAction(nameof(GetTarget), new { id = target.Id.ToString() }, ToDto(target));
        }

        [HttpPatch("{id}")]
        public async Task<ActionResult<FrontendAdmissionTargetDto>> UpdateTarget(
            string id, [FromBody] FrontendUpdateAdmissionTargetDto body, CancellationToken ct)
        {
            var userId = CurrentUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();
            if (!long.TryParse(id, out var targetId)) return NotFound();

            var target = await _db.Set<AdmissionTarget>()
                .Include(t => t.Requirements)
                .FirstOrDefaultAsync(t => t.Id == targetId && t.StudentId == userId, ct);
            if (target is null) return NotFound();

            if (body.Institution is not null)
            {
                var institution = Clean(body.Institution, MaxNameLength);
                if (string.IsNullOrEmpty(institution)) return BadRequest("Name the institution you're aiming at.");
                target.Institution = institution;
            }

            if (body.Programme is not null)
            {
                var programme = Clean(body.Programme, MaxNameLength);
                if (string.IsNullOrEmpty(programme)) return BadRequest("Name the programme you're aiming at.");
                target.Programme = programme;
            }

            var kind = target.Kind;
            if (body.Kind is not null)
            {
                kind = body.Kind.Trim();
                if (!AdmissionTargetKinds.All.Contains(kind)) return BadRequest($"Unknown target kind '{kind}'.");
                target.Kind = kind;
            }

            // Stage is re-validated whenever either half of the pair moves: a
            // target switched from progression to admission must not keep an
            // orphan "masters" stage hanging off it.
            if (body.Stage is not null || body.Kind is not null)
            {
                var stageInput = body.Stage ?? target.Stage;
                var stageError = ValidateStage(kind, stageInput, out var stage);
                if (stageError is not null) return BadRequest(stageError);
                target.Stage = stage;
            }

            if (body.OverallUnit is not null || body.OverallRequired is not null)
            {
                var unitInput = body.OverallUnit ?? target.OverallUnit;
                var requiredInput = body.OverallRequired ?? target.OverallRequired;
                var overallError = ValidateOverall(unitInput, requiredInput, out var overallUnit, out var overallRequired);
                if (overallError is not null) return BadRequest(overallError);
                target.OverallUnit = overallUnit;
                target.OverallRequired = overallRequired;
            }

            if (body.Deadline is not null) target.Deadline = body.Deadline;
            if (body.SourceNote is not null)
            {
                var note = Clean(body.SourceNote, MaxNoteLength);
                target.SourceNote = string.IsNullOrEmpty(note) ? null : note;
            }

            if (body.Status is not null)
            {
                var status = body.Status.Trim();
                if (!AdmissionTargetStatuses.All.Contains(status)) return BadRequest($"Unknown status '{status}'.");
                target.Status = status;
            }

            if (body.Requirements is not null)
            {
                var requirementsError = NormaliseRequirements(body.Requirements, out var requirements);
                if (requirementsError is not null) return BadRequest(requirementsError);

                // Reconcile rather than delete-and-recreate. A requirement row
                // carries GoalId, and blowing the rows away would orphan every
                // goal the student had already generated: they would come back
                // to a page offering to generate goals they are already working
                // on. So a row whose unit survives the edit keeps its identity,
                // and only a genuinely removed unit loses its link.
                var incoming = requirements.ToDictionary(r => r.UnitId, r => r.MinimumPercent, StringComparer.Ordinal);

                foreach (var existing in target.Requirements.ToList())
                {
                    if (incoming.TryGetValue(existing.UnitId, out var minimum))
                    {
                        if (existing.MinimumPercent != minimum)
                        {
                            existing.MinimumPercent = minimum;
                            existing.UpdatedAt = DateTime.UtcNow;
                        }
                        incoming.Remove(existing.UnitId);
                    }
                    else
                    {
                        target.Requirements.Remove(existing);
                        _db.Set<AdmissionRequirement>().Remove(existing);
                    }
                }

                foreach (var (unitId, minimum) in incoming)
                {
                    target.Requirements.Add(new AdmissionRequirement { UnitId = unitId, MinimumPercent = minimum });
                }
            }

            target.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync(ct);

            return Ok(ToDto(target));
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTarget(string id, CancellationToken ct)
        {
            var userId = CurrentUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();
            if (!long.TryParse(id, out var targetId)) return NotFound();

            var target = await _db.Set<AdmissionTarget>()
                .Include(t => t.Requirements)
                .FirstOrDefaultAsync(t => t.Id == targetId && t.StudentId == userId, ct);
            if (target is null) return NotFound();

            // Goals generated from this target are deliberately left alone. The
            // student set out to reach 70% in Maths; abandoning the UCT
            // application does not make that goal a lie, and silently deleting
            // work they may still want would be worse than leaving a goal they
            // can remove themselves in one click.
            _db.Set<AdmissionTarget>().Remove(target);
            await _db.SaveChangesAsync(ct);
            return NoContent();
        }

        // Records which goal a requirement produced.
        //
        // Called by the client straight after POST /api/goals succeeds. Keeping
        // the link server-side is what makes generation idempotent: without it
        // the page would have to guess which goals came from which requirement
        // by matching subject and target value, and would guess wrong the first
        // time a student set a manual goal that happened to match.
        [HttpPatch("{id}/requirements/{requirementId}")]
        public async Task<ActionResult<FrontendAdmissionRequirementDto>> LinkRequirementGoal(
            string id, string requirementId, [FromBody] FrontendLinkRequirementGoalDto body, CancellationToken ct)
        {
            var userId = CurrentUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();
            if (!long.TryParse(id, out var targetId) || !long.TryParse(requirementId, out var reqId))
                return NotFound();

            var owns = await _db.Set<AdmissionTarget>()
                .AnyAsync(t => t.Id == targetId && t.StudentId == userId, ct);
            if (!owns) return NotFound();

            var requirement = await _db.Set<AdmissionRequirement>()
                .FirstOrDefaultAsync(r => r.Id == reqId && r.AdmissionTargetId == targetId, ct);
            if (requirement is null) return NotFound();

            // An explicit null unlinks, which is how the client recovers when
            // the student deletes the generated goal from the goals page.
            if (string.IsNullOrWhiteSpace(body.GoalId))
            {
                requirement.GoalId = null;
            }
            else
            {
                if (!long.TryParse(body.GoalId, out var goalId)) return BadRequest("goalId must be a goal id.");
                requirement.GoalId = goalId;
            }

            requirement.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync(ct);

            return Ok(ToRequirementDto(requirement));
        }

        // --- validation --------------------------------------------------------

        private static string? Clean(string? raw, int max)
        {
            var trimmed = (raw ?? "").Trim();
            return trimmed.Length > max ? trimmed[..max] : trimmed;
        }

        private static string? ValidateStage(string kind, string? raw, out string? stage)
        {
            stage = null;
            if (kind != AdmissionTargetKinds.Progression) return null;   // admission carries no stage.

            var value = (raw ?? "").Trim();
            if (value.Length == 0) return "Pick what you're progressing to.";
            if (!AdmissionStages.All.Contains(value)) return $"Unknown stage '{value}'.";

            stage = value;
            return null;
        }

        private static string? ValidateOverall(string? rawUnit, int? rawRequired, out string? unit, out int? required)
        {
            unit = null;
            required = null;

            var value = (rawUnit ?? "").Trim();
            if (value.Length == 0)
            {
                // No overall requirement is a real answer, not a missing one:
                // plenty of programmes gate purely on subject minimums.
                return rawRequired is null
                    ? null
                    : "Pick whether that number is an APS score or an average.";
            }

            if (!AdmissionOverallUnits.All.Contains(value)) return $"Unknown requirement unit '{value}'.";
            if (rawRequired is null) return "Enter the number you researched.";

            // The upper bound differs by what the number means. An average is a
            // percentage and cannot exceed 100. APS is scored on a scale the
            // institution sets, so we bound it only loosely: we are not in the
            // business of asserting what a valid APS is, only of catching a
            // fat-fingered 700.
            var max = value == AdmissionOverallUnits.Average ? 100 : 100;
            if (rawRequired < 1 || rawRequired > max)
                return value == AdmissionOverallUnits.Average
                    ? "A required average has to be between 1 and 100."
                    : "That APS looks wrong. Check the number against your source.";

            unit = value;
            required = rawRequired;
            return null;
        }

        private static string? NormaliseRequirements(
            IList<FrontendAdmissionRequirementInputDto>? raw,
            out List<(string UnitId, int MinimumPercent)> requirements)
        {
            requirements = [];
            if (raw is null || raw.Count == 0) return null;
            if (raw.Count > MaxRequirements) return $"That's more than {MaxRequirements} requirements. Trim it to the ones that gate your place.";

            var seen = new HashSet<string>(StringComparer.Ordinal);
            foreach (var r in raw)
            {
                var unitId = (r.UnitId ?? "").Trim();
                if (unitId.Length == 0) return "Every requirement needs a subject or course.";
                if (r.MinimumPercent is < 1 or > 100) return "A minimum mark has to be between 1 and 100.";

                // The unique index would refuse a duplicate anyway, but a 500
                // from a constraint violation is a worse answer than a sentence.
                if (!seen.Add(unitId)) return "You've listed the same one twice. One minimum per subject or course.";

                requirements.Add((unitId, r.MinimumPercent));
            }

            return null;
        }

        // --- mapping -----------------------------------------------------------

        private static FrontendAdmissionRequirementDto ToRequirementDto(AdmissionRequirement r) => new()
        {
            Id = r.Id.ToString(),
            UnitId = r.UnitId,
            MinimumPercent = r.MinimumPercent,
            GoalId = r.GoalId?.ToString(),
        };

        private static FrontendAdmissionTargetDto ToDto(AdmissionTarget t) => new()
        {
            Id = t.Id.ToString(),
            Institution = t.Institution,
            Programme = t.Programme,
            Kind = t.Kind,
            Stage = t.Stage,
            OverallUnit = t.OverallUnit,
            OverallRequired = t.OverallRequired,
            Deadline = t.Deadline,
            SourceNote = t.SourceNote,
            Status = t.Status,
            CreatedAt = t.CreatedAt,
            Requirements = t.Requirements
                .OrderBy(r => r.Id)
                .Select(ToRequirementDto)
                .ToList(),
        };
    }
}
