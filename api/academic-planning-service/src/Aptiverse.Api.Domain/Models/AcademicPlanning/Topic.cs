namespace Aptiverse.AcademicPlanning.Domain.Models.AcademicPlanning
{
    public class Topic
    {
        public long Id { get; set; }
        public string SubjectId { get; set; }
        public string Name { get; set; }

        public virtual Subject Subject { get; set; }
        public virtual ICollection<StudentSubjectTopic> StudentSubjectTopics { get; set; }
    }
}
