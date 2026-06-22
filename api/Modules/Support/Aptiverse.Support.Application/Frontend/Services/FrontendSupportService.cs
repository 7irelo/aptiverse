using Aptiverse.Support.Application.Frontend.Dtos;
using Aptiverse.Support.Domain.Models.Support;
using Aptiverse.Support.Domain.Repositories;

namespace Aptiverse.Support.Application.Frontend.Services
{
    public class FrontendSupportService(
        IRepository<SupportTicket> ticketRepository,
        IRepository<SupportMessage> messageRepository) : IFrontendSupportService
    {
        public async Task<IEnumerable<FrontendSupportTicketDto>> ListTicketsForUserAsync(
            string requesterUserId, CancellationToken cancellationToken = default)
        {
            var tickets = await ticketRepository.GetManyAsync(
                predicate: t => t.RequesterUserId == requesterUserId,
                orderBy: q => q.OrderByDescending(t => t.CreatedAt),
                cancellationToken: cancellationToken);

            return tickets.Select(t => ToDto(t, requesterUserId)).ToList();
        }

        public async Task<FrontendSupportTicketDto> CreateTicketAsync(
            string requesterUserId, string requesterName, FrontendCreateTicketInput input,
            CancellationToken cancellationToken = default)
        {
            var entity = new SupportTicket
            {
                RequesterUserId = requesterUserId,
                Subject = (input.Subject ?? "").Trim(),
                Description = input.Body ?? "",
                Priority = ParsePriority(input.Priority),
                Status = SupportTicketStatus.Open,
                Channel = SupportChannel.Web,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
            };

            await ticketRepository.AddAsync(entity, cancellationToken);
            return ToDto(entity, requesterName);
        }

        public async Task<FrontendSupportTicketDto?> GetTicketForUserAsync(
            string requesterUserId, long ticketId, CancellationToken cancellationToken = default)
        {
            var ticket = await ticketRepository.GetAsync(
                t => t.Id == ticketId && t.RequesterUserId == requesterUserId,
                cancellationToken: cancellationToken);

            return ticket is null ? null : ToDto(ticket, requesterUserId);
        }

        public async Task<IEnumerable<FrontendSupportMessageDto>> ListMessagesForUserAsync(
            string requesterUserId, long ticketId, CancellationToken cancellationToken = default)
        {
            if (!await OwnsTicketAsync(requesterUserId, ticketId, cancellationToken))
                return null!; // controller maps null -> 404; empty list is a valid "no messages" state

            var messages = await messageRepository.GetManyAsync(
                predicate: m => m.TicketId == ticketId && !m.IsInternal,
                orderBy: q => q.OrderBy(m => m.CreatedAt),
                cancellationToken: cancellationToken);

            return messages.Select(ToDto).ToList();
        }

        public async Task<FrontendSupportMessageDto?> AddMessageForUserAsync(
            string requesterUserId, string senderRole, long ticketId,
            FrontendCreateMessageInput input, CancellationToken cancellationToken = default)
        {
            // Track the ticket so the touch to UpdatedAt persists on the
            // shared DbContext save the repository performs.
            var ticket = await ticketRepository.GetAsync(
                t => t.Id == ticketId && t.RequesterUserId == requesterUserId,
                disableTracking: false,
                cancellationToken: cancellationToken);
            if (ticket is null) return null;

            var entity = new SupportMessage
            {
                TicketId = ticketId,
                SenderUserId = requesterUserId,
                SenderRole = senderRole ?? "",
                Content = input.Content ?? "",
                IsInternal = false,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
            };

            await messageRepository.AddAsync(entity, cancellationToken);

            ticket.UpdatedAt = DateTime.UtcNow;
            await ticketRepository.UpdateAsync(ticket, cancellationToken);

            return ToDto(entity);
        }

        private Task<bool> OwnsTicketAsync(string requesterUserId, long ticketId, CancellationToken ct)
            => ticketRepository.AnyAsync(t => t.Id == ticketId && t.RequesterUserId == requesterUserId, ct);

        // ---- mapping (entity PascalCase enums <-> UI lowercase contract) ----

        private static FrontendSupportTicketDto ToDto(SupportTicket t, string requester) => new()
        {
            Id = t.Id.ToString(),
            Subject = t.Subject ?? "",
            Body = t.Description ?? "",
            Status = StatusToUi(t.Status),
            Priority = PriorityToUi(t.Priority),
            CreatedAt = t.CreatedAt,
            UpdatedAt = t.UpdatedAt,
            Requester = requester ?? "",
        };

        private static FrontendSupportMessageDto ToDto(SupportMessage m) => new()
        {
            Id = m.Id.ToString(),
            TicketId = m.TicketId.ToString(),
            Sender = m.SenderUserId ?? "",
            SenderRole = m.SenderRole ?? "",
            Content = m.Content ?? "",
            CreatedAt = m.CreatedAt,
        };

        private static SupportTicketPriority ParsePriority(string? priority) =>
            (priority ?? "").Trim().ToLowerInvariant() switch
            {
                "low" => SupportTicketPriority.Low,
                "high" => SupportTicketPriority.High,
                "urgent" => SupportTicketPriority.Urgent,
                // UI's "normal" and anything unknown map to the entity default.
                _ => SupportTicketPriority.Medium,
            };

        private static string PriorityToUi(SupportTicketPriority priority) => priority switch
        {
            SupportTicketPriority.Low => "low",
            SupportTicketPriority.High => "high",
            SupportTicketPriority.Urgent => "urgent",
            _ => "normal",
        };

        private static string StatusToUi(SupportTicketStatus status) => status switch
        {
            SupportTicketStatus.Pending => "pending",
            SupportTicketStatus.InProgress => "pending",
            SupportTicketStatus.Resolved => "resolved",
            SupportTicketStatus.Closed => "resolved",
            _ => "open",
        };
    }
}
