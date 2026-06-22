using Aptiverse.Wellbeing.Application.DiaryGoals.Dtos;
using Aptiverse.Wellbeing.Domain.Models.Wellbeing;
using Aptiverse.Wellbeing.Domain.Repositories;
using AutoMapper;

namespace Aptiverse.Wellbeing.Application.DiaryGoals.Services
{
    public class DiaryGoalService(IRepository<DiaryGoal> repository, IMapper mapper) : IDiaryGoalService
    {
        public async Task<DiaryGoalDto> CreateAsync(CreateDiaryGoalDto dto)
        {
            var entity = mapper.Map<DiaryGoal>(dto);
            await repository.AddAsync(entity);
            return mapper.Map<DiaryGoalDto>(entity);
        }

        public async Task<DiaryGoalDto?> GetByIdAsync(long id)
        {
            var entity = await repository.GetByIdAsync(id);
            return entity == null ? null : mapper.Map<DiaryGoalDto>(entity);
        }

        public async Task<PaginatedResult<DiaryGoalDto>> GetPaginatedAsync(int page, int pageSize)
        {
            var result = await repository.GetPaginatedAsync(page, pageSize);
            var dtos = mapper.Map<IEnumerable<DiaryGoalDto>>(result.Data);
            return new PaginatedResult<DiaryGoalDto>(dtos, result.TotalRecords, result.PageNumber, result.PageSize);
        }

        public async Task<DiaryGoalDto?> UpdateAsync(long id, UpdateDiaryGoalDto dto)
        {
            var entity = await repository.GetByIdAsync(id);
            if (entity == null) return null;
            mapper.Map(dto, entity);
            await repository.UpdateAsync(entity);
            return mapper.Map<DiaryGoalDto>(entity);
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
