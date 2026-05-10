using Aptiverse.Marketplace.Application.Frontend.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Aptiverse.Marketplace.Controllers
{
    [ApiController]
    [Route("api/frontend")]
    [Authorize]
    public class FrontendController : ControllerBase
    {
        private static readonly FrontendTutorDto[] TutorSeed =
        [
            new() { Id = "t1", Name = "Sipho Mabaso", Subjects = ["Mathematics", "Physical Sciences"], Rating = 4.9, ReviewCount = 124, HourlyRate = 250, Bio = "Wits Engineering graduate. Specialises in lifting calculus marks from 50% to 75%+.", City = "Johannesburg", Verified = true, Online = true, AvatarColor = "#1F8079" },
            new() { Id = "t2", Name = "Leah van Rooyen", Subjects = ["English HL", "History"], Rating = 4.8, ReviewCount = 87, HourlyRate = 220, Bio = "Published author. Helps students unlock voice in essay writing — past paper specialist.", City = "Cape Town", Verified = true, Online = false, AvatarColor = "#F25C2E" },
            new() { Id = "t3", Name = "Dr. Anika Pillay", Subjects = ["Life Sciences", "Physical Sciences"], Rating = 5.0, ReviewCount = 56, HourlyRate = 350, Bio = "PhD Biochemistry, UKZN. Patient explainer of the trickiest organic chem concepts.", City = "Durban", Verified = true, Online = true, AvatarColor = "#3D9762" },
            new() { Id = "t4", Name = "Thabo Modise", Subjects = ["Mathematics", "Accounting"], Rating = 4.7, ReviewCount = 142, HourlyRate = 200, Bio = "CA(SA) candidate. Past-paper drills and exam technique. NSC marker for 4 years.", City = "Pretoria", Verified = true, Online = true, AvatarColor = "#FFB733" },
            new() { Id = "t5", Name = "Naledi Khumalo", Subjects = ["Afrikaans FAL", "isiZulu HL"], Rating = 4.9, ReviewCount = 73, HourlyRate = 180, Bio = "Multilingual coach. Helps students think in the language they're tested in.", City = "Online", Verified = true, Online = true, AvatarColor = "#2C7DCB" },
            new() { Id = "t6", Name = "Brent O'Reilly", Subjects = ["Geography", "History"], Rating = 4.6, ReviewCount = 38, HourlyRate = 220, Bio = "Mapwork wizard. Will turn synoptic charts into a story you actually remember.", City = "Port Elizabeth", Verified = true, Online = false, AvatarColor = "#5BA3E5" },
        ];

        private static readonly FrontendCourseDto[] CourseSeed =
        [
            new() { Id = "c1", Title = "Calculus Mastery — Grade 12", TutorId = "t1", SubjectId = "math", Duration = "8 weeks", Lessons = 24, Rating = 4.9, Enrolled = 412, Price = 599, Level = "intermediate", Description = "From limits to optimisation — past paper drills and rubric-graded mocks." },
            new() { Id = "c2", Title = "Argumentative Essay Bootcamp", TutorId = "t2", SubjectId = "english", Duration = "4 weeks", Lessons = 12, Rating = 4.8, Enrolled = 287, Price = 349, Level = "intermediate", Description = "Structure, voice, evidence — turn 60% essays into 75%+ pieces." },
            new() { Id = "c3", Title = "Organic Chemistry Decoded", TutorId = "t3", SubjectId = "physci", Duration = "6 weeks", Lessons = 18, Rating = 5.0, Enrolled = 198, Price = 549, Level = "advanced", Description = "Reactions, mechanisms, naming — the chapter most students dread." },
            new() { Id = "c4", Title = "NSC Maths Past Paper Lab", TutorId = "t4", SubjectId = "math", Duration = "12 weeks", Lessons = 36, Rating = 4.7, Enrolled = 605, Price = 449, Level = "intermediate", Description = "Three years of past papers, walked through, with marker tips." },
            new() { Id = "c5", Title = "Mapwork Made Memorable", TutorId = "t6", SubjectId = "geography", Duration = "3 weeks", Lessons = 9, Rating = 4.6, Enrolled = 124, Price = 249, Level = "beginner", Description = "Bearings, gradient, scale, GIS — short, illustrated lessons." },
        ];

        [HttpGet("tutors")]
        public ActionResult<IEnumerable<FrontendTutorDto>> GetTutors() => Ok(TutorSeed);

        [HttpGet("tutors/{id}")]
        public ActionResult<FrontendTutorDto> GetTutor(string id)
        {
            var t = TutorSeed.FirstOrDefault(x => x.Id == id);
            return t is null ? NotFound() : Ok(t);
        }

        [HttpGet("courses")]
        public ActionResult<IEnumerable<FrontendCourseDto>> GetCourses() => Ok(CourseSeed);

        [HttpGet("courses/{id}")]
        public ActionResult<FrontendCourseDto> GetCourse(string id)
        {
            var c = CourseSeed.FirstOrDefault(x => x.Id == id);
            return c is null ? NotFound() : Ok(c);
        }

        [HttpGet("tutors/{id}/reviews")]
        public ActionResult<IEnumerable<FrontendReviewDto>> GetTutorReviews(string id)
        {
            var now = DateTime.UtcNow;
            return Ok(new[]
            {
                new FrontendReviewDto { Id = $"{id}-r1", Student = "Thabo M.", Rating = 5, Body = "Sipho explained chain rule in 10 minutes. I'd been stuck on it for weeks.", When = now.AddDays(-2) },
                new FrontendReviewDto { Id = $"{id}-r2", Student = "Naledi K.", Rating = 5, Body = "Patient. Knows the past papers cold. My maths jumped 12% this term.", When = now.AddDays(-6) },
                new FrontendReviewDto { Id = $"{id}-r3", Student = "Aisha M.", Rating = 4, Body = "Great with concepts. Could give more practice problems though.", When = now.AddDays(-14) },
                new FrontendReviewDto { Id = $"{id}-r4", Student = "Lerato P.", Rating = 5, Body = "Calm energy. I actually look forward to maths now.", When = now.AddDays(-21) },
            });
        }
    }
}
