using Aptiverse.Calendar.Application.CalendarEvents.Dtos;
using Aptiverse.Calendar.Domain.Repositories;

namespace Aptiverse.Calendar.Application.CalendarEvents.Services
{
    public interface ICalendarEventService
    {
        Task<CalendarEventDto> CreateAsync(CreateCalendarEventDto dto);
        Task<CalendarEventDto?> GetByIdAsync(long id);
        Task<PaginatedResult<CalendarEventDto>> GetPaginatedAsync(int page, int pageSize);
        Task<CalendarEventDto?> UpdateAsync(long id, UpdateCalendarEventDto dto);
        Task<bool> DeleteAsync(long id);
    }
}
