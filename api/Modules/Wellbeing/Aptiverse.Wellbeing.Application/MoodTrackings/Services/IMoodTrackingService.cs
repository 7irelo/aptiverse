using Aptiverse.Wellbeing.Application.MoodTrackings.Dtos;
using Aptiverse.Wellbeing.Domain.Repositories;

namespace Aptiverse.Wellbeing.Application.MoodTrackings.Services
{
    public interface IMoodTrackingService
    {
        Task<MoodTrackingDto> CreateAsync(CreateMoodTrackingDto dto);
        Task<MoodTrackingDto?> GetByIdAsync(long id);
        Task<PaginatedResult<MoodTrackingDto>> GetPaginatedAsync(int page, int pageSize);
        Task<MoodTrackingDto?> UpdateAsync(long id, UpdateMoodTrackingDto dto);
        Task<bool> DeleteAsync(long id);
    }
}
