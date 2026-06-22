using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json.Serialization;

namespace Aptiverse.Careers.Controllers
{
    [ApiController]
    [Route("api/careers")]
    [Authorize]
    public class CareersController : ControllerBase
    {
        [HttpGet]
        public ActionResult<IEnumerable<FrontendCareerDto>> GetCareers()
            => Ok(Array.Empty<FrontendCareerDto>());
    }

    public record FrontendCareerDto
    {
        [JsonPropertyName("id")] public string Id { get; init; } = "";
        [JsonPropertyName("title")] public string Title { get; init; } = "";
        [JsonPropertyName("field")] public string Field { get; init; } = "";
        [JsonPropertyName("averageSalary")] public string AverageSalary { get; init; } = "";
        [JsonPropertyName("matchScore")] public int MatchScore { get; init; }
        [JsonPropertyName("requirements")] public string[] Requirements { get; init; } = Array.Empty<string>();
    }
}
