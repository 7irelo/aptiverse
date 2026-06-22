namespace Aptiverse.Booking.Application.TutorStudents.Dtos
{
    public record UpdateTutorStudentDto
    {
        public long? TutorId { get; init; }
        public string? StudentId { get; init; }
        public DateTime? StartedDate { get; init; }
        public bool? IsActive { get; init; }
        public int? SessionsPerWeek { get; init; }
    }
}