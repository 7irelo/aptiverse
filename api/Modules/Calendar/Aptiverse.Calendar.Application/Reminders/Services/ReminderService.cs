using Aptiverse.Calendar.Application.Reminders.Dtos;
using Aptiverse.Calendar.Domain.Models.Calendar;
using Aptiverse.Calendar.Domain.Repositories;
using AutoMapper;

namespace Aptiverse.Calendar.Application.Reminders.Services
{
    public class ReminderService(IRepository<Reminder> repository, IMapper mapper) : IReminderService
    {
        public async Task<ReminderDto> CreateAsync(CreateReminderDto dto)
        {
            var entity = mapper.Map<Reminder>(dto);
            await repository.AddAsync(entity);
            return mapper.Map<ReminderDto>(entity);
        }

        public async Task<ReminderDto?> GetByIdAsync(long id)
        {
            var entity = await repository.GetByIdAsync(id);
            return entity == null ? null : mapper.Map<ReminderDto>(entity);
        }

        public async Task<PaginatedResult<ReminderDto>> GetPaginatedAsync(int page, int pageSize)
        {
            var result = await repository.GetPaginatedAsync(page, pageSize);
            var dtos = mapper.Map<IEnumerable<ReminderDto>>(result.Data);
            return new PaginatedResult<ReminderDto>(dtos, result.TotalRecords, result.PageNumber, result.PageSize);
        }

        public async Task<ReminderDto?> UpdateAsync(long id, UpdateReminderDto dto)
        {
            var entity = await repository.GetByIdAsync(id);
            if (entity == null) return null;
            mapper.Map(dto, entity);
            await repository.UpdateAsync(entity);
            return mapper.Map<ReminderDto>(entity);
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
