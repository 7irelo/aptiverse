using System.Security.Claims;
using Aptiverse.AcademicPlanning.Application.Frontend.Dtos;
using Aptiverse.AcademicPlanning.Application.Storage;
using Aptiverse.AcademicPlanning.Domain.Models.AcademicPlanning;
using Aptiverse.Api.Data;
using Aptiverse.Domain.Models;
using Aptiverse.Notifications.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.AcademicPlanning.Controllers
{
    // FET-phase academic planning:
    //   - Curriculum catalog (NSC, IEB) and the canonical subjects per curriculum
    //   - The student's academic profile (which curriculum + grade + school)
    //   - The student's enrolled subjects (CRUD)
    //
    // Assessments + classes endpoints are kept for backward-compat but return
    // empty arrays — those become SBA tasks logged by the student in a follow-up.
    [ApiController]
    [Route("api/academic-planning")]
    [Authorize]
    public class AcademicPlanningController(
        ApplicationDbContext db,
        INotificationService notifications,
        IAssessmentUploadStorage uploads) : ControllerBase
    {
        private readonly ApplicationDbContext _db = db;
        private readonly INotificationService _notifications = notifications;
        private readonly IAssessmentUploadStorage _uploads = uploads;

        // Cap per-upload at 10 MB. Photos of handwritten work compressed
        // by a phone are typically 1–3 MB; 10 MB is plenty of headroom
        // without inviting accidental "upload a video by mistake".
        private const long MaxUploadBytes = 10 * 1024 * 1024;
        private static readonly HashSet<string> AllowedContentTypes =
            new(StringComparer.OrdinalIgnoreCase)
            {
                "image/jpeg",
                "image/png",
                "image/webp",
                "image/heic",
                "image/heif",
                "application/pdf",
            };

        private string? CurrentUserId()
            => User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirst("sub")?.Value
            ?? User.FindFirst("userId")?.Value;

        // --- Curriculum catalog ------------------------------------------------

        [HttpGet("curricula")]
        public async Task<ActionResult<IEnumerable<FrontendCurriculumDto>>> GetCurricula()
        {
            var rows = await _db.Set<Curriculum>()
                .AsNoTracking()
                .OrderBy(c => c.Name)
                .Select(c => new FrontendCurriculumDto
                {
                    Id = c.Id,
                    Name = c.Name,
                    ShortName = c.ShortName,
                    Description = c.Description,
                })
                .ToListAsync();
            return Ok(rows);
        }

        [HttpGet("curricula/{curriculumId}/subjects")]
        public async Task<ActionResult<IEnumerable<FrontendCatalogSubjectDto>>> GetCurriculumSubjects(string curriculumId)
        {
            var rows = await _db.Set<CurriculumSubject>()
                .AsNoTracking()
                .Where(cs => cs.CurriculumId == curriculumId)
                .Join(_db.Set<Subject>().AsNoTracking(),
                      cs => cs.SubjectId,
                      s => s.Id,
                      (cs, s) => new FrontendCatalogSubjectDto
                      {
                          Id = s.Id,
                          CurriculumSubjectId = cs.Id,
                          Code = s.Code,
                          Name = s.Name,
                          Category = s.Category,
                          LanguageType = s.LanguageType,
                          Description = s.Description,
                          IsCompulsory = cs.IsCompulsory,
                      })
                .OrderBy(r => r.Category)
                .ThenBy(r => r.Name)
                .ToListAsync();
            return Ok(rows);
        }

        // --- Student academic profile -----------------------------------------

        [HttpGet("me/profile")]
        public async Task<ActionResult<FrontendAcademicProfileDto>> GetProfile()
        {
            var userId = CurrentUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var user = await _db.Set<User>().AsNoTracking().FirstOrDefaultAsync(u => u.Id == userId);
            if (user is null) return NotFound();

            return Ok(new FrontendAcademicProfileDto
            {
                CurriculumId = user.CurriculumId,
                Grade = user.Grade,
                School = user.School,
            });
        }

        // Reset the current user's academic profile back to a clean slate:
        // drops all enrolled subjects (including compulsory) and all logged
        // assessments, and clears curriculum / grade / school. Intended for
        // end-to-end test setup; gated to Development by default so it
        // can't be hit accidentally in prod.
        [HttpPost("me/reset")]
        public async Task<IActionResult> ResetProfile([FromServices] IWebHostEnvironment env)
        {
            var userId = CurrentUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();
            if (!env.IsDevelopment() && !User.IsInRole("Admin") && !User.IsInRole("Superuser"))
            {
                return Forbid();
            }

            var assessments = await _db.Set<Assessment>()
                .Where(a => a.StudentId == userId).ToListAsync();
            _db.Set<Assessment>().RemoveRange(assessments);

            var subjects = await _db.Set<StudentSubject>()
                .Where(ss => ss.StudentId == userId).ToListAsync();
            _db.Set<StudentSubject>().RemoveRange(subjects);

            var user = await _db.Set<User>().FirstOrDefaultAsync(u => u.Id == userId);
            if (user is not null)
            {
                user.CurriculumId = null;
                user.Grade = null;
                user.School = null;
                user.UpdatedAt = DateTime.UtcNow;
            }

            await _db.SaveChangesAsync();
            return NoContent();
        }

        [HttpPatch("me/profile")]
        public async Task<ActionResult<FrontendAcademicProfileDto>> UpdateProfile([FromBody] FrontendUpdateAcademicProfileDto body)
        {
            var userId = CurrentUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var user = await _db.Set<User>().FirstOrDefaultAsync(u => u.Id == userId);
            if (user is null) return NotFound();

            if (body.CurriculumId is not null)
            {
                // Validate the curriculum exists so we don't store junk.
                var exists = await _db.Set<Curriculum>().AsNoTracking().AnyAsync(c => c.Id == body.CurriculumId);
                if (!exists) return BadRequest($"Unknown curriculum '{body.CurriculumId}'.");
                user.CurriculumId = body.CurriculumId;
            }
            if (body.Grade is not null)
            {
                if (body.Grade < 10 || body.Grade > 12) return BadRequest("Grade must be 10, 11, or 12.");
                user.Grade = body.Grade;
            }
            if (body.School is not null)
            {
                user.School = string.IsNullOrWhiteSpace(body.School) ? null : body.School.Trim();
            }

            user.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();

            return Ok(new FrontendAcademicProfileDto
            {
                CurriculumId = user.CurriculumId,
                Grade = user.Grade,
                School = user.School,
            });
        }

        // --- Student's enrolled subjects --------------------------------------

        [HttpGet("subjects")]
        public async Task<ActionResult<IEnumerable<FrontendSubjectDto>>> GetSubjects()
        {
            var userId = CurrentUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var rows = await _db.Set<StudentSubject>()
                .AsNoTracking()
                .Where(ss => ss.StudentId == userId)
                .Join(_db.Set<CurriculumSubject>().AsNoTracking(),
                      ss => ss.CurriculumSubjectId,
                      cs => cs.Id,
                      (ss, cs) => new { ss, cs })
                .Join(_db.Set<Subject>().AsNoTracking(),
                      x => x.cs.SubjectId,
                      s => s.Id,
                      (x, s) => new FrontendSubjectDto
                      {
                          Id = x.ss.Id.ToString(),
                          SubjectId = s.Id,
                          Code = s.Code,
                          Name = s.Name,
                          Category = s.Category,
                          LanguageType = s.LanguageType,
                          Grade = x.ss.Grade,
                          Teacher = x.ss.Teacher,
                          IsCompulsory = x.cs.IsCompulsory,
                          CreatedAt = x.ss.CreatedAt,
                      })
                .OrderBy(r => r.Category)
                .ThenBy(r => r.Name)
                .ToListAsync();

            return Ok(rows);
        }

        [HttpGet("subjects/{id}")]
        public async Task<ActionResult<FrontendSubjectDto>> GetSubject(string id)
        {
            var userId = CurrentUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();
            if (!long.TryParse(id, out var ssId)) return NotFound();

            var row = await _db.Set<StudentSubject>()
                .AsNoTracking()
                .Where(ss => ss.Id == ssId && ss.StudentId == userId)
                .Join(_db.Set<CurriculumSubject>().AsNoTracking(),
                      ss => ss.CurriculumSubjectId,
                      cs => cs.Id,
                      (ss, cs) => new { ss, cs })
                .Join(_db.Set<Subject>().AsNoTracking(),
                      x => x.cs.SubjectId,
                      s => s.Id,
                      (x, s) => new FrontendSubjectDto
                      {
                          Id = x.ss.Id.ToString(),
                          SubjectId = s.Id,
                          Code = s.Code,
                          Name = s.Name,
                          Category = s.Category,
                          LanguageType = s.LanguageType,
                          Grade = x.ss.Grade,
                          Teacher = x.ss.Teacher,
                          IsCompulsory = x.cs.IsCompulsory,
                          CreatedAt = x.ss.CreatedAt,
                      })
                .FirstOrDefaultAsync();

            return row is null ? NotFound() : Ok(row);
        }

        [HttpPost("subjects")]
        public async Task<ActionResult<FrontendSubjectDto>> AddSubject([FromBody] FrontendAddSubjectDto body)
        {
            var userId = CurrentUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();
            if (body.CurriculumSubjectId <= 0) return BadRequest("curriculumSubjectId is required.");

            var user = await _db.Set<User>().FirstOrDefaultAsync(u => u.Id == userId);
            if (user is null) return Unauthorized();

            var cs = await _db.Set<CurriculumSubject>()
                .Include(x => x.Subject)
                .FirstOrDefaultAsync(x => x.Id == body.CurriculumSubjectId);
            if (cs is null) return BadRequest("Unknown curriculum subject.");

            // The student must be on the same curriculum as the subject they're
            // adding. If they haven't picked one yet, infer it from this add.
            if (user.CurriculumId is null)
            {
                user.CurriculumId = cs.CurriculumId;
            }
            else if (user.CurriculumId != cs.CurriculumId)
            {
                return BadRequest("This subject isn't on your current curriculum.");
            }

            var grade = body.Grade ?? user.Grade ?? 12;
            if (grade < 10 || grade > 12) return BadRequest("Grade must be 10, 11, or 12.");
            if (user.Grade is null) user.Grade = grade;

            // Prevent duplicates — one StudentSubject row per curriculum-subject
            // per student. Re-enrolling in the same subject is a no-op.
            var existing = await _db.Set<StudentSubject>()
                .FirstOrDefaultAsync(ss => ss.StudentId == userId && ss.CurriculumSubjectId == body.CurriculumSubjectId);
            if (existing is not null)
            {
                return await GetSubject(existing.Id.ToString());
            }

            var enrolment = new StudentSubject
            {
                StudentId = userId,
                CurriculumSubjectId = body.CurriculumSubjectId,
                Grade = grade,
                Teacher = string.IsNullOrWhiteSpace(body.Teacher) ? null : body.Teacher.Trim(),
            };
            _db.Set<StudentSubject>().Add(enrolment);
            user.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();

            return await GetSubject(enrolment.Id.ToString());
        }

        [HttpDelete("subjects/{id}")]
        public async Task<IActionResult> RemoveSubject(string id)
        {
            var userId = CurrentUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();
            if (!long.TryParse(id, out var ssId)) return NotFound();

            var row = await _db.Set<StudentSubject>()
                .FirstOrDefaultAsync(ss => ss.Id == ssId && ss.StudentId == userId);
            if (row is null) return NotFound();

            _db.Set<StudentSubject>().Remove(row);
            await _db.SaveChangesAsync();
            return NoContent();
        }

        // --- Assessments (SBA tasks) ------------------------------------------

        private static readonly string[] AllowedTypes =
            ["test", "essay", "investigation", "practical", "exam", "project", "oral"];
        private static readonly string[] AllowedStatuses =
            ["scheduled", "in_progress", "submitted", "graded"];

        [HttpGet("assessments")]
        public async Task<ActionResult<IEnumerable<FrontendAssessmentDto>>> GetAssessments(
            [FromQuery] string? subjectId = null)
        {
            var userId = CurrentUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var query = _db.Set<Assessment>().AsNoTracking().Where(a => a.StudentId == userId);
            if (!string.IsNullOrWhiteSpace(subjectId)) query = query.Where(a => a.SubjectId == subjectId);

            // Materialise first; the Tasks property is a JSON-converted column
            // and projecting Tasks.Select(...) inside the IQueryable can't be
            // translated to SQL. Mapping in memory keeps everything in one
            // helper and the perf hit is negligible at this scale.
            var entities = await query.OrderBy(a => a.DueDate).ToListAsync();
            return Ok(entities.Select(MapToDto).ToList());
        }

        [HttpGet("assessments/{id}")]
        public async Task<ActionResult<FrontendAssessmentDto>> GetAssessment(string id)
        {
            var userId = CurrentUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();
            if (!long.TryParse(id, out var aId)) return NotFound();

            var a = await _db.Set<Assessment>()
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.Id == aId && x.StudentId == userId);
            if (a is null) return NotFound();

            return Ok(MapToDto(a));
        }

        [HttpPost("assessments")]
        public async Task<ActionResult<FrontendAssessmentDto>> CreateAssessment(
            [FromBody] FrontendCreateAssessmentDto body)
        {
            var userId = CurrentUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            if (string.IsNullOrWhiteSpace(body.Title)) return BadRequest("Title is required.");
            if (string.IsNullOrWhiteSpace(body.SubjectId)) return BadRequest("Subject is required.");

            var type = (body.Type ?? "test").ToLowerInvariant();
            if (!AllowedTypes.Contains(type)) return BadRequest($"Type must be one of: {string.Join(", ", AllowedTypes)}.");

            var status = (body.Status ?? "scheduled").ToLowerInvariant();
            if (!AllowedStatuses.Contains(status)) return BadRequest($"Status must be one of: {string.Join(", ", AllowedStatuses)}.");

            if (body.Weight < 0 || body.Weight > 100) return BadRequest("Weight must be between 0 and 100.");

            // The subject must be one the student is actually enrolled in
            // — otherwise they'd create an orphan assessment that doesn't
            // tie back to their dashboard.
            var enrolled = await _db.Set<StudentSubject>()
                .AsNoTracking()
                .AnyAsync(ss => ss.StudentId == userId &&
                                _db.Set<CurriculumSubject>()
                                    .Any(cs => cs.Id == ss.CurriculumSubjectId && cs.SubjectId == body.SubjectId));
            if (!enrolled) return BadRequest("You're not enrolled in that subject — add it first on the Subjects page.");

            var a = new Assessment
            {
                StudentId = userId,
                SubjectId = body.SubjectId,
                Title = body.Title.Trim(),
                Type = type,
                Weight = body.Weight,
                DueDate = body.DueDate,
                Status = status,
                PredictedMark = ClampMarkOrNull(body.PredictedMark),
                ActualMark = ClampMarkOrNull(body.ActualMark),
                Notes = string.IsNullOrWhiteSpace(body.Notes) ? null : body.Notes.Trim(),
            };
            _db.Set<Assessment>().Add(a);
            await _db.SaveChangesAsync();

            return CreatedAtAction(nameof(GetAssessment), new { id = a.Id }, MapToDto(a));
        }

        [HttpPatch("assessments/{id}")]
        public async Task<ActionResult<FrontendAssessmentDto>> UpdateAssessment(
            string id, [FromBody] FrontendUpdateAssessmentDto body)
        {
            var userId = CurrentUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();
            if (!long.TryParse(id, out var aId)) return NotFound();

            var a = await _db.Set<Assessment>()
                .FirstOrDefaultAsync(x => x.Id == aId && x.StudentId == userId);
            if (a is null) return NotFound();

            // Snapshot for the "draft submitted" trigger. We only fire the
            // notification on the transition *into* "submitted" — repeatedly
            // PATCHing an already-submitted assessment must not spam.
            var oldStatus = a.Status;

            if (body.SubjectId is not null) a.SubjectId = body.SubjectId;
            if (body.Title is not null) a.Title = body.Title.Trim();
            if (body.Type is not null)
            {
                var type = body.Type.ToLowerInvariant();
                if (!AllowedTypes.Contains(type)) return BadRequest($"Type must be one of: {string.Join(", ", AllowedTypes)}.");
                a.Type = type;
            }
            if (body.Weight is not null)
            {
                if (body.Weight < 0 || body.Weight > 100) return BadRequest("Weight must be between 0 and 100.");
                a.Weight = body.Weight.Value;
            }
            if (body.DueDate is not null) a.DueDate = body.DueDate.Value;
            if (body.Status is not null)
            {
                var status = body.Status.ToLowerInvariant();
                if (!AllowedStatuses.Contains(status)) return BadRequest($"Status must be one of: {string.Join(", ", AllowedStatuses)}.");
                a.Status = status;
            }
            if (body.PredictedMark is not null) a.PredictedMark = ClampMarkOrNull(body.PredictedMark);
            if (body.ActualMark is not null) a.ActualMark = ClampMarkOrNull(body.ActualMark);
            if (body.Notes is not null) a.Notes = string.IsNullOrWhiteSpace(body.Notes) ? null : body.Notes.Trim();
            if (body.Tasks is not null)
            {
                // Full replacement: empty list clears all tasks, a populated
                // list overwrites (so add/remove/reorder/check-off all flow
                // through one PATCH from the client).
                a.Tasks = body.Tasks
                    .Where(t => !string.IsNullOrWhiteSpace(t.Label))
                    .Select(t => new AssessmentTask { Label = t.Label.Trim(), Done = t.Done })
                    .ToList();
            }
            a.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();

            if (!string.Equals(oldStatus, "submitted", StringComparison.OrdinalIgnoreCase)
                && string.Equals(a.Status, "submitted", StringComparison.OrdinalIgnoreCase))
            {
                await _notifications.EnqueueAsync(
                    userId,
                    "celebration",
                    $"Draft submitted: {a.Title}",
                    "Nicely done — your work is in. We'll let you know once it's marked.",
                    $"/dashboard/academic/assessments/{a.Id}");
            }

            return Ok(MapToDto(a));
        }

        private static FrontendAssessmentDto MapToDto(Assessment a) =>
            new()
            {
                Id = a.Id.ToString(),
                SubjectId = a.SubjectId,
                Title = a.Title,
                Type = a.Type,
                Weight = a.Weight,
                DueDate = a.DueDate,
                Status = a.Status,
                PredictedMark = a.PredictedMark,
                ActualMark = a.ActualMark,
                Notes = a.Notes,
                Tasks = (a.Tasks ?? new List<AssessmentTask>())
                    .Select(t => new FrontendAssessmentTaskDto { Label = t.Label, Done = t.Done })
                    .ToList(),
                CreatedAt = a.CreatedAt,
            };

        [HttpDelete("assessments/{id}")]
        public async Task<IActionResult> DeleteAssessment(string id)
        {
            var userId = CurrentUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();
            if (!long.TryParse(id, out var aId)) return NotFound();

            var a = await _db.Set<Assessment>()
                .FirstOrDefaultAsync(x => x.Id == aId && x.StudentId == userId);
            if (a is null) return NotFound();

            _db.Set<Assessment>().Remove(a);
            await _db.SaveChangesAsync();
            return NoContent();
        }

        private static int? ClampMarkOrNull(int? m) =>
            m is null ? null : Math.Clamp(m.Value, 0, 100);

        // --- Assessment uploads ----------------------------------------------
        // Photos of handwritten working, reference PDFs, screenshots. Binary
        // lives on disk (via IAssessmentUploadStorage); the row tracks the
        // metadata. Auth boundary is the same as everything else on this
        // controller — student can only see / write their own.

        [HttpGet("assessments/{id}/uploads")]
        public async Task<ActionResult<IEnumerable<FrontendAssessmentUploadDto>>> GetUploads(string id)
        {
            var userId = CurrentUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();
            if (!long.TryParse(id, out var aId)) return NotFound();

            var owns = await _db.Set<Assessment>()
                .AnyAsync(a => a.Id == aId && a.StudentId == userId);
            if (!owns) return NotFound();

            var rows = await _db.Set<AssessmentUpload>()
                .AsNoTracking()
                .Where(u => u.AssessmentId == aId && u.StudentId == userId)
                .OrderByDescending(u => u.CreatedAt)
                .ToListAsync();

            return Ok(rows.Select(MapUploadToDto).ToList());
        }

        [HttpPost("assessments/{id}/uploads")]
        [RequestSizeLimit(MaxUploadBytes + 1024)]  // +1KB for multipart overhead
        public async Task<ActionResult<FrontendAssessmentUploadDto>> PostUpload(
            string id,
            IFormFile file,
            CancellationToken ct)
        {
            var userId = CurrentUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();
            if (!long.TryParse(id, out var aId)) return NotFound();
            if (file is null || file.Length == 0) return BadRequest("Empty upload.");
            if (file.Length > MaxUploadBytes)
                return BadRequest($"File too large. Max {MaxUploadBytes / (1024 * 1024)} MB.");

            var contentType = file.ContentType ?? "application/octet-stream";
            if (!AllowedContentTypes.Contains(contentType))
                return BadRequest("Unsupported file type. Allowed: JPG, PNG, WebP, HEIC, PDF.");

            var owns = await _db.Set<Assessment>()
                .AnyAsync(a => a.Id == aId && a.StudentId == userId, ct);
            if (!owns) return NotFound();

            string storagePath;
            await using (var stream = file.OpenReadStream())
            {
                storagePath = await _uploads.WriteAsync(userId, aId, file.FileName, stream, ct);
            }

            var row = new AssessmentUpload
            {
                AssessmentId = aId,
                StudentId = userId,
                Filename = SafeFilename(file.FileName),
                ContentType = contentType,
                SizeBytes = file.Length,
                StoragePath = storagePath,
            };
            _db.Set<AssessmentUpload>().Add(row);
            await _db.SaveChangesAsync(ct);

            return CreatedAtAction(
                nameof(DownloadUpload),
                new { id = aId.ToString(), uploadId = row.Id.ToString() },
                MapUploadToDto(row));
        }

        [HttpGet("assessments/{id}/uploads/{uploadId}")]
        public async Task<IActionResult> DownloadUpload(string id, string uploadId, CancellationToken ct)
        {
            var userId = CurrentUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();
            if (!long.TryParse(id, out var aId)) return NotFound();
            if (!long.TryParse(uploadId, out var uId)) return NotFound();

            var row = await _db.Set<AssessmentUpload>()
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Id == uId && u.AssessmentId == aId && u.StudentId == userId, ct);
            if (row is null) return NotFound();

            var stream = await _uploads.ReadAsync(row.StoragePath, ct);
            if (stream is null) return NotFound();

            return File(stream, row.ContentType, row.Filename);
        }

        [HttpDelete("assessments/{id}/uploads/{uploadId}")]
        public async Task<IActionResult> DeleteUpload(string id, string uploadId, CancellationToken ct)
        {
            var userId = CurrentUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();
            if (!long.TryParse(id, out var aId)) return NotFound();
            if (!long.TryParse(uploadId, out var uId)) return NotFound();

            var row = await _db.Set<AssessmentUpload>()
                .FirstOrDefaultAsync(u => u.Id == uId && u.AssessmentId == aId && u.StudentId == userId, ct);
            if (row is null) return NotFound();

            _db.Set<AssessmentUpload>().Remove(row);
            await _db.SaveChangesAsync(ct);
            // Best-effort delete the blob — the row going away is the
            // source of truth; an orphan file is a minor housekeeping
            // concern not a correctness bug.
            await _uploads.DeleteAsync(row.StoragePath, ct);

            return NoContent();
        }

        private FrontendAssessmentUploadDto MapUploadToDto(AssessmentUpload u) =>
            new()
            {
                Id = u.Id.ToString(),
                Filename = u.Filename,
                ContentType = u.ContentType,
                SizeBytes = u.SizeBytes,
                Url = Url.Action(
                    nameof(DownloadUpload),
                    new { id = u.AssessmentId.ToString(), uploadId = u.Id.ToString() })
                    ?? $"/api/academic-planning/assessments/{u.AssessmentId}/uploads/{u.Id}",
                CreatedAt = u.CreatedAt,
            };

        private static string SafeFilename(string raw)
        {
            if (string.IsNullOrWhiteSpace(raw)) return "upload";
            var name = Path.GetFileName(raw);
            // Strip any control characters or quotes that would break
            // the Content-Disposition response header.
            var cleaned = new string(name.Where(c => !char.IsControl(c) && c != '"').ToArray());
            return cleaned.Length > 0 ? cleaned : "upload";
        }

        [HttpGet("classes")]
        [Authorize(Roles = "Teacher,SchoolAdmin,Admin,Superuser")]
        public ActionResult<IEnumerable<FrontendClassRecordDto>> GetClasses()
            => Ok(Array.Empty<FrontendClassRecordDto>());
    }
}
