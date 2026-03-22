using Aptiverse.Support.Application.SupportCategories.Dtos;
using Aptiverse.Support.Domain.Models.Support;
using Aptiverse.Support.Domain.Repositories;
using AutoMapper;

namespace Aptiverse.Support.Application.SupportCategories.Services
{
    public class SupportCategoryService(IRepository<SupportCategory> repository, IMapper mapper) : ISupportCategoryService
    {
        public async Task<SupportCategoryDto> CreateAsync(CreateSupportCategoryDto dto)
        {
            var entity = mapper.Map<SupportCategory>(dto);
            await repository.AddAsync(entity);
            return mapper.Map<SupportCategoryDto>(entity);
        }

        public async Task<SupportCategoryDto?> GetByIdAsync(long id)
        {
            var entity = await repository.GetByIdAsync(id);
            return entity == null ? null : mapper.Map<SupportCategoryDto>(entity);
        }

        public async Task<PaginatedResult<SupportCategoryDto>> GetPaginatedAsync(int page, int pageSize)
        {
            var result = await repository.GetPaginatedAsync(page, pageSize);
            var dtos = mapper.Map<IEnumerable<SupportCategoryDto>>(result.Data);
            return new PaginatedResult<SupportCategoryDto>(dtos, result.TotalRecords, result.PageNumber, result.PageSize);
        }

        public async Task<SupportCategoryDto?> UpdateAsync(long id, UpdateSupportCategoryDto dto)
        {
            var entity = await repository.GetByIdAsync(id);
            if (entity == null) return null;
            mapper.Map(dto, entity);
            await repository.UpdateAsync(entity);
            return mapper.Map<SupportCategoryDto>(entity);
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
