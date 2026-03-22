using Aptiverse.Support.Application.SupportMessages.Dtos;
using Aptiverse.Support.Domain.Models.Support;
using Aptiverse.Support.Domain.Repositories;
using AutoMapper;

namespace Aptiverse.Support.Application.SupportMessages.Services
{
    public class SupportMessageService(IRepository<SupportMessage> repository, IMapper mapper) : ISupportMessageService
    {
        public async Task<SupportMessageDto> CreateAsync(CreateSupportMessageDto dto)
        {
            var entity = mapper.Map<SupportMessage>(dto);
            await repository.AddAsync(entity);
            return mapper.Map<SupportMessageDto>(entity);
        }

        public async Task<SupportMessageDto?> GetByIdAsync(long id)
        {
            var entity = await repository.GetByIdAsync(id);
            return entity == null ? null : mapper.Map<SupportMessageDto>(entity);
        }

        public async Task<PaginatedResult<SupportMessageDto>> GetPaginatedAsync(int page, int pageSize)
        {
            var result = await repository.GetPaginatedAsync(page, pageSize);
            var dtos = mapper.Map<IEnumerable<SupportMessageDto>>(result.Data);
            return new PaginatedResult<SupportMessageDto>(dtos, result.TotalRecords, result.PageNumber, result.PageSize);
        }

        public async Task<SupportMessageDto?> UpdateAsync(long id, UpdateSupportMessageDto dto)
        {
            var entity = await repository.GetByIdAsync(id);
            if (entity == null) return null;
            mapper.Map(dto, entity);
            await repository.UpdateAsync(entity);
            return mapper.Map<SupportMessageDto>(entity);
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
