using Aptiverse.Support.Application.SupportTickets.Dtos;
using Aptiverse.Support.Domain.Models.Support;
using Aptiverse.Support.Domain.Repositories;
using AutoMapper;

namespace Aptiverse.Support.Application.SupportTickets.Services
{
    public class SupportTicketService(IRepository<SupportTicket> repository, IMapper mapper) : ISupportTicketService
    {
        public async Task<SupportTicketDto> CreateAsync(CreateSupportTicketDto dto)
        {
            var entity = mapper.Map<SupportTicket>(dto);
            await repository.AddAsync(entity);
            return mapper.Map<SupportTicketDto>(entity);
        }

        public async Task<SupportTicketDto?> GetByIdAsync(long id)
        {
            var entity = await repository.GetByIdAsync(id);
            return entity == null ? null : mapper.Map<SupportTicketDto>(entity);
        }

        public async Task<PaginatedResult<SupportTicketDto>> GetPaginatedAsync(int page, int pageSize)
        {
            var result = await repository.GetPaginatedAsync(page, pageSize);
            var dtos = mapper.Map<IEnumerable<SupportTicketDto>>(result.Data);
            return new PaginatedResult<SupportTicketDto>(dtos, result.TotalRecords, result.PageNumber, result.PageSize);
        }

        public async Task<SupportTicketDto?> UpdateAsync(long id, UpdateSupportTicketDto dto)
        {
            var entity = await repository.GetByIdAsync(id);
            if (entity == null) return null;
            mapper.Map(dto, entity);
            await repository.UpdateAsync(entity);
            return mapper.Map<SupportTicketDto>(entity);
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
