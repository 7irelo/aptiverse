using Aptiverse.Audit.Application.AuditActions.Dtos;
using Aptiverse.Audit.Application.AuditActions.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Aptiverse.Audit.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AuditActionsController(IAuditActionService auditActionService) : ControllerBase
    {
        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            var result = await auditActionService.GetPaginatedAsync(page, pageSize);
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(long id)
        {
            var result = await auditActionService.GetByIdAsync(id);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateAuditActionDto dto)
        {
            var result = await auditActionService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(long id, [FromBody] UpdateAuditActionDto dto)
        {
            var result = await auditActionService.UpdateAsync(id, dto);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(long id)
        {
            var success = await auditActionService.DeleteAsync(id);
            if (!success) return NotFound();
            return NoContent();
        }
    }
}
