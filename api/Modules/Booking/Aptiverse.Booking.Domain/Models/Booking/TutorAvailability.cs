using Aptiverse.Api.Data.Abstractions;
using Aptiverse.Booking.Domain.Models.External.Identity;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Booking.Domain.Models.Booking
{
    // A tutor's recurring weekly availability window. Queried by
    // TutorId (whose calendar?) and frequently filtered by the
    // DayOfWeek of a requested slot and whether the window is open.
    [Index(nameof(TutorId))]
    [Index(nameof(TutorId), nameof(DayOfWeek))]
    [Index(nameof(TutorId), nameof(IsAvailable))]
    public class TutorAvailability : IEntityTimestamps
    {
        public long Id { get; set; }
        public long TutorId { get; set; }
        public DayOfWeek DayOfWeek { get; set; }
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
        public bool IsAvailable { get; set; } = true;

        public virtual Tutor Tutor { get; set; }

        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
