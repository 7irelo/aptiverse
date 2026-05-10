using Aptiverse.Moderation.Application.ContentReports.Dtos;
using Aptiverse.Moderation.Domain.Models.Moderation;
using Aptiverse.Moderation.Domain.Repositories;
using AutoMapper;

namespace Aptiverse.Moderation.Application.ContentReports.Services
{
    public class ContentReportService(IRepository<ContentReport> repository, IMapper mapper) : IContentReportService
    {
        public async Task<ContentReportDto> CreateAsync(CreateContentReportDto dto)
        {
            var entity = mapper.Map<ContentReport>(dto);
            await repository.AddAsync(entity);
            return mapper.Map<ContentReportDto>(entity);
        }

        public async Task<ContentReportDto?> GetByIdAsync(long id)
        {
            var entity = await repository.GetByIdAsync(id);
            return entity == null ? null : mapper.Map<ContentReportDto>(entity);
        }

        public async Task<PaginatedResult<ContentReportDto>> GetPaginatedAsync(int page, int pageSize)
        {
            var result = await repository.GetPaginatedAsync(page, pageSize);
            var dtos = mapper.Map<IEnumerable<ContentReportDto>>(result.Data);
            return new PaginatedResult<ContentReportDto>(dtos, result.TotalRecords, result.PageNumber, result.PageSize);
        }

        public async Task<ContentReportDto?> UpdateAsync(long id, UpdateContentReportDto dto)
        {
            var entity = await repository.GetByIdAsync(id);
            if (entity == null) return null;
            mapper.Map(dto, entity);
            await repository.UpdateAsync(entity);
            return mapper.Map<ContentReportDto>(entity);
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
