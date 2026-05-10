using Aptiverse.FeatureFlags.Application.FeatureFlagEvaluations.Dtos;
using Aptiverse.FeatureFlags.Domain.Repositories;

namespace Aptiverse.FeatureFlags.Application.FeatureFlagEvaluations.Services
{
    public interface IFeatureFlagEvaluationService
    {
        Task<FeatureFlagEvaluationDto> CreateAsync(CreateFeatureFlagEvaluationDto dto);
        Task<FeatureFlagEvaluationDto?> GetByIdAsync(long id);
        Task<PaginatedResult<FeatureFlagEvaluationDto>> GetPaginatedAsync(int page, int pageSize);
        Task<FeatureFlagEvaluationDto?> UpdateAsync(long id, UpdateFeatureFlagEvaluationDto dto);
        Task<bool> DeleteAsync(long id);
    }
}
