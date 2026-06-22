using Aptiverse.Moderation.Application.ModerationActions.Dtos;
using Aptiverse.Moderation.Domain.Models.Moderation;
using Aptiverse.Moderation.Domain.Repositories;
using AutoMapper;

namespace Aptiverse.Moderation.Application.ModerationActions.Services
{
    public class ModerationActionService(IRepository<ModerationAction> repository, IMapper mapper) : IModerationActionService
    {
        public async Task<ModerationActionDto> CreateAsync(CreateModerationActionDto dto)
        {
            var entity = mapper.Map<ModerationAction>(dto);
            await repository.AddAsync(entity);
            return mapper.Map<ModerationActionDto>(entity);
        }

        public async Task<ModerationActionDto?> GetByIdAsync(long id)
        {
            var entity = await repository.GetByIdAsync(id);
            return entity == null ? null : mapper.Map<ModerationActionDto>(entity);
        }

        public async Task<PaginatedResult<ModerationActionDto>> GetPaginatedAsync(int page, int pageSize)
        {
            var result = await repository.GetPaginatedAsync(page, pageSize);
            var dtos = mapper.Map<IEnumerable<ModerationActionDto>>(result.Data);
            return new PaginatedResult<ModerationActionDto>(dtos, result.TotalRecords, result.PageNumber, result.PageSize);
        }

        public async Task<ModerationActionDto?> UpdateAsync(long id, UpdateModerationActionDto dto)
        {
            var entity = await repository.GetByIdAsync(id);
            if (entity == null) return null;
            mapper.Map(dto, entity);
            await repository.UpdateAsync(entity);
            return mapper.Map<ModerationActionDto>(entity);
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
