using Aptiverse.Support.Application.SupportMessages.Dtos;
using Aptiverse.Support.Domain.Repositories;

namespace Aptiverse.Support.Application.SupportMessages.Services
{
    public interface ISupportMessageService
    {
        Task<SupportMessageDto> CreateAsync(CreateSupportMessageDto dto);
        Task<SupportMessageDto?> GetByIdAsync(long id);
        Task<PaginatedResult<SupportMessageDto>> GetPaginatedAsync(int page, int pageSize);
        Task<SupportMessageDto?> UpdateAsync(long id, UpdateSupportMessageDto dto);
        Task<bool> DeleteAsync(long id);
    }
}
