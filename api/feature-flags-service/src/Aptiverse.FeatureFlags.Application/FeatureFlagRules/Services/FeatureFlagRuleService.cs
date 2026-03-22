using Aptiverse.FeatureFlags.Application.FeatureFlagRules.Dtos;
using Aptiverse.FeatureFlags.Domain.Models.FeatureFlags;
using Aptiverse.FeatureFlags.Domain.Repositories;
using AutoMapper;

namespace Aptiverse.FeatureFlags.Application.FeatureFlagRules.Services
{
    public class FeatureFlagRuleService(IRepository<FeatureFlagRule> repository, IMapper mapper) : IFeatureFlagRuleService
    {
        public async Task<FeatureFlagRuleDto> CreateAsync(CreateFeatureFlagRuleDto dto)
        {
            var entity = mapper.Map<FeatureFlagRule>(dto);
            await repository.AddAsync(entity);
            return mapper.Map<FeatureFlagRuleDto>(entity);
        }

        public async Task<FeatureFlagRuleDto?> GetByIdAsync(long id)
        {
            var entity = await repository.GetByIdAsync(id);
            return entity == null ? null : mapper.Map<FeatureFlagRuleDto>(entity);
        }

        public async Task<PaginatedResult<FeatureFlagRuleDto>> GetPaginatedAsync(int page, int pageSize)
        {
            var result = await repository.GetPaginatedAsync(page, pageSize);
            var dtos = mapper.Map<IEnumerable<FeatureFlagRuleDto>>(result.Data);
            return new PaginatedResult<FeatureFlagRuleDto>(dtos, result.TotalRecords, result.PageNumber, result.PageSize);
        }

        public async Task<FeatureFlagRuleDto?> UpdateAsync(long id, UpdateFeatureFlagRuleDto dto)
        {
            var entity = await repository.GetByIdAsync(id);
            if (entity == null) return null;
            mapper.Map(dto, entity);
            await repository.UpdateAsync(entity);
            return mapper.Map<FeatureFlagRuleDto>(entity);
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
