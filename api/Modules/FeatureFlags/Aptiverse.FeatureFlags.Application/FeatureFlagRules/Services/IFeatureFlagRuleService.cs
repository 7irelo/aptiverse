using Aptiverse.FeatureFlags.Application.FeatureFlagRules.Dtos;
using Aptiverse.FeatureFlags.Domain.Repositories;

namespace Aptiverse.FeatureFlags.Application.FeatureFlagRules.Services
{
    public interface IFeatureFlagRuleService
    {
        Task<FeatureFlagRuleDto> CreateAsync(CreateFeatureFlagRuleDto dto);
        Task<FeatureFlagRuleDto?> GetByIdAsync(long id);
        Task<PaginatedResult<FeatureFlagRuleDto>> GetPaginatedAsync(int page, int pageSize);
        Task<FeatureFlagRuleDto?> UpdateAsync(long id, UpdateFeatureFlagRuleDto dto);
        Task<bool> DeleteAsync(long id);
    }
}
