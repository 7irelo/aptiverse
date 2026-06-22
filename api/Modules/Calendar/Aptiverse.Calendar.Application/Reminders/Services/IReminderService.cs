using Aptiverse.Calendar.Application.Reminders.Dtos;
using Aptiverse.Calendar.Domain.Repositories;

namespace Aptiverse.Calendar.Application.Reminders.Services
{
    public interface IReminderService
    {
        Task<ReminderDto> CreateAsync(CreateReminderDto dto);
        Task<ReminderDto?> GetByIdAsync(long id);
        Task<PaginatedResult<ReminderDto>> GetPaginatedAsync(int page, int pageSize);
        Task<ReminderDto?> UpdateAsync(long id, UpdateReminderDto dto);
        Task<bool> DeleteAsync(long id);
    }
}
