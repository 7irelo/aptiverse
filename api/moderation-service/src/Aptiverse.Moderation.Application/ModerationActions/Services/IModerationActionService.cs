using Aptiverse.Moderation.Application.ModerationActions.Dtos;
using Aptiverse.Moderation.Domain.Repositories;

namespace Aptiverse.Moderation.Application.ModerationActions.Services
{
    public interface IModerationActionService
    {
        Task<ModerationActionDto> CreateAsync(CreateModerationActionDto dto);
        Task<ModerationActionDto?> GetByIdAsync(long id);
        Task<PaginatedResult<ModerationActionDto>> GetPaginatedAsync(int page, int pageSize);
        Task<ModerationActionDto?> UpdateAsync(long id, UpdateModerationActionDto dto);
        Task<bool> DeleteAsync(long id);
    }
}
