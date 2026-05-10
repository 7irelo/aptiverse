using Aptiverse.AcademicPlanning.Application.Frontend.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Aptiverse.AcademicPlanning.Controllers
{
    /// <summary>
    /// Frontend-shaped read endpoints used by the Next.js UI. These return
    /// data in exactly the shape ui/src/lib/mockData.ts expects so the UI's
    /// TanStack queries can drop in without a transformation layer.
    ///
    /// Demo data is synthesised here; in production this would aggregate
    /// from the existing Subject, Topic, Assessment, and StudentSubject
    /// services with the caller's identity.
    /// </summary>
    [ApiController]
    [Route("api/frontend")]
    public class FrontendController : ControllerBase
    {
        private static readonly (string Id, string Name, string Code, string Level, string? Paper, int Curr, int Pred, string Trend, string Teacher, int Sba)[] Subjects =
        [
            ("math", "Mathematics", "MATH", "core", "P1 + P2", 68, 72, "up", "Ms. Naidoo", 2),
            ("physci", "Physical Sciences", "PHSC", "core", "P1 + P2", 61, 65, "up", "Mr. Dlamini", 1),
            ("english", "English HL", "ENG", "core", "P1 + P2 + P3", 74, 76, "flat", "Ms. van der Merwe", 1),
            ("lifesci", "Life Sciences", "LSCI", "elective", "P1 + P2", 67, 70, "up", "Dr. Khumalo", 1),
            ("afri", "Afrikaans FAL", "AFR", "core", null, 60, 64, "up", "Mnr. Botha", 1),
            ("lo", "Life Orientation", "LO", "core", null, 80, 82, "flat", "Ms. Pillay", 0),
            ("geography", "Geography", "GEO", "elective", null, 69, 71, "up", "Mr. Ndlovu", 1),
        ];

        private static readonly Dictionary<string, (string Name, int Mastery)[]> SubjectTopics = new()
        {
            ["math"] = [("Algebra", 78), ("Calculus", 54), ("Trigonometry", 72), ("Statistics & Probability", 64), ("Analytical Geometry", 60)],
            ["physci"] = [("Mechanics", 68), ("Chemical Equilibrium", 42), ("Organic Chemistry", 56), ("Electrostatics", 64), ("Waves, Sound & Light", 70)],
            ["english"] = [("Essay Writing", 72), ("Comprehension", 80), ("Literature Analysis", 68), ("Poetry", 64), ("Visual Literacy", 78)],
            ["lifesci"] = [("DNA & Heredity", 74), ("Evolution", 58), ("Human Reproduction", 72), ("Nervous System", 66), ("Population Ecology", 60)],
            ["afri"] = [("Begripslees", 62), ("Skryfstuk", 56), ("Letterkunde", 60), ("Taalstrukture", 64)],
            ["lo"] = [("Careers", 84), ("PE", 88), ("Citizenship", 76), ("Health", 80)],
            ["geography"] = [("Climatology", 70), ("Geomorphology", 64), ("Settlement", 72), ("Mapwork", 78)],
        };

        [HttpGet("subjects")]
        [Authorize]
        public ActionResult<IEnumerable<FrontendSubjectDto>> GetSubjects()
        {
            return Ok(Subjects.Select(s => new FrontendSubjectDto
            {
                Id = s.Id,
                Name = s.Name,
                Code = s.Code,
                Level = s.Level,
                Paper = s.Paper,
                CurrentAverage = s.Curr,
                PredictedNextTerm = s.Pred,
                Trend = s.Trend,
                Teacher = s.Teacher,
                UpcomingSBA = s.Sba,
                TermAverages = TermAveragesFor(s.Curr),
                Topics = (SubjectTopics.TryGetValue(s.Id, out var t) ? t : [])
                    .Select(x => new FrontendTopicMastery { Name = x.Name, Mastery = x.Mastery })
                    .ToList(),
            }));
        }

        [HttpGet("subjects/{id}")]
        [Authorize]
        public ActionResult<FrontendSubjectDto> GetSubject(string id)
        {
            var s = Subjects.FirstOrDefault(x => x.Id == id);
            if (s.Id is null) return NotFound();
            return Ok(new FrontendSubjectDto
            {
                Id = s.Id,
                Name = s.Name,
                Code = s.Code,
                Level = s.Level,
                Paper = s.Paper,
                CurrentAverage = s.Curr,
                PredictedNextTerm = s.Pred,
                Trend = s.Trend,
                Teacher = s.Teacher,
                UpcomingSBA = s.Sba,
                TermAverages = TermAveragesFor(s.Curr),
                Topics = (SubjectTopics.TryGetValue(s.Id, out var t) ? t : [])
                    .Select(x => new FrontendTopicMastery { Name = x.Name, Mastery = x.Mastery })
                    .ToList(),
            });
        }

        [HttpGet("assessments")]
        [Authorize]
        public ActionResult<IEnumerable<FrontendAssessmentDto>> GetAssessments()
        {
            var today = DateTime.UtcNow;
            return Ok(new[]
            {
                new FrontendAssessmentDto
                {
                    Id = "a1", SubjectId = "math", Title = "Calculus & Trigonometry Test",
                    Type = "Test", Weight = 15, DueDate = today.AddDays(6),
                    Status = "scheduled", PredictedMark = 71,
                    Tasks = ["Practice 20 derivative problems", "Past paper Q1-3", "Trig identities revision"],
                },
                new FrontendAssessmentDto
                {
                    Id = "a2", SubjectId = "english", Title = "Argumentative Essay — Social Media",
                    Type = "Essay", Weight = 10, DueDate = today.AddDays(3),
                    Status = "in_progress", PredictedMark = 76,
                    Rubric =
                    [
                        new() { Criterion = "Content & ideas", Weight = 30, Description = "Originality, depth, relevance" },
                        new() { Criterion = "Structure", Weight = 25, Description = "Intro, body, conclusion" },
                        new() { Criterion = "Style & tone", Weight = 25, Description = "Audience awareness" },
                        new() { Criterion = "Language & conventions", Weight = 20, Description = "Grammar, spelling" },
                    ],
                },
                new FrontendAssessmentDto
                {
                    Id = "a3", SubjectId = "physci", Title = "Chemical Equilibrium SBA",
                    Type = "Investigation", Weight = 20, DueDate = today.AddDays(12),
                    Status = "scheduled", PredictedMark = 58,
                },
                new FrontendAssessmentDto
                {
                    Id = "a4", SubjectId = "lifesci", Title = "Genetics & Heredity Practical",
                    Type = "Practical", Weight = 12, DueDate = today.AddDays(9),
                    Status = "scheduled", PredictedMark = 70,
                },
                new FrontendAssessmentDto
                {
                    Id = "a5", SubjectId = "math", Title = "Trial Exam Paper 1",
                    Type = "Exam", Weight = 25, DueDate = today.AddDays(28),
                    Status = "scheduled", PredictedMark = 70,
                },
                new FrontendAssessmentDto
                {
                    Id = "a6", SubjectId = "geography", Title = "Mapwork Assignment",
                    Type = "Project", Weight = 8, DueDate = today.AddDays(-3),
                    Status = "graded", ActualMark = 73,
                },
                new FrontendAssessmentDto
                {
                    Id = "a7", SubjectId = "afri", Title = "Skryfstuk - Argumenterende Opstel",
                    Type = "Essay", Weight = 10, DueDate = today.AddDays(5),
                    Status = "scheduled", PredictedMark = 62,
                },
            });
        }

        [HttpGet("assessments/{id}")]
        [Authorize]
        public ActionResult<FrontendAssessmentDto> GetAssessment(string id)
        {
            var all = ((ActionResult<IEnumerable<FrontendAssessmentDto>>)GetAssessments()).Value!;
            var found = all.FirstOrDefault(a => a.Id == id);
            return found is null ? NotFound() : Ok(found);
        }

        [HttpGet("classes")]
        [Authorize(Roles = "Teacher,SchoolAdmin,Admin,Superuser")]
        public ActionResult<IEnumerable<FrontendClassRecordDto>> GetClasses()
        {
            return Ok(new[]
            {
                new FrontendClassRecordDto { Id = "cl1", Name = "12A Mathematics", Grade = 12, Subject = "Mathematics", StudentCount = 28, AverageMastery = 64, Trend = 3, StrugglingTopics = ["Calculus", "Trigonometry"] },
                new FrontendClassRecordDto { Id = "cl2", Name = "12B Physical Sciences", Grade = 12, Subject = "Physical Sciences", StudentCount = 26, AverageMastery = 58, Trend = 1, StrugglingTopics = ["Chemical Equilibrium", "Organic Chemistry"] },
                new FrontendClassRecordDto { Id = "cl3", Name = "11A English HL", Grade = 11, Subject = "English HL", StudentCount = 30, AverageMastery = 72, Trend = 2, StrugglingTopics = ["Poetry analysis"] },
                new FrontendClassRecordDto { Id = "cl4", Name = "12A Life Sciences", Grade = 12, Subject = "Life Sciences", StudentCount = 24, AverageMastery = 67, Trend = 4, StrugglingTopics = ["Evolution"] },
            });
        }

        private static List<FrontendTermAverage> TermAveragesFor(int current) =>
        [
            new() { Term = "T1 '25", Mark = current - 10 },
            new() { Term = "T2 '25", Mark = current - 6 },
            new() { Term = "T3 '25", Mark = current - 3 },
            new() { Term = "T4 '25", Mark = current },
        ];
    }
}
