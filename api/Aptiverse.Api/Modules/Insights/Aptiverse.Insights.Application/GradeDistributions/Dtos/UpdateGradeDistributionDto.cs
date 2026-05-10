namespace Aptiverse.Insights.Application.GradeDistributions.Dtos
{
    public record UpdateGradeDistributionDto
    {
        public long? StudentSubjectId { get; init; }
        public string? Grade { get; init; }
        public int? Count { get; init; }
    }
}