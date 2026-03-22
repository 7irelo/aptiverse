using Aptiverse.Support.Application.SupportMessages.Dtos;
using Aptiverse.Support.Application.SupportMessages.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Aptiverse.Support.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class SupportMessagesController(ISupportMessageService supportMessageService) : ControllerBase
    {
        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            var result = await supportMessageService.GetPaginatedAsync(page, pageSize);
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(long id)
        {
            var result = await supportMessageService.GetByIdAsync(id);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateSupportMessageDto dto)
        {
            var result = await supportMessageService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(long id, [FromBody] UpdateSupportMessageDto dto)
        {
            var result = await supportMessageService.UpdateAsync(id, dto);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(long id)
        {
            var success = await supportMessageService.DeleteAsync(id);
            if (!success) return NotFound();
            return NoContent();
        }
    }
}
