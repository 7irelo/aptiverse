using Aptiverse.Mastery.Application.Frontend.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Aptiverse.Mastery.Controllers
{
    [ApiController]
    [Route("api/frontend")]
    [Authorize]
    public class FrontendController : ControllerBase
    {
        private static readonly (string SubjectId, string Subject, string Topic, int Mastery, int Trend)[] Topics =
        [
            ("math", "Mathematics", "Algebra", 78, 4),
            ("math", "Mathematics", "Calculus", 54, 8),
            ("math", "Mathematics", "Trigonometry", 72, 3),
            ("math", "Mathematics", "Statistics & Probability", 64, 2),
            ("math", "Mathematics", "Analytical Geometry", 60, 1),
            ("physci", "Physical Sciences", "Mechanics", 68, 4),
            ("physci", "Physical Sciences", "Chemical Equilibrium", 42, -1),
            ("physci", "Physical Sciences", "Organic Chemistry", 56, 3),
            ("physci", "Physical Sciences", "Electrostatics", 64, 2),
            ("physci", "Physical Sciences", "Waves, Sound & Light", 70, 1),
            ("english", "English HL", "Essay Writing", 72, 2),
            ("english", "English HL", "Comprehension", 80, 1),
            ("english", "English HL", "Literature Analysis", 68, 0),
            ("english", "English HL", "Poetry", 64, -1),
            ("english", "English HL", "Visual Literacy", 78, 1),
            ("lifesci", "Life Sciences", "DNA & Heredity", 74, 4),
            ("lifesci", "Life Sciences", "Evolution", 58, 2),
            ("geography", "Geography", "Mapwork", 78, 3),
            ("geography", "Geography", "Climatology", 70, 2),
        ];

        [HttpGet("topic-mastery")]
        public ActionResult<IEnumerable<FrontendTopicMasteryDto>> GetTopicMastery([FromQuery] string? subjectId = null)
        {
            var rows = Topics
                .Where(t => subjectId is null || t.SubjectId == subjectId)
                .Select(t => new FrontendTopicMasteryDto
                {
                    SubjectId = t.SubjectId,
                    Subject = t.Subject,
                    Topic = t.Topic,
                    Mastery = t.Mastery,
                    Trend = t.Trend,
                });
            return Ok(rows);
        }

        [HttpGet("predictions")]
        public ActionResult<IEnumerable<FrontendTermPredictionDto>> GetPredictions()
        {
            return Ok(new[]
            {
                new FrontendTermPredictionDto { SubjectId = "math", Subject = "Mathematics", CurrentTerm = 68, PredictedNextTerm = 72, Confidence = 0.84 },
                new FrontendTermPredictionDto { SubjectId = "physci", Subject = "Physical Sciences", CurrentTerm = 61, PredictedNextTerm = 65, Confidence = 0.78 },
                new FrontendTermPredictionDto { SubjectId = "english", Subject = "English HL", CurrentTerm = 74, PredictedNextTerm = 76, Confidence = 0.86 },
                new FrontendTermPredictionDto { SubjectId = "lifesci", Subject = "Life Sciences", CurrentTerm = 67, PredictedNextTerm = 70, Confidence = 0.81 },
                new FrontendTermPredictionDto { SubjectId = "afri", Subject = "Afrikaans FAL", CurrentTerm = 60, PredictedNextTerm = 64, Confidence = 0.74 },
                new FrontendTermPredictionDto { SubjectId = "lo", Subject = "Life Orientation", CurrentTerm = 80, PredictedNextTerm = 82, Confidence = 0.91 },
                new FrontendTermPredictionDto { SubjectId = "geography", Subject = "Geography", CurrentTerm = 69, PredictedNextTerm = 71, Confidence = 0.79 },
            });
        }
    }
}
