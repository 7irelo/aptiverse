using Aptiverse.Wellbeing.Application.DiaryGoals.Dtos;
using Aptiverse.Wellbeing.Domain.Repositories;

namespace Aptiverse.Wellbeing.Application.DiaryGoals.Services
{
    public interface IDiaryGoalService
    {
        Task<DiaryGoalDto> CreateAsync(CreateDiaryGoalDto dto);
        Task<DiaryGoalDto?> GetByIdAsync(long id);
        Task<PaginatedResult<DiaryGoalDto>> GetPaginatedAsync(int page, int pageSize);
        Task<DiaryGoalDto?> UpdateAsync(long id, UpdateDiaryGoalDto dto);
        Task<bool> DeleteAsync(long id);
    }
}
