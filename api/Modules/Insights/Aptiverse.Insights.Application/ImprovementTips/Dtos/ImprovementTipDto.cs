namespace Aptiverse.Insights.Application.ImprovementTips.Dtos
{
    public record ImprovementTipDto
    {
        public long Id { get; init; }
        public long StudentSubjectId { get; init; }
        public string Tip { get; init; }
        public int Priority { get; init; }
    }
}