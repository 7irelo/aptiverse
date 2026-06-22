using Aptiverse.Support.Application.Frontend.Dtos;

namespace Aptiverse.Support.Application.Frontend.Services
{
    // UI-facing support service consumed by SupportController. Persists
    // tickets/messages through the generic module repositories and maps to
    // the camelCase Frontend*Dto contract the UI expects.
    public interface IFrontendSupportService
    {
        Task<IEnumerable<FrontendSupportTicketDto>> ListTicketsForUserAsync(
            string requesterUserId, CancellationToken cancellationToken = default);

        Task<FrontendSupportTicketDto> CreateTicketAsync(
            string requesterUserId, string requesterName, FrontendCreateTicketInput input,
            CancellationToken cancellationToken = default);

        Task<FrontendSupportTicketDto?> GetTicketForUserAsync(
            string requesterUserId, long ticketId, CancellationToken cancellationToken = default);

        Task<IEnumerable<FrontendSupportMessageDto>> ListMessagesForUserAsync(
            string requesterUserId, long ticketId, CancellationToken cancellationToken = default);

        Task<FrontendSupportMessageDto?> AddMessageForUserAsync(
            string requesterUserId, string senderRole, long ticketId,
            FrontendCreateMessageInput input, CancellationToken cancellationToken = default);
    }
}
