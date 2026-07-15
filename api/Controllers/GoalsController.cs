using System.Security.Claims;
using System.Text.Json.Serialization;
using Aptiverse.Api.Data;
using Aptiverse.Api.Services.Goals;
using Aptiverse.Domain.Models;
using Aptiverse.Goals.Application.Frontend.Dtos;
using Aptiverse.Goals.Domain.Models.Goals;
using Aptiverse.Notifications.Application.Services;
using Aptiverse.Practice.Domain.Models.Practice;
using Aptiverse.Wellbeing.Domain.Models.Wellbeing;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Goals.Controllers
{
    [ApiController]
    [Route("api/goals")]
    [Authorize]
    public class GoalsController(
        ApplicationDbContext db,
        GoalEvaluator evaluator,
        INotificationService notifications) : ControllerBase
    {
        private readonly ApplicationDbContext _db = db;
        private readonly GoalEvaluator _evaluator = evaluator;
        private readonly INotificationService _notifications = notifications;

        private string? CurrentUserId()
            => User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirst("sub")?.Value
            ?? User.FindFirst("userId")?.Value;

        // Every read re-measures against the evidence first. It costs a few
        // queries, and it buys the guarantee that the number on the page is the
        // number the data supports, whatever we did or didn't hook up.
        [HttpGet]
        public async Task<ActionResult<IEnumerable<FrontendGoalDto>>> GetGoals(CancellationToken ct)
        {
            var userId = CurrentUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var goals = await _evaluator.EvaluateAllAsync(userId, ct);

            var goalIds = goals.Select(g => g.Id).ToList();
            var allowances = await _db.Set<GoalAllowance>()
                .AsNoTracking()
                .Where(a => goalIds.Contains(a.GoalId) && a.Status != AllowanceStatuses.Cancelled)
                .ToListAsync(ct);

            var byGoal = allowances.GroupBy(a => a.GoalId).ToDictionary(g => g.Key, g => g.First());

            return Ok(goals.Select(g => ToDto(g, byGoal.GetValueOrDefault(g.Id))).ToList());
        }

        [HttpPost]
        public async Task<ActionResult<FrontendGoalDto>> CreateGoal([FromBody] CreateGoalDto body, CancellationToken ct)
        {
            var userId = CurrentUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();
            if (string.IsNullOrWhiteSpace(body.Title)) return BadRequest("Title is required.");

            var kind = string.IsNullOrWhiteSpace(body.Kind) ? GoalKinds.Custom : body.Kind!;
            if (!GoalKinds.All.Contains(kind)) return BadRequest($"Unknown goal kind '{kind}'.");

            // A measurable goal without a number is a contradiction: there'd be
            // nothing to measure against, and it would sit at 0% forever, which
            // is precisely the bug this design exists to kill.
            if (GoalKinds.IsMeasurable(kind) && (body.TargetValue is null || body.TargetValue <= 0))
                return BadRequest("A verifiable goal needs a target value above zero.");

            if (IsPercentKind(kind) && body.TargetValue > 100)
                return BadRequest("A percentage target cannot exceed 100.");

            var goal = new Goal
            {
                StudentId = userId,
                SubjectId = body.SubjectId,
                Title = body.Title.Trim(),
                Description = body.Description ?? "",
                Kind = kind,
                TargetValue = GoalKinds.IsMeasurable(kind) ? body.TargetValue : null,
                TopicFilter = string.IsNullOrWhiteSpace(body.TopicFilter) ? null : body.TopicFilter!.Trim(),
                // The label is generated, never accepted from the client, so
                // what the card says and what the evaluator checks are the same
                // statement.
                Target = LabelFor(kind, body.TargetValue, body.TopicFilter) ?? body.Target ?? "",
                Progress = 0,
                Status = GoalStatuses.Active,
                DueDate = body.DueDate ?? DateTime.UtcNow.AddDays(30),
                Category = string.IsNullOrWhiteSpace(body.Category) ? "academic" : body.Category!,
                Reward = body.Reward,
                RewardPoints = GoalEvaluator.PriceOf(kind, body.TargetValue),
            };

            _db.Set<Goal>().Add(goal);
            await _db.SaveChangesAsync(ct);

            // Measure immediately: a student who sets "submit 5 practice tests"
            // after already doing three should see 3/5, not 0/5.
            await _evaluator.EvaluateAllAsync(userId, ct);
            await _db.Entry(goal).ReloadAsync(ct);

            return CreatedAtAction(nameof(GetGoals), new { id = goal.Id }, ToDto(goal, null));
        }

        [HttpPatch("{id}")]
        public async Task<ActionResult<FrontendGoalDto>> UpdateGoal(string id, [FromBody] UpdateGoalDto body, CancellationToken ct)
        {
            var userId = CurrentUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();
            if (!long.TryParse(id, out var goalId)) return NotFound();

            var goal = await _db.Set<Goal>().FirstOrDefaultAsync(g => g.Id == goalId && g.StudentId == userId, ct);
            if (goal is null) return NotFound();

            if (body.Title is not null) goal.Title = body.Title.Trim();
            if (body.Description is not null) goal.Description = body.Description;
            if (body.DueDate is not null) goal.DueDate = body.DueDate.Value;
            if (body.Category is not null) goal.Category = body.Category;
            if (body.Reward is not null) goal.Reward = body.Reward;

            // Self-reported progress is only meaningful where there is nothing
            // to check. Letting it through on a measurable goal would hand back
            // exactly the dishonesty the evaluator removes, and the evaluator
            // would overwrite it on the next read anyway.
            var manualProgress = body.Progress is not null && !GoalKinds.IsMeasurable(goal.Kind);
            if (body.Progress is not null && GoalKinds.IsMeasurable(goal.Kind))
                return BadRequest("This goal is verified from your work, so its progress can't be set by hand.");

            var wasAchieved = goal.AchievedAt is not null;
            if (manualProgress)
            {
                goal.Progress = Math.Clamp(body.Progress!.Value, 0, 100);
                if (goal.Progress >= 100 && !wasAchieved)
                {
                    goal.AchievedAt = DateTime.UtcNow;
                    // "completed", not "verified": the student said so, and the
                    // two words have to keep meaning different things.
                    goal.Status = GoalStatuses.Completed;
                }
                else if (goal.Progress < 100)
                {
                    goal.Status = GoalStatuses.Active;
                }
            }

            goal.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync(ct);

            if (manualProgress && !wasAchieved && goal.Progress >= 100)
            {
                await _notifications.EnqueueAsync(
                    userId,
                    "celebration",
                    $"Goal complete: {goal.Title}",
                    "You marked this one done. Nice.",
                    $"/dashboard/goals/{goal.Id}",
                    ct);
            }

            return Ok(ToDto(goal, null));
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteGoal(string id, CancellationToken ct)
        {
            var userId = CurrentUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();
            if (!long.TryParse(id, out var goalId)) return NotFound();

            var goal = await _db.Set<Goal>().FirstOrDefaultAsync(g => g.Id == goalId && g.StudentId == userId, ct);
            if (goal is null) return NotFound();

            // An earned allowance is a debt between two people; deleting the
            // goal must not quietly erase it.
            var owed = await _db.Set<GoalAllowance>()
                .AnyAsync(a => a.GoalId == goalId && a.Status == AllowanceStatuses.Earned, ct);
            if (owed)
                return BadRequest("This goal has an allowance that's been earned but not paid. It can't be deleted yet.");

            await _db.Set<GoalAllowance>().Where(a => a.GoalId == goalId).ExecuteDeleteAsync(ct);
            _db.Set<Goal>().Remove(goal);
            await _db.SaveChangesAsync(ct);
            return NoContent();
        }

        // Persist a drag-to-reorder of the student's goals. The supplied id
        // order becomes the SortOrder (0-based), so the list keeps the priority
        // the student set. Ids not owned by the caller are ignored.
        [HttpPatch("reorder")]
        public async Task<IActionResult> ReorderGoals([FromBody] ReorderGoalsDto body, CancellationToken ct)
        {
            var userId = CurrentUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();
            if (body?.GoalIds is null || body.GoalIds.Length == 0) return NoContent();

            var ids = body.GoalIds
                .Select(s => long.TryParse(s, out var v) ? v : (long?)null)
                .Where(v => v.HasValue)
                .Select(v => v!.Value)
                .ToList();

            var byId = await _db.Set<Goal>()
                .Where(g => g.StudentId == userId && ids.Contains(g.Id))
                .ToDictionaryAsync(g => g.Id, ct);

            for (var i = 0; i < body.GoalIds.Length; i++)
            {
                if (!long.TryParse(body.GoalIds[i], out var gId)) continue;
                if (!byId.TryGetValue(gId, out var goal)) continue;
                goal.SortOrder = i;
                goal.UpdatedAt = DateTime.UtcNow;
            }

            await _db.SaveChangesAsync(ct);
            return NoContent();
        }

        // ── points, streaks, achievements ─────────────────────────────────

        [HttpGet("points/me")]
        public async Task<ActionResult<FrontendStudentPointsDto>> GetMyPoints(CancellationToken ct)
        {
            var userId = CurrentUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            // Re-measure first so the balance reflects work done since the last
            // page load, not the last time someone happened to open Goals.
            await _evaluator.EvaluateAllAsync(userId, ct);
            return Ok(await BuildPointsAsync(userId, ct));
        }

        [HttpGet("points/ledger")]
        public async Task<ActionResult<IEnumerable<FrontendPointsEntryDto>>> GetLedger(CancellationToken ct)
        {
            var userId = CurrentUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var points = await _db.Set<StudentPoints>()
                .AsNoTracking()
                .FirstOrDefaultAsync(p => p.StudentId == userId, ct);
            if (points is null) return Ok(Array.Empty<FrontendPointsEntryDto>());

            var rows = await _db.Set<PointsTransaction>()
                .AsNoTracking()
                .Where(t => t.StudentPointsId == points.Id)
                .OrderByDescending(t => t.TransactionDate)
                .Take(50)
                .Select(t => new FrontendPointsEntryDto
                {
                    Id = t.Id.ToString(),
                    Points = t.Points,
                    Description = t.Description,
                    Source = t.Source,
                    Date = t.TransactionDate,
                })
                .ToListAsync(ct);

            return Ok(rows);
        }

        [HttpGet("achievements")]
        public async Task<ActionResult<IEnumerable<FrontendAchievementDto>>> GetAchievements(CancellationToken ct)
        {
            var userId = CurrentUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var stats = await BuildPointsAsync(userId, ct);
            var bestScore = await _db.Set<PracticeAttempt>()
                .Where(a => a.StudentId == userId && a.Status == AttemptStatus.Submitted && a.Score != null)
                .MaxAsync(a => (int?)a.Score, ct) ?? 0;

            // Derived on read from the same counters the rest of the page uses.
            // A badge table would only give these numbers a second place to be
            // wrong.
            FrontendAchievementDto Make(string code, string title, string desc, int progress, int target) =>
                new()
                {
                    Code = code,
                    Title = title,
                    Description = desc,
                    Progress = Math.Min(progress, target),
                    Target = target,
                    Earned = progress >= target,
                };

            return Ok(new List<FrontendAchievementDto>
            {
                Make("first_test", "Off the mark", "Submit your first practice test", stats.TestsSubmitted, 1),
                Make("ten_tests", "Putting in the reps", "Submit 10 practice tests", stats.TestsSubmitted, 10),
                Make("fifty_tests", "Serious about this", "Submit 50 practice tests", stats.TestsSubmitted, 50),
                Make("first_goal", "Proven once", "Get a goal verified from your own work", stats.GoalsVerified, 1),
                Make("five_goals", "Proven again", "Get 5 goals verified", stats.GoalsVerified, 5),
                Make("week_streak", "Seven straight", "Practise 7 days in a row", stats.PracticeStreakDays, 7),
                Make("month_streak", "Thirty straight", "Practise 30 days in a row", stats.PracticeStreakDays, 30),
                Make("checkin_week", "Checking in", "Log your mood 7 days in a row", stats.CheckinStreakDays, 7),
                Make("high_score", "Nailed it", "Score 90% or better on a practice test", bestScore, 90),
            });
        }

        private async Task<FrontendStudentPointsDto> BuildPointsAsync(string userId, CancellationToken ct)
        {
            var points = await _db.Set<StudentPoints>()
                .AsNoTracking()
                .FirstOrDefaultAsync(p => p.StudentId == userId, ct);

            var goalsVerified = await _db.Set<Goal>()
                .CountAsync(g => g.StudentId == userId && g.Status == GoalStatuses.Verified, ct);

            var submitted = await _db.Set<PracticeAttempt>()
                .Where(a => a.StudentId == userId && a.Status == AttemptStatus.Submitted)
                .Select(a => a.SubmittedAt)
                .ToListAsync(ct);

            var since = DateTime.UtcNow.Date.AddDays(-365);
            var checkins = await _db.Set<MoodTracking>()
                .Where(m => m.StudentId == userId && m.TrackedAt >= since)
                .Select(m => m.TrackedAt)
                .ToListAsync(ct);

            var total = points?.TotalPoints ?? 0;
            var level = GoalEvaluator.LevelFor(total);

            return new FrontendStudentPointsDto
            {
                StudentId = userId,
                Balance = points?.AvailablePoints ?? 0,
                TotalEarned = total,
                Level = level,
                Rank = GoalEvaluator.RankFor(level),
                PointsIntoLevel = total % 500,
                PointsPerLevel = 500,
                CheckinStreakDays = StreakOf(checkins.Select(c => c.Date)),
                PracticeStreakDays = StreakOf(submitted.Where(s => s != null).Select(s => s!.Value.Date)),
                GoalsVerified = goalsVerified,
                TestsSubmitted = submitted.Count,
            };
        }

        private static int StreakOf(IEnumerable<DateTime> dates)
        {
            var days = dates.ToHashSet();
            if (days.Count == 0) return 0;
            var today = DateTime.UtcNow.Date;
            var cursor = days.Contains(today)
                ? today
                : days.Contains(today.AddDays(-1)) ? today.AddDays(-1) : (DateTime?)null;
            if (cursor is null) return 0;

            var streak = 0;
            while (days.Contains(cursor.Value))
            {
                streak++;
                cursor = cursor.Value.AddDays(-1);
            }
            return streak;
        }

        // ── allowances ────────────────────────────────────────────────────

        // Aptiverse never holds or moves the money. These endpoints record a
        // promise and a receipt; the rand changes hands between a parent and
        // their child exactly as it did before. See GoalAllowance.
        [HttpGet("allowances")]
        public async Task<ActionResult<IEnumerable<FrontendAllowanceDto>>> GetAllowances(CancellationToken ct)
        {
            var userId = CurrentUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            // One endpoint, two readings: a parent sees what they've promised,
            // a student sees what's been promised them.
            var rows = await _db.Set<GoalAllowance>()
                .AsNoTracking()
                .Include(a => a.Goal)
                .Where(a => a.SponsorUserId == userId || a.StudentId == userId)
                .OrderByDescending(a => a.CreatedAt)
                .ToListAsync(ct);

            var studentIds = rows.Select(a => a.StudentId).Distinct().ToList();
            var names = await _db.Users
                .Where(u => studentIds.Contains(u.Id))
                .Select(u => new { u.Id, Name = u.FirstName + " " + u.LastName })
                .ToDictionaryAsync(u => u.Id, u => u.Name, ct);

            return Ok(rows.Select(a => ToAllowanceDto(a, names.GetValueOrDefault(a.StudentId) ?? "")).ToList());
        }

        [HttpPost("{goalId}/allowance")]
        public async Task<ActionResult<FrontendAllowanceDto>> PledgeAllowance(
            string goalId, [FromBody] PledgeAllowanceDto body, CancellationToken ct)
        {
            var userId = CurrentUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();
            if (!long.TryParse(goalId, out var id)) return NotFound();
            if (body.AmountZar <= 0) return BadRequest("An allowance needs an amount above zero.");
            if (body.AmountZar > 10_000) return BadRequest("That's beyond what this is for. Keep an allowance under R10 000.");

            var goal = await _db.Set<Goal>().FirstOrDefaultAsync(g => g.Id == id, ct);
            if (goal is null || goal.StudentId is null) return NotFound();

            // Only a parent the student actually accepted can pledge. The link
            // is the student's consent, so this is theirs to grant, not ours.
            var link = await _db.Set<ParentLink>()
                .FirstOrDefaultAsync(l =>
                    l.ParentUserId == userId &&
                    l.StudentUserId == goal.StudentId &&
                    l.Status == "accepted", ct);
            if (link is null) return Forbid();

            var existing = await _db.Set<GoalAllowance>()
                .FirstOrDefaultAsync(a => a.GoalId == id && a.Status != AllowanceStatuses.Cancelled, ct);
            if (existing is not null) return Conflict("This goal already has an allowance on it.");

            var allowance = new GoalAllowance
            {
                GoalId = id,
                StudentId = goal.StudentId,
                SponsorUserId = userId,
                SponsorName = link.ParentName,
                AmountZar = decimal.Round(body.AmountZar, 2),
                Status = AllowanceStatuses.Pledged,
                Note = string.IsNullOrWhiteSpace(body.Note) ? null : body.Note!.Trim(),
            };

            // A goal already achieved is earned the moment it's pledged on.
            if (goal.AchievedAt is not null)
            {
                allowance.Status = AllowanceStatuses.Earned;
                allowance.EarnedAt = DateTime.UtcNow;
            }

            _db.Set<GoalAllowance>().Add(allowance);
            await _db.SaveChangesAsync(ct);

            await _notifications.EnqueueAsync(
                goal.StudentId,
                "info",
                $"{link.ParentName} put an allowance on a goal",
                $"R{allowance.AmountZar:0.##} for: {goal.Title}. Hit the target and it's yours.",
                "/dashboard/rewards",
                ct);

            allowance.Goal = goal;
            return Ok(ToAllowanceDto(allowance, ""));
        }

        [HttpPatch("allowances/{id}/paid")]
        public async Task<ActionResult<FrontendAllowanceDto>> MarkAllowancePaid(string id, CancellationToken ct)
        {
            var userId = CurrentUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();
            if (!long.TryParse(id, out var allowanceId)) return NotFound();

            var allowance = await _db.Set<GoalAllowance>()
                .Include(a => a.Goal)
                .FirstOrDefaultAsync(a => a.Id == allowanceId && a.SponsorUserId == userId, ct);
            if (allowance is null) return NotFound();

            // Only the person who owes it can say it's settled, and only once
            // it's actually owed.
            if (allowance.Status != AllowanceStatuses.Earned)
                return BadRequest("This allowance hasn't been earned yet.");

            allowance.Status = AllowanceStatuses.Paid;
            allowance.PaidAt = DateTime.UtcNow;
            await _db.SaveChangesAsync(ct);

            await _notifications.EnqueueAsync(
                allowance.StudentId,
                "celebration",
                "Your allowance was paid",
                $"{allowance.SponsorName} marked R{allowance.AmountZar:0.##} as handed over.",
                "/dashboard/rewards",
                ct);

            return Ok(ToAllowanceDto(allowance, ""));
        }

        [HttpDelete("allowances/{id}")]
        public async Task<IActionResult> CancelAllowance(string id, CancellationToken ct)
        {
            var userId = CurrentUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();
            if (!long.TryParse(id, out var allowanceId)) return NotFound();

            var allowance = await _db.Set<GoalAllowance>()
                .FirstOrDefaultAsync(a => a.Id == allowanceId && a.SponsorUserId == userId, ct);
            if (allowance is null) return NotFound();

            // Withdrawing a promise the child already kept isn't a thing.
            if (allowance.Status is AllowanceStatuses.Earned or AllowanceStatuses.Paid)
                return BadRequest("This one's already been earned. It can't be withdrawn.");

            allowance.Status = AllowanceStatuses.Cancelled;
            await _db.SaveChangesAsync(ct);
            return NoContent();
        }

        // ── milestones ────────────────────────────────────────────────────

        [HttpGet("{goalId}/milestones")]
        public async Task<ActionResult<IEnumerable<FrontendMilestoneDto>>> GetMilestones(string goalId, CancellationToken ct)
        {
            var userId = CurrentUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();
            if (!long.TryParse(goalId, out var goalIdLong))
            {
                return Ok(Array.Empty<FrontendMilestoneDto>());
            }

            var owns = await _db.Set<Goal>()
                .AnyAsync(g => g.Id == goalIdLong && g.StudentId == userId, ct);
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
                .ToListAsync(ct);

            return Ok(milestones);
        }

        [HttpPost("{goalId}/milestones")]
        public async Task<ActionResult<FrontendMilestoneDto>> CreateMilestone(
            string goalId, [FromBody] CreateMilestoneDto body, CancellationToken ct)
        {
            var userId = CurrentUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();
            if (!long.TryParse(goalId, out var goalIdLong)) return NotFound();
            if (string.IsNullOrWhiteSpace(body.Title)) return BadRequest("Title is required.");

            var owns = await _db.Set<Goal>().AnyAsync(g => g.Id == goalIdLong && g.StudentId == userId, ct);
            if (!owns) return NotFound();

            var next = await _db.Set<GoalMilestone>()
                .Where(m => m.GoalId == goalIdLong)
                .MaxAsync(m => (int?)m.Priority, ct) ?? 0;

            var milestone = new GoalMilestone
            {
                GoalId = goalIdLong,
                Title = body.Title.Trim(),
                Description = body.Description ?? "",
                Priority = next + 1,
            };

            _db.Set<GoalMilestone>().Add(milestone);
            await _db.SaveChangesAsync(ct);

            return Ok(new FrontendMilestoneDto
            {
                Id = milestone.Id.ToString(),
                GoalId = milestone.GoalId.ToString(),
                Title = milestone.Title,
                Description = milestone.Description,
                Priority = milestone.Priority,
                IsCompleted = milestone.IsCompleted,
                RewardPoints = milestone.RewardPoints,
            });
        }

        [HttpPatch("{goalId}/milestones/{milestoneId}")]
        public async Task<ActionResult<FrontendMilestoneDto>> UpdateMilestone(
            string goalId, string milestoneId, [FromBody] UpdateMilestoneDto body, CancellationToken ct)
        {
            var userId = CurrentUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();
            if (!long.TryParse(goalId, out var goalIdLong) || !long.TryParse(milestoneId, out var mId))
                return NotFound();

            var owns = await _db.Set<Goal>().AnyAsync(g => g.Id == goalIdLong && g.StudentId == userId, ct);
            if (!owns) return NotFound();

            var milestone = await _db.Set<GoalMilestone>()
                .FirstOrDefaultAsync(m => m.Id == mId && m.GoalId == goalIdLong, ct);
            if (milestone is null) return NotFound();

            if (body.Title is not null) milestone.Title = body.Title.Trim();
            if (body.Description is not null) milestone.Description = body.Description;
            if (body.IsCompleted is not null)
            {
                milestone.IsCompleted = body.IsCompleted.Value;
                milestone.CompletedAt = body.IsCompleted.Value ? DateTime.UtcNow : null;
            }
            milestone.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync(ct);

            return Ok(new FrontendMilestoneDto
            {
                Id = milestone.Id.ToString(),
                GoalId = milestone.GoalId.ToString(),
                Title = milestone.Title,
                Description = milestone.Description,
                Priority = milestone.Priority,
                IsCompleted = milestone.IsCompleted,
                RewardPoints = milestone.RewardPoints,
            });
        }

        [HttpDelete("{goalId}/milestones/{milestoneId}")]
        public async Task<IActionResult> DeleteMilestone(string goalId, string milestoneId, CancellationToken ct)
        {
            var userId = CurrentUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();
            if (!long.TryParse(goalId, out var goalIdLong) || !long.TryParse(milestoneId, out var mId))
                return NotFound();

            var owns = await _db.Set<Goal>().AnyAsync(g => g.Id == goalIdLong && g.StudentId == userId, ct);
            if (!owns) return NotFound();

            await _db.Set<GoalMilestone>().Where(m => m.Id == mId && m.GoalId == goalIdLong).ExecuteDeleteAsync(ct);
            return NoContent();
        }

        [HttpPatch("{goalId}/milestones/order")]
        public async Task<IActionResult> ReorderMilestones(string goalId, [FromBody] ReorderMilestonesDto body, CancellationToken ct)
        {
            var userId = CurrentUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();
            if (!long.TryParse(goalId, out var goalIdLong)) return NotFound();
            if (body?.MilestoneIds is null || body.MilestoneIds.Length == 0) return NoContent();

            var owns = await _db.Set<Goal>()
                .AnyAsync(g => g.Id == goalIdLong && g.StudentId == userId, ct);
            if (!owns) return NotFound();

            var byId = await _db.Set<GoalMilestone>()
                .Where(m => m.GoalId == goalIdLong)
                .ToDictionaryAsync(m => m.Id, ct);

            for (var i = 0; i < body.MilestoneIds.Length; i++)
            {
                if (!long.TryParse(body.MilestoneIds[i], out var mId)) continue;
                if (!byId.TryGetValue(mId, out var milestone)) continue;
                milestone.Priority = i + 1;
                milestone.UpdatedAt = DateTime.UtcNow;
            }

            await _db.SaveChangesAsync(ct);
            return NoContent();
        }

        [HttpGet("verifications")]
        [Authorize(Roles = "Teacher,SchoolAdmin,Admin,Superuser")]
        public ActionResult<IEnumerable<FrontendVerificationDto>> GetVerifications()
            => Ok(Array.Empty<FrontendVerificationDto>());

        // ── mapping ───────────────────────────────────────────────────────

        private static bool IsPercentKind(string kind) =>
            kind is GoalKinds.PracticeScore or GoalKinds.TopicMastery or GoalKinds.AssessmentMark;

        // The one place a goal's target is put into words. Generated rather
        // than typed so the label always describes what is actually measured.
        public static string? LabelFor(string kind, int? target, string? topic) => kind switch
        {
            GoalKinds.PracticeTests => $"{target} practice test{(target == 1 ? "" : "s")}",
            GoalKinds.PracticeScore => $"Best practice score {target}%",
            GoalKinds.TopicMastery => string.IsNullOrWhiteSpace(topic)
                ? $"{target}% mastery"
                : $"{target}% mastery in {topic}",
            GoalKinds.AssessmentMark => $"A graded mark of {target}%",
            GoalKinds.CheckinStreak => $"{target} days of check-ins in a row",
            GoalKinds.PracticeStreak => $"{target} days of practice in a row",
            _ => null,
        };

        private static FrontendGoalDto ToDto(Goal g, GoalAllowance? allowance) => new()
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
            Kind = g.Kind,
            TargetValue = g.TargetValue,
            CurrentValue = g.CurrentValue,
            TopicFilter = g.TopicFilter,
            RewardPoints = g.RewardPoints,
            AchievedAt = g.AchievedAt,
            AutoVerified = GoalKinds.IsMeasurable(g.Kind),
            Allowance = allowance is null ? null : ToAllowanceDto(allowance, ""),
        };

        private static FrontendAllowanceDto ToAllowanceDto(GoalAllowance a, string studentName) => new()
        {
            Id = a.Id.ToString(),
            GoalId = a.GoalId.ToString(),
            GoalTitle = a.Goal?.Title ?? "",
            StudentId = a.StudentId,
            StudentName = studentName,
            SponsorName = a.SponsorName,
            AmountZar = a.AmountZar,
            Status = a.Status,
            EarnedAt = a.EarnedAt,
            PaidAt = a.PaidAt,
            Note = a.Note,
            GoalProgress = a.Goal?.Progress ?? 0,
            GoalTarget = a.Goal?.Target ?? "",
        };
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

    public record CreateMilestoneDto
    {
        [JsonPropertyName("title")] public string Title { get; init; } = "";
        [JsonPropertyName("description")] public string? Description { get; init; }
    }

    public record UpdateMilestoneDto
    {
        [JsonPropertyName("title")] public string? Title { get; init; }
        [JsonPropertyName("description")] public string? Description { get; init; }
        [JsonPropertyName("isCompleted")] public bool? IsCompleted { get; init; }
    }

    public record ReorderMilestonesDto
    {
        [JsonPropertyName("milestoneIds")] public string[] MilestoneIds { get; init; } = Array.Empty<string>();
    }

    public record ReorderGoalsDto
    {
        [JsonPropertyName("goalIds")] public string[] GoalIds { get; init; } = Array.Empty<string>();
    }

    public record PledgeAllowanceDto
    {
        [JsonPropertyName("amountZar")] public decimal AmountZar { get; init; }
        [JsonPropertyName("note")] public string? Note { get; init; }
    }

    public record CreateGoalDto
    {
        [JsonPropertyName("title")] public string Title { get; init; } = "";
        [JsonPropertyName("description")] public string? Description { get; init; }
        [JsonPropertyName("target")] public string? Target { get; init; }
        [JsonPropertyName("kind")] public string? Kind { get; init; }
        [JsonPropertyName("targetValue")] public int? TargetValue { get; init; }
        [JsonPropertyName("topicFilter")] public string? TopicFilter { get; init; }
        [JsonPropertyName("dueDate")] public DateTime? DueDate { get; init; }
        [JsonPropertyName("category")] public string? Category { get; init; }
        [JsonPropertyName("subjectId")] public string? SubjectId { get; init; }
        [JsonPropertyName("reward")] public string? Reward { get; init; }
    }

    public record UpdateGoalDto
    {
        [JsonPropertyName("title")] public string? Title { get; init; }
        [JsonPropertyName("description")] public string? Description { get; init; }
        [JsonPropertyName("progress")] public int? Progress { get; init; }
        [JsonPropertyName("dueDate")] public DateTime? DueDate { get; init; }
        [JsonPropertyName("category")] public string? Category { get; init; }
        [JsonPropertyName("reward")] public string? Reward { get; init; }
    }
}
