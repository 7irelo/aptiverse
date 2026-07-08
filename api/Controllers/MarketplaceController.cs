using System.Security.Claims;
using System.Text.Json.Serialization;
using Aptiverse.Api.Data;
using Aptiverse.Api.Data.Notifications;
using Aptiverse.Domain.Models;
using Aptiverse.Marketplace.Application.Frontend.Dtos;
using Aptiverse.Marketplace.Domain.Models.Marketplace;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Marketplace.Controllers
{
    // Tutor discovery only. Students find tutors to connect and meet with;
    // Aptiverse does not facilitate the tutoring, take payment, or run a course
    // marketplace. Tutors subscribe to be discoverable. Reviews are real, keyed
    // to the tutor's identity-user id.
    [ApiController]
    [Route("api/marketplace")]
    [Authorize]
    public class MarketplaceController(ApplicationDbContext db, TutorNotifier notifier) : ControllerBase
    {
        private readonly ApplicationDbContext _db = db;
        private readonly TutorNotifier _notifier = notifier;

        private string? CurrentUserId()
            => User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirst("sub")?.Value
            ?? User.FindFirst("userId")?.Value;

        // Discovery: tutors who are accepting new students, most reputable first.
        [HttpGet("tutors")]
        public async Task<ActionResult<IEnumerable<FrontendTutorDto>>> GetTutors(CancellationToken ct)
        {
            var rows = await (from t in _db.Set<Tutor>().AsNoTracking()
                              where t.AcceptingStudents
                              join u in _db.Set<User>().AsNoTracking() on t.UserId equals u.Id
                              select new { t, u }).ToListAsync(ct);

            var tutors = rows
                .Select(x => ToTutorDto(x.t, x.u))
                .OrderByDescending(d => d.Verified)
                .ThenByDescending(d => d.Rating)
                .ThenBy(d => d.Name)
                .ToList();
            return Ok(tutors);
        }

        [HttpGet("tutors/{id}")]
        public async Task<ActionResult<FrontendTutorDto>> GetTutor(string id, CancellationToken ct)
        {
            var row = await (from t in _db.Set<Tutor>().AsNoTracking()
                             where t.UserId == id
                             join u in _db.Set<User>().AsNoTracking() on t.UserId equals u.Id
                             select new { t, u }).FirstOrDefaultAsync(ct);
            if (row is null) return NotFound();
            return Ok(ToTutorDto(row.t, row.u));
        }

        private static FrontendTutorDto ToTutorDto(Tutor t, User u) => new()
        {
            Id = t.UserId,
            Name = $"{u.FirstName} {u.LastName}".Trim(),
            Subjects = string.IsNullOrWhiteSpace(t.Subjects)
                ? []
                : t.Subjects.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries),
            Qualification = t.Qualification ?? "",
            Specialization = t.Specialization ?? "",
            Bio = t.Bio ?? "",
            YearsOfExperience = t.YearsOfExperience,
            TeachingStyle = t.TeachingStyle ?? "",
            Rating = t.Rating,
            ReviewCount = t.TotalReviews,
            Verified = t.IsVerified,
        };

        [HttpGet("tutors/{id}/reviews")]
        public async Task<ActionResult<IEnumerable<FrontendReviewDto>>> GetTutorReviews(
            string id, CancellationToken ct)
            => Ok(await ReviewsForAsync(id, ct));

        // The logged-in tutor's own public profile (showcase). 404 when they
        // haven't set one up yet, which the profile page treats as an empty
        // state prompting them to complete it.
        [HttpGet("tutor/me")]
        public async Task<ActionResult<FrontendTutorProfileDto>> GetMyProfile(CancellationToken ct)
        {
            var userId = CurrentUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var t = await _db.Set<Tutor>()
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.UserId == userId, ct);
            if (t is null) return NotFound();

            return Ok(ToProfileDto(t));
        }

        // Create or update the logged-in tutor's public profile. Upserts the
        // marketplace.tutors row keyed on the identity user id. Rating, review
        // count and verification are system-managed and not editable here.
        [HttpPut("tutor/me")]
        public async Task<ActionResult<FrontendTutorProfileDto>> UpdateMyProfile(
            [FromBody] UpdateTutorProfileDto body, CancellationToken ct)
        {
            var userId = CurrentUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var t = await _db.Set<Tutor>().FirstOrDefaultAsync(x => x.UserId == userId, ct);
            if (t is null)
            {
                t = new Tutor
                {
                    UserId = userId,
                    Qualification = "",
                    Specialization = "",
                    Bio = "",
                    TeachingStyle = "",
                };
                _db.Set<Tutor>().Add(t);
            }

            if (body.Qualification is not null) t.Qualification = body.Qualification.Trim();
            if (body.Specialization is not null) t.Specialization = body.Specialization.Trim();
            if (body.Bio is not null) t.Bio = body.Bio.Trim();
            if (body.TeachingStyle is not null) t.TeachingStyle = body.TeachingStyle.Trim();
            if (body.YearsOfExperience is not null) t.YearsOfExperience = Math.Max(0, body.YearsOfExperience.Value);
            if (body.AcceptingStudents is not null) t.AcceptingStudents = body.AcceptingStudents.Value;
            if (body.AvailableDays is not null) t.AvailableDays = body.AvailableDays.Trim();
            if (body.EarliestHour is not null) t.EarliestHour = Math.Clamp(body.EarliestHour.Value, 0, 23);
            if (body.LatestHour is not null) t.LatestHour = Math.Clamp(body.LatestHour.Value, 0, 23);
            if (body.Subjects is not null) t.Subjects = body.Subjects.Trim();
            if (body.NotifyOnConnection is not null) t.NotifyOnConnection = body.NotifyOnConnection.Value;
            if (body.NotifyOnReview is not null) t.NotifyOnReview = body.NotifyOnReview.Value;
            if (body.WeeklySummary is not null) t.WeeklySummary = body.WeeklySummary.Value;
            t.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync(ct);
            return Ok(ToProfileDto(t));
        }

        private static FrontendTutorProfileDto ToProfileDto(Tutor t) => new()
        {
            Id = t.Id.ToString(),
            Qualification = t.Qualification ?? "",
            Specialization = t.Specialization ?? "",
            Bio = t.Bio ?? "",
            YearsOfExperience = t.YearsOfExperience,
            TeachingStyle = t.TeachingStyle ?? "",
            IsVerified = t.IsVerified,
            Rating = t.Rating,
            TotalReviews = t.TotalReviews,
            AcceptingStudents = t.AcceptingStudents,
            AvailableDays = t.AvailableDays ?? "",
            EarliestHour = t.EarliestHour,
            LatestHour = t.LatestHour,
            Subjects = t.Subjects ?? "",
            NotifyOnConnection = t.NotifyOnConnection,
            NotifyOnReview = t.NotifyOnReview,
            WeeklySummary = t.WeeklySummary,
        };

        // The logged-in tutor's own reviews (for the tutor dashboard/reviews page).
        [HttpGet("tutor/reviews")]
        public async Task<ActionResult<IEnumerable<FrontendReviewDto>>> GetMyReviews(CancellationToken ct)
        {
            var userId = CurrentUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();
            return Ok(await ReviewsForAsync(userId, ct));
        }

        // A student leaves a review for a tutor. Records it, folds it into the
        // tutor's running rating aggregate, and notifies the tutor (in-app
        // always, email if their preference is on).
        [HttpPost("tutors/{tutorUserId}/reviews")]
        public async Task<ActionResult<FrontendReviewDto>> CreateReview(
            string tutorUserId, [FromBody] CreateReviewDto body, CancellationToken ct)
        {
            var userId = CurrentUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();
            if (string.IsNullOrWhiteSpace(tutorUserId)) return BadRequest("tutor is required.");
            if (tutorUserId == userId) return BadRequest("You can't review yourself.");

            var rating = Math.Clamp(body.Rating, 1, 5);

            var student = await _db.Set<User>().AsNoTracking().FirstOrDefaultAsync(u => u.Id == userId, ct);
            var studentName = student is null
                ? "A student"
                : $"{student.FirstName} {student.LastName}".Trim();
            if (string.IsNullOrWhiteSpace(studentName)) studentName = "A student";

            var review = new Review
            {
                TutorUserId = tutorUserId,
                StudentId = userId,
                StudentName = studentName,
                Rating = rating,
                Body = body.Body?.Trim() ?? "",
            };
            _db.Set<Review>().Add(review);

            var tutor = await _db.Set<Tutor>().FirstOrDefaultAsync(t => t.UserId == tutorUserId, ct);
            if (tutor is not null)
            {
                var total = tutor.TotalReviews + 1;
                tutor.Rating = ((tutor.Rating * tutor.TotalReviews) + rating) / total;
                tutor.TotalReviews = total;
                tutor.UpdatedAt = DateTime.UtcNow;
            }

            await _db.SaveChangesAsync(ct);

            await _notifier.NotifyReviewAsync(tutorUserId, studentName, rating, ct);

            return Ok(new FrontendReviewDto
            {
                Id = review.Id.ToString(),
                Student = studentName,
                Rating = rating,
                Body = review.Body,
                When = review.CreatedAt,
            });
        }

        private Task<List<FrontendReviewDto>> ReviewsForAsync(string tutorUserId, CancellationToken ct)
            => _db.Set<Review>()
                .AsNoTracking()
                .Where(r => r.TutorUserId == tutorUserId)
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => new FrontendReviewDto
                {
                    Id = r.Id.ToString(),
                    Student = r.StudentName,
                    Rating = r.Rating,
                    Body = r.Body,
                    When = r.CreatedAt,
                })
                .ToListAsync(ct);
    }

    public record FrontendTutorProfileDto
    {
        [JsonPropertyName("id")] public string Id { get; init; } = "";
        [JsonPropertyName("qualification")] public string Qualification { get; init; } = "";
        [JsonPropertyName("specialization")] public string Specialization { get; init; } = "";
        [JsonPropertyName("bio")] public string Bio { get; init; } = "";
        [JsonPropertyName("yearsOfExperience")] public int YearsOfExperience { get; init; }
        [JsonPropertyName("teachingStyle")] public string TeachingStyle { get; init; } = "";
        [JsonPropertyName("isVerified")] public bool IsVerified { get; init; }
        [JsonPropertyName("rating")] public double Rating { get; init; }
        [JsonPropertyName("totalReviews")] public int TotalReviews { get; init; }
        [JsonPropertyName("acceptingStudents")] public bool AcceptingStudents { get; init; }
        [JsonPropertyName("availableDays")] public string AvailableDays { get; init; } = "";
        [JsonPropertyName("earliestHour")] public int EarliestHour { get; init; }
        [JsonPropertyName("latestHour")] public int LatestHour { get; init; }
        [JsonPropertyName("subjects")] public string Subjects { get; init; } = "";
        [JsonPropertyName("notifyOnConnection")] public bool NotifyOnConnection { get; init; }
        [JsonPropertyName("notifyOnReview")] public bool NotifyOnReview { get; init; }
        [JsonPropertyName("weeklySummary")] public bool WeeklySummary { get; init; }
    }

    public record UpdateTutorProfileDto
    {
        [JsonPropertyName("qualification")] public string? Qualification { get; init; }
        [JsonPropertyName("specialization")] public string? Specialization { get; init; }
        [JsonPropertyName("bio")] public string? Bio { get; init; }
        [JsonPropertyName("teachingStyle")] public string? TeachingStyle { get; init; }
        [JsonPropertyName("yearsOfExperience")] public int? YearsOfExperience { get; init; }
        [JsonPropertyName("acceptingStudents")] public bool? AcceptingStudents { get; init; }
        [JsonPropertyName("availableDays")] public string? AvailableDays { get; init; }
        [JsonPropertyName("earliestHour")] public int? EarliestHour { get; init; }
        [JsonPropertyName("latestHour")] public int? LatestHour { get; init; }
        [JsonPropertyName("subjects")] public string? Subjects { get; init; }
        [JsonPropertyName("notifyOnConnection")] public bool? NotifyOnConnection { get; init; }
        [JsonPropertyName("notifyOnReview")] public bool? NotifyOnReview { get; init; }
        [JsonPropertyName("weeklySummary")] public bool? WeeklySummary { get; init; }
    }

    public record CreateReviewDto
    {
        [JsonPropertyName("rating")] public int Rating { get; init; }
        [JsonPropertyName("body")] public string? Body { get; init; }
    }
}
