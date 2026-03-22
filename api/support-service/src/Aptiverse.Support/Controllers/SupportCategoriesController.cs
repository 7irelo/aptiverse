using Aptiverse.Support.Application.SupportCategories.Dtos;
using Aptiverse.Support.Application.SupportCategories.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Aptiverse.Support.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class SupportCategoriesController(ISupportCategoryService supportCategoryService) : ControllerBase
    {
        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            var result = await supportCategoryService.GetPaginatedAsync(page, pageSize);
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(long id)
        {
            var result = await supportCategoryService.GetByIdAsync(id);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateSupportCategoryDto dto)
        {
            var result = await supportCategoryService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(long id, [FromBody] UpdateSupportCategoryDto dto)
        {
            var result = await supportCategoryService.UpdateAsync(id, dto);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(long id)
        {
            var success = await supportCategoryService.DeleteAsync(id);
            if (!success) return NotFound();
            return NoContent();
        }
    }
}
