using System.Security.Claims;
using Aptiverse.Api.Data;
using Aptiverse.Goals.Application.Frontend.Dtos;
using Aptiverse.Goals.Domain.Models.Goals;
using Aptiverse.Notifications.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;

namespace Aptiverse.Goals.Controllers
{
    [ApiController]
    [Route("api/goals")]
    [Authorize]
    public class GoalsController(
        ApplicationDbContext db,
        INotificationService notifications) : ControllerBase
    {
        private readonly ApplicationDbContext _db = db;
        private readonly INotificationService _notifications = notifications;

        private string? CurrentUserId()
            => User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirst("sub")?.Value
            ?? User.FindFirst("userId")?.Value;

        [HttpGet]
        public async Task<ActionResult<IEnumerable<FrontendGoalDto>>> GetGoals()
        {
            var userId = CurrentUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var goals = await _db.Set<Goal>()
                .AsNoTracking()
                .Where(g => g.StudentId == userId)
                .OrderBy(g => g.DueDate)
                .Select(g => new FrontendGoalDto
                {
                    Id = g.Id.ToString(),
                    SubjectId = g.SubjectId,
                    Title = g.Title,
                    Description = g.Description,
                    Target = g.Target,
                    Progress = g.Progress,
                    Status = g.Status,
                    DueDate = g.DueDate,
                    Category = g.Category,
                    Reward = g.Reward,
                })
                .ToListAsync();

            return Ok(goals);
        }

        [HttpPost]
        public async Task<ActionResult<FrontendGoalDto>> CreateGoal([FromBody] CreateGoalDto body)
        {
            var userId = CurrentUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();
            if (string.IsNullOrWhiteSpace(body.Title)) return BadRequest("Title is required.");

            var goal = new Goal
            {
                StudentId = userId,
                SubjectId = body.SubjectId,
                Title = body.Title.Trim(),
                Description = body.Description ?? "",
                Target = body.Target ?? "",
                Progress = Math.Clamp(body.Progress ?? 0, 0, 100),
                Status = string.IsNullOrWhiteSpace(body.Status) ? "active" : body.Status!,
                DueDate = body.DueDate ?? DateTime.UtcNow.AddDays(30),
                Category = string.IsNullOrWhiteSpace(body.Category) ? "academic" : body.Category!,
                Reward = body.Reward,
            };

            _db.Set<Goal>().Add(goal);
            await _db.SaveChangesAsync();

            var dto = new FrontendGoalDto
            {
                Id = goal.Id.ToString(),
                SubjectId = goal.SubjectId,
                Title = goal.Title,
                Description = goal.Description,
                Target = goal.Target,
                Progress = goal.Progress,
                Status = goal.Status,
                DueDate = goal.DueDate,
                Category = goal.Category,
                Reward = goal.Reward,
            };
            return CreatedAtAction(nameof(GetGoals), new { id = goal.Id }, dto);
        }

        [HttpPatch("{id}")]
        public async Task<ActionResult<FrontendGoalDto>> UpdateGoal(string id, [FromBody] UpdateGoalDto body)
        {
            var userId = CurrentUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();
            if (!long.TryParse(id, out var goalId)) return NotFound();

            var goal = await _db.Set<Goal>().FirstOrDefaultAsync(g => g.Id == goalId && g.StudentId == userId);
            if (goal is null) return NotFound();

            // Snapshot for the celebration trigger — we only enqueue when
            // this PATCH is the one that pushed the goal across the 100%
            // line. A subsequent update on an already-completed goal must
            // not re-fire the notification.
            var oldProgress = goal.Progress;

            if (body.Title is not null) goal.Title = body.Title.Trim();
            if (body.Description is not null) goal.Description = body.Description;
            if (body.Target is not null) goal.Target = body.Target;
            if (body.Progress is not null) goal.Progress = Math.Clamp(body.Progress.Value, 0, 100);
            if (body.Status is not null) goal.Status = body.Status;
            if (body.DueDate is not null) goal.DueDate = body.DueDate.Value;
            if (body.Category is not null) goal.Category = body.Category;
            if (body.SubjectId is not null) goal.SubjectId = body.SubjectId;
            if (body.Reward is not null) goal.Reward = body.Reward;
            goal.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();

            if (oldProgress < 100 && goal.Progress >= 100)
            {
                await _notifications.EnqueueAsync(
                    userId,
                    "celebration",
                    $"Goal achieved: {goal.Title}",
                    "You hit 100% — that's a real one. Open the goal to see your reward and the next step.",
                    $"/dashboard/goals/{goal.Id}");
            }

            return Ok(new FrontendGoalDto
            {
                Id = goal.Id.ToString(),
                SubjectId = goal.SubjectId,
                Title = goal.Title,
                Description = goal.Description,
                Target = goal.Target,
                Progress = goal.Progress,
                Status = goal.Status,
                DueDate = goal.DueDate,
                Category = goal.Category,
                Reward = goal.Reward,
            });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteGoal(string id)
        {
            var userId = CurrentUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();
            if (!long.TryParse(id, out var goalId)) return NotFound();

            var goal = await _db.Set<Goal>().FirstOrDefaultAsync(g => g.Id == goalId && g.StudentId == userId);
            if (goal is null) return NotFound();

            _db.Set<Goal>().Remove(goal);
            await _db.SaveChangesAsync();
            return NoContent();
        }

        [HttpGet("rewards")]
        public ActionResult<IEnumerable<FrontendRewardDto>> GetRewards()
            => Ok(Array.Empty<FrontendRewardDto>());

        [HttpGet("points/{studentId}")]
        public ActionResult<FrontendStudentPointsDto> GetPoints(string studentId)
        {
            // Points accrue from completed/verified goals, daily check-ins
            // and other reward triggers — none of which exist yet on a
            // fresh account. Zero defaults, not seeded.
            return Ok(new FrontendStudentPointsDto
            {
                StudentId = studentId,
                Balance = 0,
                StreakDays = 0,
                BadgeCount = 0,
            });
        }

        [HttpGet("verifications")]
        [Authorize(Roles = "Teacher,SchoolAdmin,Admin,Superuser")]
        public ActionResult<IEnumerable<FrontendVerificationDto>> GetVerifications()
            => Ok(Array.Empty<FrontendVerificationDto>());

        [HttpPost("verifications/{id}/approve")]
        [Authorize(Roles = "Teacher,SchoolAdmin,Admin,Superuser")]
        public IActionResult ApproveVerification(string id) => Ok(new { id, approved = true });

        [HttpPost("verifications/{id}/decline")]
        [Authorize(Roles = "Teacher,SchoolAdmin,Admin,Superuser")]
        public IActionResult DeclineVerification(string id) => Ok(new { id, approved = false });

        [HttpGet("{goalId}/milestones")]
        public async Task<ActionResult<IEnumerable<FrontendMilestoneDto>>> GetMilestones(string goalId)
        {
            var userId = CurrentUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();
            if (!long.TryParse(goalId, out var goalIdLong))
            {
                return Ok(Array.Empty<FrontendMilestoneDto>());
            }

            // Confirm the goal belongs to this user before reading its milestones.
            var owns = await _db.Set<Goal>()
                .AnyAsync(g => g.Id == goalIdLong && g.StudentId == userId);
            if (!owns) return NotFound();

            var milestones = await _db.Set<GoalMilestone>()
                .AsNoTracking()
                .Where(m => m.GoalId == goalIdLong)
                .OrderBy(m => m.Priority)
                .Select(m => new FrontendMilestoneDto
                {
                    Id = m.Id.ToString(),
                    GoalId = m.GoalId.ToString(),
                    Title = m.Title,
                    Description = m.Description,
                    Priority = m.Priority,
                    IsCompleted = m.IsCompleted,
                    RewardPoints = m.RewardPoints,
                })
                .ToListAsync();

            return Ok(milestones);
        }

        [HttpPatch("{goalId}/milestones/order")]
        public async Task<IActionResult> ReorderMilestones(string goalId, [FromBody] ReorderMilestonesDto body)
        {
            var userId = CurrentUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();
            if (!long.TryParse(goalId, out var goalIdLong)) return NotFound();
            if (body?.MilestoneIds is null || body.MilestoneIds.Length == 0) return NoContent();

            var owns = await _db.Set<Goal>()
                .AnyAsync(g => g.Id == goalIdLong && g.StudentId == userId);
            if (!owns) return NotFound();

            var byId = await _db.Set<GoalMilestone>()
                .Where(m => m.GoalId == goalIdLong)
                .ToDictionaryAsync(m => m.Id);

            // Apply new priority based on the position in the supplied id list.
            for (var i = 0; i < body.MilestoneIds.Length; i++)
            {
                if (!long.TryParse(body.MilestoneIds[i], out var mId)) continue;
                if (!byId.TryGetValue(mId, out var milestone)) continue;
                milestone.Priority = i + 1;
                milestone.UpdatedAt = DateTime.UtcNow;
            }

            await _db.SaveChangesAsync();
            return NoContent();
        }
    }

    public record FrontendMilestoneDto
    {
        [JsonPropertyName("id")] public string Id { get; init; } = "";
        [JsonPropertyName("goalId")] public string GoalId { get; init; } = "";
        [JsonPropertyName("title")] public string Title { get; init; } = "";
        [JsonPropertyName("description")] public string Description { get; init; } = "";
        [JsonPropertyName("priority")] public int Priority { get; init; }
        [JsonPropertyName("isCompleted")] public bool IsCompleted { get; init; }
        [JsonPropertyName("rewardPoints")] public int RewardPoints { get; init; }
    }

    public record ReorderMilestonesDto
    {
        [JsonPropertyName("milestoneIds")] public string[] MilestoneIds { get; init; } = Array.Empty<string>();
    }

    public record CreateGoalDto
    {
        [JsonPropertyName("title")] public string Title { get; init; } = "";
        [JsonPropertyName("description")] public string? Description { get; init; }
        [JsonPropertyName("target")] public string? Target { get; init; }
        [JsonPropertyName("progress")] public int? Progress { get; init; }
        [JsonPropertyName("status")] public string? Status { get; init; }
        [JsonPropertyName("dueDate")] public DateTime? DueDate { get; init; }
        [JsonPropertyName("category")] public string? Category { get; init; }
        [JsonPropertyName("subjectId")] public string? SubjectId { get; init; }
        [JsonPropertyName("reward")] public string? Reward { get; init; }
    }

    public record UpdateGoalDto
    {
        [JsonPropertyName("title")] public string? Title { get; init; }
        [JsonPropertyName("description")] public string? Description { get; init; }
        [JsonPropertyName("target")] public string? Target { get; init; }
        [JsonPropertyName("progress")] public int? Progress { get; init; }
        [JsonPropertyName("status")] public string? Status { get; init; }
        [JsonPropertyName("dueDate")] public DateTime? DueDate { get; init; }
        [JsonPropertyName("category")] public string? Category { get; init; }
        [JsonPropertyName("subjectId")] public string? SubjectId { get; init; }
        [JsonPropertyName("reward")] public string? Reward { get; init; }
    }
}
