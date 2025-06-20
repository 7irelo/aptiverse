namespace Aptiverse.AcademicPlanning.Domain.Models.AcademicPlanning
{
    public class AssessmentBreakdown
    {
        public long Id { get; set; }
        public long StudentSubjectId { get; set; }
        public string AssessmentType { get; set; }
        public int Count { get; set; }
        public double Average { get; set; }

        public virtual StudentSubject StudentSubject { get; set; }
    }
}
