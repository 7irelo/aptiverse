using Aptiverse.Mastery.Domain.Models.External.AcademicPlanning;

namespace Aptiverse.Mastery.Domain.Models.Mastery
{
    public class KnowledgeGap
    {
        public long Id { get; set; }
        public long StudentSubjectId { get; set; }
        public long TopicId { get; set; }
        public string Concept { get; set; }
        public string Severity { get; set; }
        public DateTime LastTested { get; set; }

        public virtual StudentSubject StudentSubject { get; set; }
        public virtual StudentSubjectTopic Topic { get; set; }
    }
}
