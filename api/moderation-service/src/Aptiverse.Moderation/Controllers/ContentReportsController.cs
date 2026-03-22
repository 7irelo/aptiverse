using Aptiverse.Moderation.Application.ContentReports.Dtos;
using Aptiverse.Moderation.Application.ContentReports.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Aptiverse.Moderation.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ContentReportsController(IContentReportService contentReportService) : ControllerBase
    {
        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            var result = await contentReportService.GetPaginatedAsync(page, pageSize);
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(long id)
        {
            var result = await contentReportService.GetByIdAsync(id);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateContentReportDto dto)
        {
            var result = await contentReportService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(long id, [FromBody] UpdateContentReportDto dto)
        {
            var result = await contentReportService.UpdateAsync(id, dto);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(long id)
        {
            var success = await contentReportService.DeleteAsync(id);
            if (!success) return NotFound();
            return NoContent();
        }
    }
}
