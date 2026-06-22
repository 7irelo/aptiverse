using Aptiverse.Moderation.Application.ContentFilters.Dtos;
using Aptiverse.Moderation.Domain.Models.Moderation;
using Aptiverse.Moderation.Domain.Repositories;
using AutoMapper;

namespace Aptiverse.Moderation.Application.ContentFilters.Services
{
    public class ContentFilterService(IRepository<ContentFilter> repository, IMapper mapper) : IContentFilterService
    {
        public async Task<ContentFilterDto> CreateAsync(CreateContentFilterDto dto)
        {
            var entity = mapper.Map<ContentFilter>(dto);
            await repository.AddAsync(entity);
            return mapper.Map<ContentFilterDto>(entity);
        }

        public async Task<ContentFilterDto?> GetByIdAsync(long id)
        {
            var entity = await repository.GetByIdAsync(id);
            return entity == null ? null : mapper.Map<ContentFilterDto>(entity);
        }

        public async Task<PaginatedResult<ContentFilterDto>> GetPaginatedAsync(int page, int pageSize)
        {
            var result = await repository.GetPaginatedAsync(page, pageSize);
            var dtos = mapper.Map<IEnumerable<ContentFilterDto>>(result.Data);
            return new PaginatedResult<ContentFilterDto>(dtos, result.TotalRecords, result.PageNumber, result.PageSize);
        }

        public async Task<ContentFilterDto?> UpdateAsync(long id, UpdateContentFilterDto dto)
        {
            var entity = await repository.GetByIdAsync(id);
            if (entity == null) return null;
            mapper.Map(dto, entity);
            await repository.UpdateAsync(entity);
            return mapper.Map<ContentFilterDto>(entity);
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
