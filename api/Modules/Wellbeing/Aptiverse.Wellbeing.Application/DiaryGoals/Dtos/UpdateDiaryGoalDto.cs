namespace Aptiverse.Wellbeing.Application.DiaryGoals.Dtos
{
    public record UpdateDiaryGoalDto
    {
        public long StudentId { get; init; }
        public string Title { get; init; }
        public string Description { get; init; }
        public string Category { get; init; }
        public DateTime TargetDate { get; init; }
        public bool IsCompleted { get; init; }
        public DateTime? CompletedAt { get; init; }
    }
}
