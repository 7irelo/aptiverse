using Aptiverse.Calendar.Application.CalendarSyncs.Dtos;
using Aptiverse.Calendar.Domain.Repositories;

namespace Aptiverse.Calendar.Application.CalendarSyncs.Services
{
    public interface ICalendarSyncService
    {
        Task<CalendarSyncDto> CreateAsync(CreateCalendarSyncDto dto);
        Task<CalendarSyncDto?> GetByIdAsync(long id);
        Task<PaginatedResult<CalendarSyncDto>> GetPaginatedAsync(int page, int pageSize);
        Task<CalendarSyncDto?> UpdateAsync(long id, UpdateCalendarSyncDto dto);
        Task<bool> DeleteAsync(long id);
    }
}
