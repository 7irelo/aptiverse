namespace Aptiverse.AcademicPlanning.Application.AssessmentBreakdowns.Dtos
{
    public record UpdateAssessmentBreakdownDto
    {
        public int? Count { get; init; }
        public double? Average { get; init; }
    }
}
