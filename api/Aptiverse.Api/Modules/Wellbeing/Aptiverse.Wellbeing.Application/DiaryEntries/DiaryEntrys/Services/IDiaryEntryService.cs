using Aptiverse.Wellbeing.Application.DiaryEntries.Dtos;
using Aptiverse.Wellbeing.Domain.Repositories;

namespace Aptiverse.Wellbeing.Application.DiaryEntries.Services
{
    public interface IDiaryEntryService
    {
        Task<DiaryEntryDto> CreateAsync(CreateDiaryEntryDto dto);
        Task<DiaryEntryDto?> GetByIdAsync(long id);
        Task<PaginatedResult<DiaryEntryDto>> GetPaginatedAsync(int page, int pageSize);
        Task<DiaryEntryDto?> UpdateAsync(long id, UpdateDiaryEntryDto dto);
        Task<bool> DeleteAsync(long id);
    }
}
