using Aptiverse.Wellbeing.Application.Frontend.Dtos;

namespace Aptiverse.Wellbeing.Application.Frontend.Services
{
    // UI-facing read/write surface for the Wellbeing dashboard. All methods
    // take the string UserId (the caller's identity claim), which is stored
    // directly as StudentId on the persisted entities.
    public interface IFrontendWellbeingService
    {
        Task<IList<FrontendDiaryEntryDto>> GetDiaryEntriesAsync(string userId, CancellationToken cancellationToken = default);
        Task<FrontendDiaryEntryDto> CreateDiaryEntryAsync(string userId, FrontendCreateDiaryEntryInput input, CancellationToken cancellationToken = default);

        Task<IList<FrontendMoodPointDto>> GetMoodTrendAsync(string userId, int days, CancellationToken cancellationToken = default);
        Task<FrontendMoodPointDto> CreateMoodAsync(string userId, FrontendCreateMoodInput input, CancellationToken cancellationToken = default);

        Task<FrontendWellbeingSummaryDto> GetSummaryAsync(string userId, CancellationToken cancellationToken = default);
    }
}
