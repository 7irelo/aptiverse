using Aptiverse.Goals.Application.Frontend.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Aptiverse.Goals.Controllers
{
    [ApiController]
    [Route("api/frontend")]
    [Authorize]
    public class FrontendController : ControllerBase
    {
        [HttpGet("goals")]
        public ActionResult<IEnumerable<FrontendGoalDto>> GetGoals()
        {
            var today = DateTime.UtcNow;
            return Ok(new[]
            {
                new FrontendGoalDto { Id = "g1", SubjectId = "math", Title = "Lift Calculus mastery to 75%", Description = "Spend 4 focused sessions per week on calculus drills until June.", Target = "75% mastery", Progress = 62, Status = "active", DueDate = today.AddDays(45), Category = "academic", Reward = "Free Calculus masterclass with top tutor" },
                new FrontendGoalDto { Id = "g2", SubjectId = "english", Title = "Write three timed essays this term", Description = "Practice writing under exam conditions to build stamina.", Target = "3 / 3", Progress = 66, Status = "active", DueDate = today.AddDays(30), Category = "academic", Reward = "Skip-the-queue tutor pass" },
                new FrontendGoalDto { Id = "g3", Title = "Wellbeing check-in 5 days a week", Description = "Daily diary + mood check-in to spot stress early.", Target = "5 / 5", Progress = 80, Status = "active", DueDate = today.AddDays(7), Category = "wellbeing", Reward = "Resilient Learner badge" },
                new FrontendGoalDto { Id = "g4", SubjectId = "physci", Title = "Master Chemical Equilibrium", Description = "Get to 60% mastery before the SBA.", Target = "60% mastery", Progress = 42, Status = "at_risk", DueDate = today.AddDays(10), Category = "academic" },
                new FrontendGoalDto { Id = "g5", Title = "Submit NSFAS application", Description = "Complete the bursary navigator checklist before deadline.", Target = "All docs uploaded", Progress = 100, Status = "verified", DueDate = today.AddDays(-2), Category = "career", Reward = "1 free hour with a career counsellor" },
            });
        }

        [HttpGet("rewards")]
        public ActionResult<IEnumerable<FrontendRewardDto>> GetRewards()
        {
            return Ok(new[]
            {
                new FrontendRewardDto { Id = "r1", Title = "Free Calculus Masterclass", Description = "1 hour with Sipho Mabaso, 4.9-rated tutor.", Cost = 1200, Category = "tutor", ImageColor = "#1F8079", Available = true },
                new FrontendRewardDto { Id = "r2", Title = "Skip-the-queue tutor pass", Description = "Book any tutor within 24 hours, even if fully booked.", Cost = 600, Category = "feature", ImageColor = "#F25C2E", Available = true },
                new FrontendRewardDto { Id = "r3", Title = "University Insider Q&A", Description = "Live session with a UCT undergraduate in your dream course.", Cost = 900, Category = "experience", ImageColor = "#FFB733", Available = true },
                new FrontendRewardDto { Id = "r4", Title = "Resilient Learner Badge", Description = "Profile badge that universities can see when you apply.", Cost = 0, Category = "badge", ImageColor = "#3D9762", Available = true },
                new FrontendRewardDto { Id = "r5", Title = "Premium Past Paper Vault", Description = "Unlock 5 years of solved IEB & NSC past papers.", Cost = 1500, Category = "feature", ImageColor = "#5BA3E5", Available = false },
            });
        }

        [HttpGet("points/{studentId}")]
        public ActionResult<FrontendStudentPointsDto> GetPoints(string studentId)
        {
            return Ok(new FrontendStudentPointsDto
            {
                StudentId = studentId,
                Balance = 1840,
                StreakDays = 12,
                BadgeCount = 4,
            });
        }

        [HttpGet("verifications")]
        [Authorize(Roles = "Teacher,SchoolAdmin,Admin,Superuser")]
        public ActionResult<IEnumerable<FrontendVerificationDto>> GetVerifications()
        {
            var now = DateTime.UtcNow;
            return Ok(new[]
            {
                new FrontendVerificationDto { Id = "v1", Student = "Thandi Mokoena", Goal = "Achieve 70% in T1 Maths SBA", Value = "Score 72% on Calculus test", Date = now.AddDays(-2), Reward = "Free Calculus masterclass" },
                new FrontendVerificationDto { Id = "v2", Student = "Lerato Pillay", Goal = "5-day study streak", Value = "Logged 5 consecutive sessions", Date = now.AddDays(-1), Reward = "Resilient Learner badge" },
                new FrontendVerificationDto { Id = "v3", Student = "Sipho Dlamini", Goal = "Submit 3 essays this term", Value = "Submitted essay #3 today", Date = now, Reward = "1 free hour with tutor" },
                new FrontendVerificationDto { Id = "v4", Student = "Aisha Mahlangu", Goal = "Lift Chemistry mastery to 60%", Value = "Mastery now 62%", Date = now.AddDays(-3), Reward = "Past papers vault unlock" },
            });
        }

        [HttpPost("verifications/{id}/approve")]
        [Authorize(Roles = "Teacher,SchoolAdmin,Admin,Superuser")]
        public IActionResult ApproveVerification(string id) => Ok(new { id, approved = true });

        [HttpPost("verifications/{id}/decline")]
        [Authorize(Roles = "Teacher,SchoolAdmin,Admin,Superuser")]
        public IActionResult DeclineVerification(string id) => Ok(new { id, approved = false });
    }
}
