using Aptiverse.AcademicPlanning.Application.WeeklyStudyHours.Dtos;
using Aptiverse.AcademicPlanning.Domain.Repositories;

namespace Aptiverse.AcademicPlanning.Application.WeeklyStudyHours.Services
{
    public interface IWeeklyStudyHourService
    {
        Task<WeeklyStudyHourDto> CreateWeeklyStudyHourAsync(CreateWeeklyStudyHourDto createWeeklyStudyHourDto);
        Task<WeeklyStudyHourDto?> GetWeeklyStudyHourByIdAsync(long id);
        Task<PaginatedResult<WeeklyStudyHourDto>> GetWeeklyStudyHoursAsync(
            long? studentSubjectId = null,
            int? weekNumber = null,
            int? minHours = null,
            int? maxHours = null,
            string? sortBy = "Id",
            bool sortDescending = false,
            int page = 1,
            int pageSize = 20);
        Task<WeeklyStudyHourDto> UpdateWeeklyStudyHourAsync(long id, UpdateWeeklyStudyHourDto updateWeeklyStudyHourDto);
        Task<bool> DeleteWeeklyStudyHourAsync(long id);
        Task<int> CountWeeklyStudyHoursAsync(long? studentSubjectId = null, int? weekNumber = null);
        Task<bool> WeeklyStudyHourExistsAsync(long id);
    }
}