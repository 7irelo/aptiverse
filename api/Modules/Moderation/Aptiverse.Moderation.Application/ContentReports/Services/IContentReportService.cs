using Aptiverse.Moderation.Application.ContentReports.Dtos;
using Aptiverse.Moderation.Domain.Repositories;

namespace Aptiverse.Moderation.Application.ContentReports.Services
{
    public interface IContentReportService
    {
        Task<ContentReportDto> CreateAsync(CreateContentReportDto dto);
        Task<ContentReportDto?> GetByIdAsync(long id);
        Task<PaginatedResult<ContentReportDto>> GetPaginatedAsync(int page, int pageSize);
        Task<ContentReportDto?> UpdateAsync(long id, UpdateContentReportDto dto);
        Task<bool> DeleteAsync(long id);
    }
}
