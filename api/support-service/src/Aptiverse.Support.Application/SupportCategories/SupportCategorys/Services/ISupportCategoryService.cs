using Aptiverse.Support.Application.SupportCategories.Dtos;
using Aptiverse.Support.Domain.Repositories;

namespace Aptiverse.Support.Application.SupportCategories.Services
{
    public interface ISupportCategoryService
    {
        Task<SupportCategoryDto> CreateAsync(CreateSupportCategoryDto dto);
        Task<SupportCategoryDto?> GetByIdAsync(long id);
        Task<PaginatedResult<SupportCategoryDto>> GetPaginatedAsync(int page, int pageSize);
        Task<SupportCategoryDto?> UpdateAsync(long id, UpdateSupportCategoryDto dto);
        Task<bool> DeleteAsync(long id);
    }
}
