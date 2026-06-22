namespace Aptiverse.Wellbeing.Application.DiaryGoals.Dtos
{
    public record DiaryGoalDto
    {
        public long Id { get; init; }
        public string StudentId { get; init; }
        public string Title { get; init; }
        public string Description { get; init; }
        public string Category { get; init; }
        public DateTime TargetDate { get; init; }
        public bool IsCompleted { get; init; }
        public DateTime? CompletedAt { get; init; }
        public DateTime CreatedAt { get; init; }
        public DateTime UpdatedAt { get; init; }
    }
}
