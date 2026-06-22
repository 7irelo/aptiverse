using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json.Serialization;

namespace Aptiverse.StudyGroups.Controllers
{
    [ApiController]
    [Route("api/study-groups")]
    [Authorize]
    public class StudyGroupsController : ControllerBase
    {
        [HttpGet]
        public ActionResult<IEnumerable<FrontendStudyGroupDto>> GetStudyGroups()
            => Ok(Array.Empty<FrontendStudyGroupDto>());
    }

    public record FrontendStudyGroupDto
    {
        [JsonPropertyName("id")] public string Id { get; init; } = "";
        [JsonPropertyName("name")] public string Name { get; init; } = "";
        [JsonPropertyName("subjectId")] public string SubjectId { get; init; } = "";
        [JsonPropertyName("members")] public int Members { get; init; }
        [JsonPropertyName("privacy")] public string Privacy { get; init; } = "open";
        [JsonPropertyName("description")] public string Description { get; init; } = "";
        [JsonPropertyName("nextSession")] public DateTime? NextSession { get; init; }
    }
}
