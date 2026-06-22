using Aptiverse.Booking.Application.Frontend.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Aptiverse.Booking.Controllers
{
    [ApiController]
    [Route("api/booking")]
    [Authorize]
    public class BookingController : ControllerBase
    {
        [HttpGet("bookings")]
        public ActionResult<IEnumerable<FrontendBookingDto>> GetBookings([FromQuery] string? scope = null)
            => Ok(Array.Empty<FrontendBookingDto>());

        [HttpGet("tutors/{tutorId}/availability")]
        public ActionResult<IEnumerable<FrontendAvailabilitySlotDto>> GetAvailability(string tutorId)
            => Ok(Array.Empty<FrontendAvailabilitySlotDto>());
    }
}
