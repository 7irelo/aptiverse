using Aptiverse.Marketplace.Application.Frontend.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Aptiverse.Marketplace.Controllers
{
    // Clean-slate stubs. Tutor and course catalogs will be filled by
    // real verified tutors via the onboarding flow — not seeded.
    [ApiController]
    [Route("api/marketplace")]
    [Authorize]
    public class MarketplaceController : ControllerBase
    {
        [HttpGet("tutors")]
        public ActionResult<IEnumerable<FrontendTutorDto>> GetTutors()
            => Ok(Array.Empty<FrontendTutorDto>());

        [HttpGet("tutors/{id}")]
        public ActionResult<FrontendTutorDto> GetTutor(string id) => NotFound();

        [HttpGet("courses")]
        public ActionResult<IEnumerable<FrontendCourseDto>> GetCourses()
            => Ok(Array.Empty<FrontendCourseDto>());

        [HttpGet("courses/{id}")]
        public ActionResult<FrontendCourseDto> GetCourse(string id) => NotFound();

        [HttpGet("tutors/{id}/reviews")]
        public ActionResult<IEnumerable<FrontendReviewDto>> GetTutorReviews(string id)
            => Ok(Array.Empty<FrontendReviewDto>());
    }
}
