using Aptiverse.AcademicPlanning.Domain.Models.External.Identity;

namespace Aptiverse.AcademicPlanning.Domain.Models.AcademicPlanning
{
    public class StudySession
    {
        public long Id { get; set; }
        public long StudentId { get; set; }
        public string SubjectId { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public int DurationMinutes { get; set; }
        public string SessionType { get; set; }
        public string TopicsCovered { get; set; }
        public double EfficiencyScore { get; set; }
        public int ConcentrationLevel { get; set; }
        public string Notes { get; set; }
        public string ResourcesUsed { get; set; }

        public virtual Student Student { get; set; }
        public virtual Subject Subject { get; set; }
    }
}
