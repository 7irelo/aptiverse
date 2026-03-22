using Aptiverse.FeatureFlags.Application.FeatureFlags.Dtos;
using Aptiverse.FeatureFlags.Domain.Repositories;

namespace Aptiverse.FeatureFlags.Application.FeatureFlags.Services
{
    public interface IFeatureFlagService
    {
        Task<FeatureFlagDto> CreateAsync(CreateFeatureFlagDto dto);
        Task<FeatureFlagDto?> GetByIdAsync(long id);
        Task<PaginatedResult<FeatureFlagDto>> GetPaginatedAsync(int page, int pageSize);
        Task<FeatureFlagDto?> UpdateAsync(long id, UpdateFeatureFlagDto dto);
        Task<bool> DeleteAsync(long id);
    }
}
