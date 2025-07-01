using Aptiverse.Marketplace.Domain.Models.External.AcademicPlanning;

namespace Aptiverse.Marketplace.Domain.Models.Marketplace
{
    public class TutorSubject
    {
        public long Id { get; set; }
        public long TutorId { get; set; }
        public string SubjectId { get; set; }
        public int ProficiencyLevel { get; set; }
        public decimal CustomHourlyRate { get; set; }

        public virtual Tutor Tutor { get; set; }
        public virtual Subject Subject { get; set; }
    }
}
