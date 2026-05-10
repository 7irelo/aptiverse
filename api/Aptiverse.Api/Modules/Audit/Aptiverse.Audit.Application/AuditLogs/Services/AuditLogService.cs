using Aptiverse.Audit.Application.AuditLogs.Dtos;
using Aptiverse.Audit.Domain.Models.Audit;
using Aptiverse.Audit.Domain.Repositories;
using AutoMapper;

namespace Aptiverse.Audit.Application.AuditLogs.Services
{
    public class AuditLogService(IRepository<AuditLog> repository, IMapper mapper) : IAuditLogService
    {
        public async Task<AuditLogDto> CreateAsync(CreateAuditLogDto dto)
        {
            var entity = mapper.Map<AuditLog>(dto);
            await repository.AddAsync(entity);
            return mapper.Map<AuditLogDto>(entity);
        }

        public async Task<AuditLogDto?> GetByIdAsync(long id)
        {
            var entity = await repository.GetByIdAsync(id);
            return entity == null ? null : mapper.Map<AuditLogDto>(entity);
        }

        public async Task<PaginatedResult<AuditLogDto>> GetPaginatedAsync(int page, int pageSize)
        {
            var result = await repository.GetPaginatedAsync(page, pageSize);
            var dtos = mapper.Map<IEnumerable<AuditLogDto>>(result.Data);
            return new PaginatedResult<AuditLogDto>(dtos, result.TotalRecords, result.PageNumber, result.PageSize);
        }

        public async Task<AuditLogDto?> UpdateAsync(long id, UpdateAuditLogDto dto)
        {
            var entity = await repository.GetByIdAsync(id);
            if (entity == null) return null;
            mapper.Map(dto, entity);
            await repository.UpdateAsync(entity);
            return mapper.Map<AuditLogDto>(entity);
        }

        public async Task<bool> DeleteAsync(long id)
        {
            var entity = await repository.GetByIdAsync(id);
            if (entity == null) return false;
            await repository.DeleteAsync(entity);
            return true;
        }
    }
}
