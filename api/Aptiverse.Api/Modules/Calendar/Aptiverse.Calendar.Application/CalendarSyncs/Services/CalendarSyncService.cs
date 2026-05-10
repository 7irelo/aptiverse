using Aptiverse.Calendar.Application.CalendarSyncs.Dtos;
using Aptiverse.Calendar.Domain.Models.Calendar;
using Aptiverse.Calendar.Domain.Repositories;
using AutoMapper;

namespace Aptiverse.Calendar.Application.CalendarSyncs.Services
{
    public class CalendarSyncService(IRepository<CalendarSync> repository, IMapper mapper) : ICalendarSyncService
    {
        public async Task<CalendarSyncDto> CreateAsync(CreateCalendarSyncDto dto)
        {
            var entity = mapper.Map<CalendarSync>(dto);
            await repository.AddAsync(entity);
            return mapper.Map<CalendarSyncDto>(entity);
        }

        public async Task<CalendarSyncDto?> GetByIdAsync(long id)
        {
            var entity = await repository.GetByIdAsync(id);
            return entity == null ? null : mapper.Map<CalendarSyncDto>(entity);
        }

        public async Task<PaginatedResult<CalendarSyncDto>> GetPaginatedAsync(int page, int pageSize)
        {
            var result = await repository.GetPaginatedAsync(page, pageSize);
            var dtos = mapper.Map<IEnumerable<CalendarSyncDto>>(result.Data);
            return new PaginatedResult<CalendarSyncDto>(dtos, result.TotalRecords, result.PageNumber, result.PageSize);
        }

        public async Task<CalendarSyncDto?> UpdateAsync(long id, UpdateCalendarSyncDto dto)
        {
            var entity = await repository.GetByIdAsync(id);
            if (entity == null) return null;
            mapper.Map(dto, entity);
            await repository.UpdateAsync(entity);
            return mapper.Map<CalendarSyncDto>(entity);
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
