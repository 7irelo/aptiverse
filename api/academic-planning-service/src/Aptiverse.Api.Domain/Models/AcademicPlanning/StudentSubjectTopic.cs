namespace Aptiverse.AcademicPlanning.Domain.Models.AcademicPlanning
{
    public class StudentSubjectTopic
    {
        public long Id { get; set; }
        public long StudentSubjectId { get; set; }
        public long TopicId { get; set; }
        public double Score { get; set; }
        public string Trend { get; set; }
        public DateTime LastTested { get; set; }

        public virtual StudentSubject StudentSubject { get; set; }
        public virtual Topic Topic { get; set; }
    }
}
