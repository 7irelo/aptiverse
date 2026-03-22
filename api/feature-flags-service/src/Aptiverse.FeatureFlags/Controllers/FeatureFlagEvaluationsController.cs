using Aptiverse.FeatureFlags.Application.FeatureFlagEvaluations.Dtos;
using Aptiverse.FeatureFlags.Application.FeatureFlagEvaluations.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Aptiverse.FeatureFlags.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class FeatureFlagEvaluationsController(IFeatureFlagEvaluationService featureFlagEvaluationService) : ControllerBase
    {
        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            var result = await featureFlagEvaluationService.GetPaginatedAsync(page, pageSize);
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(long id)
        {
            var result = await featureFlagEvaluationService.GetByIdAsync(id);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateFeatureFlagEvaluationDto dto)
        {
            var result = await featureFlagEvaluationService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(long id, [FromBody] UpdateFeatureFlagEvaluationDto dto)
        {
            var result = await featureFlagEvaluationService.UpdateAsync(id, dto);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(long id)
        {
            var success = await featureFlagEvaluationService.DeleteAsync(id);
            if (!success) return NotFound();
            return NoContent();
        }
    }
}
