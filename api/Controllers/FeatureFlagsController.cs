using Aptiverse.FeatureFlags.Application.Frontend.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Concurrent;

namespace Aptiverse.FeatureFlags.Controllers
{
    [ApiController]
    [Route("api/feature-flags")]
    [Authorize(Roles = "Admin,Superuser")]
    public class FeatureFlagsController : ControllerBase
    {
        // Real flags will be created via the admin UI and persisted to
        // feature_flags.feature_flags. Starts empty so the admin sees
        // their own flags, not seed data.
        private static readonly ConcurrentDictionary<string, FrontendFeatureFlagDto> Store = new();

        [HttpGet("flags")]
        public ActionResult<IEnumerable<FrontendFeatureFlagDto>> GetFlags() => Ok(Store.Values);

        [HttpPatch("flags/{key}")]
        public ActionResult<FrontendFeatureFlagDto> ToggleFlag(string key, [FromBody] FrontendToggleFlagInput input)
        {
            if (!Store.TryGetValue(key, out var existing)) return NotFound();
            var updated = existing with { Enabled = input.Enabled, Rollout = input.Rollout ?? existing.Rollout };
            Store[key] = updated;
            return Ok(updated);
        }
    }
}
