using Aptiverse.Calendar.Application.CalendarEvents.Dtos;
using Aptiverse.Calendar.Domain.Models.Calendar;
using Aptiverse.Calendar.Domain.Repositories;
using AutoMapper;

namespace Aptiverse.Calendar.Application.CalendarEvents.Services
{
    public class CalendarEventService(IRepository<CalendarEvent> repository, IMapper mapper) : ICalendarEventService
    {
        public async Task<CalendarEventDto> CreateAsync(CreateCalendarEventDto dto)
        {
            var entity = mapper.Map<CalendarEvent>(dto);
            await repository.AddAsync(entity);
            return mapper.Map<CalendarEventDto>(entity);
        }

        public async Task<CalendarEventDto?> GetByIdAsync(long id)
        {
            var entity = await repository.GetByIdAsync(id);
            return entity == null ? null : mapper.Map<CalendarEventDto>(entity);
        }

        public async Task<PaginatedResult<CalendarEventDto>> GetPaginatedAsync(int page, int pageSize)
        {
            var result = await repository.GetPaginatedAsync(page, pageSize);
            var dtos = mapper.Map<IEnumerable<CalendarEventDto>>(result.Data);
            return new PaginatedResult<CalendarEventDto>(dtos, result.TotalRecords, result.PageNumber, result.PageSize);
        }

        public async Task<CalendarEventDto?> UpdateAsync(long id, UpdateCalendarEventDto dto)
        {
            var entity = await repository.GetByIdAsync(id);
            if (entity == null) return null;
            mapper.Map(dto, entity);
            await repository.UpdateAsync(entity);
            return mapper.Map<CalendarEventDto>(entity);
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
