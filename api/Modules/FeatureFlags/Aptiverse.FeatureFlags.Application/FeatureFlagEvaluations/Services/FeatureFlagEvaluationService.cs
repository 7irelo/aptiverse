using Aptiverse.FeatureFlags.Application.FeatureFlagEvaluations.Dtos;
using Aptiverse.FeatureFlags.Domain.Models.FeatureFlags;
using Aptiverse.FeatureFlags.Domain.Repositories;
using AutoMapper;

namespace Aptiverse.FeatureFlags.Application.FeatureFlagEvaluations.Services
{
    public class FeatureFlagEvaluationService(IRepository<FeatureFlagEvaluation> repository, IMapper mapper) : IFeatureFlagEvaluationService
    {
        public async Task<FeatureFlagEvaluationDto> CreateAsync(CreateFeatureFlagEvaluationDto dto)
        {
            var entity = mapper.Map<FeatureFlagEvaluation>(dto);
            await repository.AddAsync(entity);
            return mapper.Map<FeatureFlagEvaluationDto>(entity);
        }

        public async Task<FeatureFlagEvaluationDto?> GetByIdAsync(long id)
        {
            var entity = await repository.GetByIdAsync(id);
            return entity == null ? null : mapper.Map<FeatureFlagEvaluationDto>(entity);
        }

        public async Task<PaginatedResult<FeatureFlagEvaluationDto>> GetPaginatedAsync(int page, int pageSize)
        {
            var result = await repository.GetPaginatedAsync(page, pageSize);
            var dtos = mapper.Map<IEnumerable<FeatureFlagEvaluationDto>>(result.Data);
            return new PaginatedResult<FeatureFlagEvaluationDto>(dtos, result.TotalRecords, result.PageNumber, result.PageSize);
        }

        public async Task<FeatureFlagEvaluationDto?> UpdateAsync(long id, UpdateFeatureFlagEvaluationDto dto)
        {
            var entity = await repository.GetByIdAsync(id);
            if (entity == null) return null;
            mapper.Map(dto, entity);
            await repository.UpdateAsync(entity);
            return mapper.Map<FeatureFlagEvaluationDto>(entity);
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
