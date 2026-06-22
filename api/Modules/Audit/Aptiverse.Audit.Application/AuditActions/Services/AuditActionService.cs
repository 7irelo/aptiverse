using Aptiverse.Audit.Application.AuditActions.Dtos;
using Aptiverse.Audit.Domain.Models.Audit;
using Aptiverse.Audit.Domain.Repositories;
using AutoMapper;

namespace Aptiverse.Audit.Application.AuditActions.Services
{
    public class AuditActionService(IRepository<AuditAction> repository, IMapper mapper) : IAuditActionService
    {
        public async Task<AuditActionDto> CreateAsync(CreateAuditActionDto dto)
        {
            var entity = mapper.Map<AuditAction>(dto);
            await repository.AddAsync(entity);
            return mapper.Map<AuditActionDto>(entity);
        }

        public async Task<AuditActionDto?> GetByIdAsync(long id)
        {
            var entity = await repository.GetByIdAsync(id);
            return entity == null ? null : mapper.Map<AuditActionDto>(entity);
        }

        public async Task<PaginatedResult<AuditActionDto>> GetPaginatedAsync(int page, int pageSize)
        {
            var result = await repository.GetPaginatedAsync(page, pageSize);
            var dtos = mapper.Map<IEnumerable<AuditActionDto>>(result.Data);
            return new PaginatedResult<AuditActionDto>(dtos, result.TotalRecords, result.PageNumber, result.PageSize);
        }

        public async Task<AuditActionDto?> UpdateAsync(long id, UpdateAuditActionDto dto)
        {
            var entity = await repository.GetByIdAsync(id);
            if (entity == null) return null;
            mapper.Map(dto, entity);
            await repository.UpdateAsync(entity);
            return mapper.Map<AuditActionDto>(entity);
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
