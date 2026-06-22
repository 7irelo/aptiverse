using Aptiverse.Marketplace.Application.TutorSubjects.Dtos;
using Aptiverse.Marketplace.Domain.Repositories;

namespace Aptiverse.Marketplace.Application.TutorSubjects.Service
{
    public interface ITutorSubjectService
    {
        Task<TutorSubjectDto> CreateTutorSubjectAsync(CreateTutorSubjectDto createTutorSubjectDto);
        Task<TutorSubjectDto?> GetTutorSubjectByIdAsync(long id);
        Task<PaginatedResult<TutorSubjectDto>> GetTutorSubjectsAsync(
            long? tutorId = null,
            string? subjectId = null,
            int? minProficiencyLevel = null,
            int? maxProficiencyLevel = null,
            decimal? minHourlyRate = null,
            decimal? maxHourlyRate = null,
            string? sortBy = "Id",
            bool sortDescending = false,
            int page = 1,
            int pageSize = 20);
        Task<TutorSubjectDto> UpdateTutorSubjectAsync(long id, UpdateTutorSubjectDto updateTutorSubjectDto);
        Task<bool> DeleteTutorSubjectAsync(long id);
        Task<int> CountTutorSubjectsAsync(long? tutorId = null, string? subjectId = null);
        Task<bool> TutorSubjectExistsAsync(long id);
    }
}