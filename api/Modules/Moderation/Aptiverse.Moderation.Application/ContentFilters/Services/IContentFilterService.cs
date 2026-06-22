using Aptiverse.Moderation.Application.ContentFilters.Dtos;
using Aptiverse.Moderation.Domain.Repositories;

namespace Aptiverse.Moderation.Application.ContentFilters.Services
{
    public interface IContentFilterService
    {
        Task<ContentFilterDto> CreateAsync(CreateContentFilterDto dto);
        Task<ContentFilterDto?> GetByIdAsync(long id);
        Task<PaginatedResult<ContentFilterDto>> GetPaginatedAsync(int page, int pageSize);
        Task<ContentFilterDto?> UpdateAsync(long id, UpdateContentFilterDto dto);
        Task<bool> DeleteAsync(long id);
    }
}
