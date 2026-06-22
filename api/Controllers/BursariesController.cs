using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json.Serialization;

namespace Aptiverse.Bursaries.Controllers
{
    // Aptiverse doesn't list individual bursaries. The bursaries page points
    // students to the maintained directories at zabursaries.co.za and
    // studytrust.org.za. This endpoint stays for backward-compat with any
    // older frontend builds; new code skips it.
    [ApiController]
    [Route("api/bursaries")]
    [Authorize]
    public class BursariesController : ControllerBase
    {
        [HttpGet]
        public ActionResult<IEnumerable<FrontendBursaryDto>> GetBursaries()
            => Ok(Array.Empty<FrontendBursaryDto>());
    }

    public record FrontendBursaryDto
    {
        [JsonPropertyName("id")] public string Id { get; init; } = "";
        [JsonPropertyName("name")] public string Name { get; init; } = "";
        [JsonPropertyName("field")] public string Field { get; init; } = "";
        [JsonPropertyName("amount")] public string Amount { get; init; } = "";
        [JsonPropertyName("deadline")] public DateTime Deadline { get; init; }
        [JsonPropertyName("status")] public string Status { get; init; } = "open";
        [JsonPropertyName("requirements")] public string[] Requirements { get; init; } = Array.Empty<string>();
    }
}
