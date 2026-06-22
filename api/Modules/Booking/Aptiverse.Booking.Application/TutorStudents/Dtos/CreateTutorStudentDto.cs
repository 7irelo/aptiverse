namespace Aptiverse.Booking.Application.TutorStudents.Dtos
{
    public record CreateTutorStudentDto
    {
        public long TutorId { get; init; }
        public string StudentId { get; init; }
        public DateTime StartedDate { get; init; }
        public bool IsActive { get; init; } = true;
        public int SessionsPerWeek { get; init; }
    }
}