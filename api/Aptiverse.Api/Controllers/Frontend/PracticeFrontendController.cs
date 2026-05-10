using Aptiverse.Practice.Application.Frontend.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Aptiverse.Practice.Controllers
{
    [ApiController]
    [Route("api/frontend")]
    [Authorize]
    public class FrontendController : ControllerBase
    {
        private static readonly FrontendPracticeTestDto[] TestSeed =
        [
            new() { Id = "p1", SubjectId = "math", Title = "Calculus Drill — Derivatives", Topics = ["Differentiation", "Chain rule"], QuestionCount = 20, Difficulty = "core", DurationMinutes = 35, BestScore = 72, Attempts = 3, AlignedSBA = "a1", AiGenerated = true },
            new() { Id = "p2", SubjectId = "math", Title = "Trigonometry Identities Sprint", Topics = ["Identities", "Equations"], QuestionCount = 15, Difficulty = "challenge", DurationMinutes = 25, BestScore = 64, Attempts = 2, AlignedSBA = "a1", AiGenerated = true },
            new() { Id = "p3", SubjectId = "physci", Title = "Equilibrium Conceptual", Topics = ["Le Chatelier", "Kc calculations"], QuestionCount = 12, Difficulty = "foundation", DurationMinutes = 20, BestScore = 48, Attempts = 1, AlignedSBA = "a3", AiGenerated = true },
            new() { Id = "p4", SubjectId = "english", Title = "Essay Structure Workout", Topics = ["Argument", "Cohesion"], QuestionCount = 8, Difficulty = "core", DurationMinutes = 40, BestScore = 78, Attempts = 2, AlignedSBA = "a2", AiGenerated = true },
            new() { Id = "p5", SubjectId = "lifesci", Title = "Genetics Past Paper Mix", Topics = ["Punnett squares", "Mendelian genetics"], QuestionCount = 18, Difficulty = "core", DurationMinutes = 30, BestScore = 70, Attempts = 4, AlignedSBA = "a4", AiGenerated = false },
            new() { Id = "p6", SubjectId = "geography", Title = "Synoptic Weather Maps", Topics = ["Climatology", "Mid-latitude cyclones"], QuestionCount = 10, Difficulty = "core", DurationMinutes = 25, Attempts = 0, AiGenerated = true },
        ];

        [HttpGet("practice-tests")]
        public ActionResult<IEnumerable<FrontendPracticeTestDto>> GetTests([FromQuery] string? subjectId = null, [FromQuery] string? difficulty = null)
        {
            var rows = TestSeed
                .Where(t => subjectId is null || t.SubjectId == subjectId)
                .Where(t => difficulty is null || t.Difficulty == difficulty);
            return Ok(rows);
        }

        [HttpGet("practice-tests/{id}")]
        public ActionResult<FrontendPracticeTestDto> GetTest(string id)
        {
            var t = TestSeed.FirstOrDefault(x => x.Id == id);
            return t is null ? NotFound() : Ok(t);
        }

        [HttpGet("practice-tests/{id}/questions")]
        public ActionResult<IEnumerable<FrontendQuestionDto>> GetQuestions(string id)
        {
            return Ok(new[]
            {
                new FrontendQuestionDto
                {
                    Id = $"{id}-q1",
                    Question = "Differentiate y = (3x² + 2)⁴ with respect to x.",
                    Options = ["8x(3x² + 2)³", "24x(3x² + 2)³", "12x(3x² + 2)³", "(3x² + 2)³"],
                    AnswerIdx = 1,
                    Explanation = "Apply the chain rule with outer power 4 and inner derivative 6x."
                },
                new FrontendQuestionDto
                {
                    Id = $"{id}-q2",
                    Question = "If f(x) = sin(2x), what is f'(π/4)?",
                    Options = ["0", "1", "2", "-1"],
                    AnswerIdx = 0,
                },
                new FrontendQuestionDto
                {
                    Id = $"{id}-q3",
                    Question = "The chain rule applies when:",
                    Options = ["Two functions are added", "A function is composed inside another function", "Differentiating a polynomial", "Integrating a product"],
                    AnswerIdx = 1,
                },
            });
        }

        [HttpPost("practice-tests/{id}/attempts")]
        public ActionResult<FrontendAttemptDto> StartAttempt(string id)
        {
            return Ok(new FrontendAttemptDto
            {
                Id = $"att-{Guid.NewGuid():N}",
                TestId = id,
                StudentId = User?.Identity?.Name ?? "demo",
                StartedAt = DateTime.UtcNow,
            });
        }

        [HttpPatch("attempts/{attemptId}")]
        public ActionResult<FrontendAttemptDto> SubmitAttempt(string attemptId, [FromBody] FrontendAttemptDto submission)
        {
            return Ok(submission with
            {
                Id = attemptId,
                SubmittedAt = DateTime.UtcNow,
                Score = submission.Answers.Count > 0 ? Math.Min(100, submission.Answers.Count * 10) : 0,
            });
        }

        [HttpGet("past-papers")]
        public ActionResult<IEnumerable<FrontendPastPaperDto>> GetPastPapers([FromQuery] int? year = null, [FromQuery] string? board = null)
        {
            var papers = new[]
            {
                new FrontendPastPaperDto { Id = "pp1", Year = 2024, Subject = "Mathematics", Paper = "P1", Board = "NSC", Topic = "Calculus", Solved = true },
                new FrontendPastPaperDto { Id = "pp2", Year = 2024, Subject = "Mathematics", Paper = "P2", Board = "NSC", Topic = "Trig + Geometry", Solved = false },
                new FrontendPastPaperDto { Id = "pp3", Year = 2024, Subject = "Physical Sciences", Paper = "P1", Board = "NSC", Topic = "Mechanics", Solved = true },
                new FrontendPastPaperDto { Id = "pp4", Year = 2024, Subject = "Physical Sciences", Paper = "P2", Board = "NSC", Topic = "Chemistry", Solved = false },
                new FrontendPastPaperDto { Id = "pp5", Year = 2024, Subject = "English HL", Paper = "P3", Board = "IEB", Topic = "Creative Writing", Solved = false },
                new FrontendPastPaperDto { Id = "pp6", Year = 2023, Subject = "Mathematics", Paper = "P1", Board = "IEB", Topic = "Algebra + Calculus", Solved = true },
                new FrontendPastPaperDto { Id = "pp7", Year = 2023, Subject = "Life Sciences", Paper = "P1", Board = "NSC", Topic = "Genetics + Evolution", Solved = false },
                new FrontendPastPaperDto { Id = "pp8", Year = 2023, Subject = "Geography", Paper = "P1", Board = "NSC", Topic = "Climatology + Mapwork", Solved = false },
            };
            return Ok(papers
                .Where(p => year is null || p.Year == year)
                .Where(p => board is null || p.Board == board));
        }
    }
}
