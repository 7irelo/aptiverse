namespace Aptiverse.AcademicPlanning.Domain.Models.AcademicPlanning
{
    public class WeeklyStudyHour
    {
        public long Id { get; set; }
        public long StudentSubjectId { get; set; }
        public int WeekNumber { get; set; }
        public int Hours { get; set; }

        public virtual StudentSubject StudentSubject { get; set; }
    }
}
