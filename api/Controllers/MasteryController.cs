using Aptiverse.Mastery.Application.Frontend.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Aptiverse.Mastery.Controllers
{
    // Clean-slate stubs — mastery is computed from real practice + assessment
    // data, neither of which exists yet for a fresh account. Returns empty
    // collections so the UI renders its empty states.
    [ApiController]
    [Route("api/mastery")]
    [Authorize]
    public class MasteryController : ControllerBase
    {
        [HttpGet("topic-mastery")]
        public ActionResult<IEnumerable<FrontendTopicMasteryDto>> GetTopicMastery([FromQuery] string? subjectId = null)
            => Ok(Array.Empty<FrontendTopicMasteryDto>());

        [HttpGet("predictions")]
        public ActionResult<IEnumerable<FrontendTermPredictionDto>> GetPredictions()
            => Ok(Array.Empty<FrontendTermPredictionDto>());
    }
}
