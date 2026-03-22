using Aptiverse.Wellbeing.Application.DiaryEntries.Dtos;
using Aptiverse.Wellbeing.Domain.Models.Wellbeing;
using Aptiverse.Wellbeing.Domain.Repositories;
using AutoMapper;

namespace Aptiverse.Wellbeing.Application.DiaryEntries.Services
{
    public class DiaryEntryService(IRepository<DiaryEntry> repository, IMapper mapper) : IDiaryEntryService
    {
        public async Task<DiaryEntryDto> CreateAsync(CreateDiaryEntryDto dto)
        {
            var entity = mapper.Map<DiaryEntry>(dto);
            await repository.AddAsync(entity);
            return mapper.Map<DiaryEntryDto>(entity);
        }

        public async Task<DiaryEntryDto?> GetByIdAsync(long id)
        {
            var entity = await repository.GetByIdAsync(id);
            return entity == null ? null : mapper.Map<DiaryEntryDto>(entity);
        }

        public async Task<PaginatedResult<DiaryEntryDto>> GetPaginatedAsync(int page, int pageSize)
        {
            var result = await repository.GetPaginatedAsync(page, pageSize);
            var dtos = mapper.Map<IEnumerable<DiaryEntryDto>>(result.Data);
            return new PaginatedResult<DiaryEntryDto>(dtos, result.TotalRecords, result.PageNumber, result.PageSize);
        }

        public async Task<DiaryEntryDto?> UpdateAsync(long id, UpdateDiaryEntryDto dto)
        {
            var entity = await repository.GetByIdAsync(id);
            if (entity == null) return null;
            mapper.Map(dto, entity);
            await repository.UpdateAsync(entity);
            return mapper.Map<DiaryEntryDto>(entity);
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
