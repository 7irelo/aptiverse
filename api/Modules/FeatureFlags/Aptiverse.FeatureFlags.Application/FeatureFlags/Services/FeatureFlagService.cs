using Aptiverse.FeatureFlags.Application.FeatureFlags.Dtos;
using Aptiverse.FeatureFlags.Domain.Models.FeatureFlags;
using Aptiverse.FeatureFlags.Domain.Repositories;
using AutoMapper;

namespace Aptiverse.FeatureFlags.Application.FeatureFlags.Services
{
    public class FeatureFlagService(IRepository<FeatureFlag> repository, IMapper mapper) : IFeatureFlagService
    {
        public async Task<FeatureFlagDto> CreateAsync(CreateFeatureFlagDto dto)
        {
            var entity = mapper.Map<FeatureFlag>(dto);
            await repository.AddAsync(entity);
            return mapper.Map<FeatureFlagDto>(entity);
        }

        public async Task<FeatureFlagDto?> GetByIdAsync(long id)
        {
            var entity = await repository.GetByIdAsync(id);
            return entity == null ? null : mapper.Map<FeatureFlagDto>(entity);
        }

        public async Task<PaginatedResult<FeatureFlagDto>> GetPaginatedAsync(int page, int pageSize)
        {
            var result = await repository.GetPaginatedAsync(page, pageSize);
            var dtos = mapper.Map<IEnumerable<FeatureFlagDto>>(result.Data);
            return new PaginatedResult<FeatureFlagDto>(dtos, result.TotalRecords, result.PageNumber, result.PageSize);
        }

        public async Task<FeatureFlagDto?> UpdateAsync(long id, UpdateFeatureFlagDto dto)
        {
            var entity = await repository.GetByIdAsync(id);
            if (entity == null) return null;
            mapper.Map(dto, entity);
            await repository.UpdateAsync(entity);
            return mapper.Map<FeatureFlagDto>(entity);
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
