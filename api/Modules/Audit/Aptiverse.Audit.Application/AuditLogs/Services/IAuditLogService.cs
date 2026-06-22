using Aptiverse.Audit.Application.AuditLogs.Dtos;
using Aptiverse.Audit.Domain.Repositories;

namespace Aptiverse.Audit.Application.AuditLogs.Services
{
    public interface IAuditLogService
    {
        Task<AuditLogDto> CreateAsync(CreateAuditLogDto dto);
        Task<AuditLogDto?> GetByIdAsync(long id);
        Task<PaginatedResult<AuditLogDto>> GetPaginatedAsync(int page, int pageSize);
        Task<AuditLogDto?> UpdateAsync(long id, UpdateAuditLogDto dto);
        Task<bool> DeleteAsync(long id);
    }
}
