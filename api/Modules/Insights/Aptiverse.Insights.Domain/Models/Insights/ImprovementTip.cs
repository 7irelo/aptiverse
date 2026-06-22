using Aptiverse.Insights.Domain.Models.External.AcademicPlanning;

namespace Aptiverse.Insights.Domain.Models.Insights
{
    public class ImprovementTip
    {
        public long Id { get; set; }
        public long StudentSubjectId { get; set; }
        public long StudentSubjectTopicId { get; set; }
        public string Tip { get; set; }
        public int Priority { get; set; }

        public virtual StudentSubject StudentSubject { get; set; }
        public virtual StudentSubjectTopic StudentSubjectTopic { get; set; }
    }
}
