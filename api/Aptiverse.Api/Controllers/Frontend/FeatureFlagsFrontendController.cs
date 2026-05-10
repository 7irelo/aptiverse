using Aptiverse.FeatureFlags.Application.Frontend.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Concurrent;

namespace Aptiverse.FeatureFlags.Controllers
{
    [ApiController]
    [Route("api/frontend")]
    [Authorize(Roles = "Admin,Superuser")]
    public class FrontendController : ControllerBase
    {
        private static readonly ConcurrentDictionary<string, FrontendFeatureFlagDto> Store = new(
            new[]
            {
                new FrontendFeatureFlagDto { Key = "ai_practice_v2", Description = "New AI practice generator with reasoning chains", Enabled = true, Rollout = 80, Env = "production" },
                new FrontendFeatureFlagDto { Key = "live_collab_workspace", Description = "Real-time collaborative workspace for study groups", Enabled = false, Rollout = 0, Env = "staging" },
                new FrontendFeatureFlagDto { Key = "psychologist_video_chat", Description = "Video chat with platform psychologists", Enabled = true, Rollout = 30, Env = "production" },
                new FrontendFeatureFlagDto { Key = "voice_diary", Description = "Voice-input diary entries with transcription", Enabled = false, Rollout = 5, Env = "production" },
                new FrontendFeatureFlagDto { Key = "school_admin_export", Description = "Allow school admins to export learner data", Enabled = true, Rollout = 100, Env = "production" },
            }.ToDictionary(f => f.Key));

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
