using Aptiverse.Wellbeing.Application.MoodTrackings.Dtos;
using Aptiverse.Wellbeing.Application.MoodTrackings.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Aptiverse.Wellbeing.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class MoodTrackingsController(IMoodTrackingService moodTrackingService) : ControllerBase
    {
        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            var result = await moodTrackingService.GetPaginatedAsync(page, pageSize);
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(long id)
        {
            var result = await moodTrackingService.GetByIdAsync(id);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateMoodTrackingDto dto)
        {
            var result = await moodTrackingService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(long id, [FromBody] UpdateMoodTrackingDto dto)
        {
            var result = await moodTrackingService.UpdateAsync(id, dto);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(long id)
        {
            var success = await moodTrackingService.DeleteAsync(id);
            if (!success) return NotFound();
            return NoContent();
        }
    }
}
