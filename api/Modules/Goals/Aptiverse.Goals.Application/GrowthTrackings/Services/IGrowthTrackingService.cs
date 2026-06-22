using Aptiverse.Goals.Application.GrowthTrackings.Dtos;
using Aptiverse.Goals.Domain.Repositories;
using System.Security.Claims;

namespace Aptiverse.Goals.Application.GrowthTrackings.Services
{
    public interface IGrowthTrackingService
    {
        Task<GrowthTrackingDto> CreateGrowthTrackingAsync(CreateGrowthTrackingDto createGrowthTrackingDto);
        Task<GrowthTrackingDto?> GetGrowthTrackingByIdAsync(long id);

        Task<PaginatedResult<GrowthTrackingDto>> GetGrowthTrackingsAsync(
            ClaimsPrincipal currentUser,
            string? studentId = null,
            DateTime? fromDate = null,
            DateTime? toDate = null,
            decimal? minGrowth = null,
            decimal? maxGrowth = null,
            string? sortBy = "TrackingDate",
            bool sortDescending = true,
            int page = 1,
            int pageSize = 20);

        Task<GrowthTrackingDto> UpdateGrowthTrackingAsync(long id, UpdateGrowthTrackingDto updateGrowthTrackingDto);
        Task<bool> DeleteGrowthTrackingAsync(long id);
        Task<int> CountGrowthTrackingsAsync(ClaimsPrincipal currentUser,
            string? studentId = null,
            DateTime? fromDate = null,
            DateTime? toDate = null);
        Task<bool> GrowthTrackingExistsAsync(long id);

        Task<IEnumerable<GrowthTrackingDto>> GetGrowthTrackingsByStudentAsync(string studentId);
        Task<IEnumerable<GrowthTrackingDto>> GetGrowthTrackingsByDateRangeAsync(string studentId, DateTime startDate, DateTime endDate);
        Task<GrowthTrackingDto?> GetLatestGrowthTrackingAsync(string studentId);
        Task<GrowthTrackingDto?> GetGrowthTrackingByDateAsync(string studentId, DateTime date);
        Task<Dictionary<string, decimal>> GetGrowthTrendsAsync(string studentId, DateTime? fromDate = null, DateTime? toDate = null);
        Task<decimal> GetAverageOverallGrowthAsync(string studentId, DateTime? fromDate = null, DateTime? toDate = null);
        Task<IEnumerable<GrowthTrackingDto>> GetRecentGrowthTrackingsAsync(string studentId, int count = 10);
    }
}