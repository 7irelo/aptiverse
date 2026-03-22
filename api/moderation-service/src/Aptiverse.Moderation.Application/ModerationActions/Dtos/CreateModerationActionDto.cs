namespace Aptiverse.Moderation.Application.ModerationActions.Dtos
{
    public record CreateModerationActionDto
    {
        public long ContentReportId { get; init; }
        public string ModeratorUserId { get; init; }
        public string ActionType { get; init; }
        public string Reason { get; init; }
        public string Notes { get; init; }
        public bool IsAutomated { get; init; }
        public DateTime? ExpiresAt { get; init; }
    }
}
