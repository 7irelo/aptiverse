using Aptiverse.Support.Application.SupportTickets.Dtos;
using Aptiverse.Support.Domain.Repositories;

namespace Aptiverse.Support.Application.SupportTickets.Services
{
    public interface ISupportTicketService
    {
        Task<SupportTicketDto> CreateAsync(CreateSupportTicketDto dto);
        Task<SupportTicketDto?> GetByIdAsync(long id);
        Task<PaginatedResult<SupportTicketDto>> GetPaginatedAsync(int page, int pageSize);
        Task<SupportTicketDto?> UpdateAsync(long id, UpdateSupportTicketDto dto);
        Task<bool> DeleteAsync(long id);
    }
}
