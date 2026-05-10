using Aptiverse.Wellbeing.Application.MoodTrackings.Dtos;
using Aptiverse.Wellbeing.Domain.Models.Wellbeing;
using Aptiverse.Wellbeing.Domain.Repositories;
using AutoMapper;

namespace Aptiverse.Wellbeing.Application.MoodTrackings.Services
{
    public class MoodTrackingService(IRepository<MoodTracking> repository, IMapper mapper) : IMoodTrackingService
    {
        public async Task<MoodTrackingDto> CreateAsync(CreateMoodTrackingDto dto)
        {
            var entity = mapper.Map<MoodTracking>(dto);
            await repository.AddAsync(entity);
            return mapper.Map<MoodTrackingDto>(entity);
        }

        public async Task<MoodTrackingDto?> GetByIdAsync(long id)
        {
            var entity = await repository.GetByIdAsync(id);
            return entity == null ? null : mapper.Map<MoodTrackingDto>(entity);
        }

        public async Task<PaginatedResult<MoodTrackingDto>> GetPaginatedAsync(int page, int pageSize)
        {
            var result = await repository.GetPaginatedAsync(page, pageSize);
            var dtos = mapper.Map<IEnumerable<MoodTrackingDto>>(result.Data);
            return new PaginatedResult<MoodTrackingDto>(dtos, result.TotalRecords, result.PageNumber, result.PageSize);
        }

        public async Task<MoodTrackingDto?> UpdateAsync(long id, UpdateMoodTrackingDto dto)
        {
            var entity = await repository.GetByIdAsync(id);
            if (entity == null) return null;
            mapper.Map(dto, entity);
            await repository.UpdateAsync(entity);
            return mapper.Map<MoodTrackingDto>(entity);
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
