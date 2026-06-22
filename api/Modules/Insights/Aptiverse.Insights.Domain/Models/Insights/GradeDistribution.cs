using Aptiverse.Insights.Domain.Models.External.AcademicPlanning;

namespace Aptiverse.Insights.Domain.Models.Insights
{
    public class GradeDistribution
    {
        public long Id { get; set; }
        public long StudentSubjectId { get; set; }
        public string Grade { get; set; }
        public int Count { get; set; }

        public virtual StudentSubject StudentSubject { get; set; }
    }
}
