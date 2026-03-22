using Aptiverse.Moderation.Application.ContentFilters.Dtos;
using Aptiverse.Moderation.Application.ContentFilters.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Aptiverse.Moderation.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ContentFiltersController(IContentFilterService contentFilterService) : ControllerBase
    {
        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            var result = await contentFilterService.GetPaginatedAsync(page, pageSize);
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(long id)
        {
            var result = await contentFilterService.GetByIdAsync(id);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateContentFilterDto dto)
        {
            var result = await contentFilterService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(long id, [FromBody] UpdateContentFilterDto dto)
        {
            var result = await contentFilterService.UpdateAsync(id, dto);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(long id)
        {
            var success = await contentFilterService.DeleteAsync(id);
            if (!success) return NotFound();
            return NoContent();
        }
    }
}
