using Aptiverse.Mastery.Domain.Models.External.AcademicPlanning;

namespace Aptiverse.Mastery.Domain.Models.Mastery
{
    public class TopicMastery
    {
        public long Id { get; set; }
        public long StudentSubjectId { get; set; }
        public string TopicId { get; set; }
        public double MasteryLevel { get; set; }
        public StudentSubjectTopic Topic { get; set; }
        public virtual StudentSubject StudentSubject { get; set; }
    }
}
