using Aptiverse.Booking.Application.Frontend.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Aptiverse.Booking.Controllers
{
    [ApiController]
    [Route("api/frontend")]
    [Authorize]
    public class FrontendController : ControllerBase
    {
        [HttpGet("bookings")]
        public ActionResult<IEnumerable<FrontendBookingDto>> GetBookings([FromQuery] string? scope = null)
        {
            var students = new[] { "Thabo M.", "Naledi K.", "Sipho D.", "Aisha M.", "Lerato P." };
            var subjects = new[] { "Mathematics", "Physical Sciences", "English HL" };
            var tutors = new[] { ("t1", "Sipho Mabaso"), ("t3", "Dr. Anika Pillay"), ("t4", "Thabo Modise") };
            var now = DateTime.UtcNow.Date.AddHours(16);

            var rows = Enumerable.Range(0, 12).Select(i =>
            {
                var (tid, tname) = tutors[i % tutors.Length];
                return new FrontendBookingDto
                {
                    Id = $"ses{i}",
                    StudentId = $"s{i}",
                    Student = students[i % students.Length],
                    TutorId = tid,
                    Tutor = tname,
                    Subject = subjects[i % subjects.Length],
                    Start = now.AddDays(i),
                    Duration = 60,
                    Fee = 250,
                    Status = i < 4 ? "scheduled" : i < 8 ? "completed" : "scheduled",
                };
            });

            return Ok(rows);
        }

        [HttpGet("tutors/{tutorId}/availability")]
        public ActionResult<IEnumerable<FrontendAvailabilitySlotDto>> GetAvailability(string tutorId)
        {
            // Mon, Wed, Fri 16:00–19:00
            return Ok(new[]
            {
                new FrontendAvailabilitySlotDto { TutorId = tutorId, DayOfWeek = 1, StartMinutes = 16 * 60, EndMinutes = 19 * 60 },
                new FrontendAvailabilitySlotDto { TutorId = tutorId, DayOfWeek = 3, StartMinutes = 16 * 60, EndMinutes = 19 * 60 },
                new FrontendAvailabilitySlotDto { TutorId = tutorId, DayOfWeek = 5, StartMinutes = 16 * 60, EndMinutes = 19 * 60 },
                new FrontendAvailabilitySlotDto { TutorId = tutorId, DayOfWeek = 6, StartMinutes = 9 * 60, EndMinutes = 13 * 60 },
            });
        }
    }
}
