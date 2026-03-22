using Aptiverse.FeatureFlags.Application.FeatureFlagRules.Dtos;
using Aptiverse.FeatureFlags.Application.FeatureFlagRules.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Aptiverse.FeatureFlags.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class FeatureFlagRulesController(IFeatureFlagRuleService featureFlagRuleService) : ControllerBase
    {
        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            var result = await featureFlagRuleService.GetPaginatedAsync(page, pageSize);
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(long id)
        {
            var result = await featureFlagRuleService.GetByIdAsync(id);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateFeatureFlagRuleDto dto)
        {
            var result = await featureFlagRuleService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(long id, [FromBody] UpdateFeatureFlagRuleDto dto)
        {
            var result = await featureFlagRuleService.UpdateAsync(id, dto);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(long id)
        {
            var success = await featureFlagRuleService.DeleteAsync(id);
            if (!success) return NotFound();
            return NoContent();
        }
    }
}
