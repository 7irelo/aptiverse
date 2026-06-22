using Aptiverse.Audit.Application.AuditActions.Dtos;
using Aptiverse.Audit.Domain.Repositories;

namespace Aptiverse.Audit.Application.AuditActions.Services
{
    public interface IAuditActionService
    {
        Task<AuditActionDto> CreateAsync(CreateAuditActionDto dto);
        Task<AuditActionDto?> GetByIdAsync(long id);
        Task<PaginatedResult<AuditActionDto>> GetPaginatedAsync(int page, int pageSize);
        Task<AuditActionDto?> UpdateAsync(long id, UpdateAuditActionDto dto);
        Task<bool> DeleteAsync(long id);
    }
}
