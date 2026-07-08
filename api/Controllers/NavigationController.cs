using System.Security.Claims;
using System.Text.Json.Serialization;
using Aptiverse.Api.Data;
using Aptiverse.Domain.Models;
using Aptiverse.Entitlements.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Api.Controllers
{
    // Server-driven navigation. The sidebar is no longer a static client
    // config keyed off a persona toggle — it is computed here from the
    // signed-in user's real role (claims) and their live entitlements.
    //
    //   GET /api/navigation -> the sections + items this user should see.
    //
    // Gating rule: core landing pages (Dashboard, Billing, Settings, ...)
    // are always present so a user is never trapped, but feature pages
    // (AI Tutor, Career navigator, teacher analytics, ...) only appear
    // when the user actually holds the backing feature. Icons are returned
    // as string keys; the frontend maps them to components.
    [ApiController]
    [Route("api/navigation")]
    [Authorize]
    public class NavigationController(IEntitlementService entitlements, ApplicationDbContext db) : ControllerBase
    {
        private readonly IEntitlementService _entitlements = entitlements;
        private readonly ApplicationDbContext _db = db;

        private string? CurrentUserId()
            => User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirst("sub")?.Value
            ?? User.FindFirst("userId")?.Value;

        [HttpGet]
        public async Task<ActionResult<IEnumerable<NavSectionDto>>> Get(CancellationToken ct)
        {
            var userId = CurrentUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var template = TemplateForUser();

            // Tertiary students study institution courses, not CAPS subjects, so
            // the plain-student nav swaps its "Subjects" item for "Courses". Only
            // affects the StudentNav template; every other role is untouched.
            var isTertiaryStudent = template == StudentNav
                && string.Equals(
                    await _db.Set<User>().Where(u => u.Id == userId).Select(u => u.EducationLevel).FirstOrDefaultAsync(ct),
                    "tertiary", StringComparison.OrdinalIgnoreCase);

            // Admins/Superusers bypass entitlement gating entirely.
            var privileged = User.IsInRole("Admin") || User.IsInRole("Superuser");
            var features = privileged
                ? null
                : await _entitlements.GetFeaturesAsync(userId, ct);

            var sections = new List<NavSectionDto>();
            foreach (var sec in template)
            {
                var items = sec.Items
                    .Where(i => i.RequiredFeature is null || features is null || features.Contains(i.RequiredFeature))
                    .Select(i => isTertiaryStudent && i.Href == "/dashboard/subjects"
                        ? new NavItemDto { Label = "Courses", Href = "/dashboard/courses", Icon = "school", Badge = i.Badge }
                        : new NavItemDto
                        {
                            Label = i.Label,
                            Href = i.Href,
                            Icon = i.Icon,
                            Badge = i.Badge,
                        })
                    .ToList();

                if (items.Count > 0)
                    sections.Add(new NavSectionDto { Heading = sec.Heading, Items = items });
            }

            return Ok(sections);
        }

        // Highest-privilege role wins when a user carries more than one.
        private NavSection[] TemplateForUser()
        {
            if (User.IsInRole("Admin") || User.IsInRole("Superuser")) return AdminNav;
            if (User.IsInRole("SchoolAdmin")) return SchoolAdminNav;
            if (User.IsInRole("Teacher")) return TeacherNav;
            if (User.IsInRole("Tutor")) return TutorNav;
            if (User.IsInRole("Parent")) return ParentNav;
            return StudentNav;
        }

        // ---- Templates (data). RequiredFeature null == always shown. ----

        private sealed record NavItem(
            string Label, string Href, string Icon, string? RequiredFeature = null, string? Badge = null);

        private sealed record NavSection(string Heading, NavItem[] Items);

        private static readonly NavSection[] StudentNav =
        [
            new("Overview",
            [
                new("Dashboard", "/dashboard", "home"),
                new("Workspace", "/dashboard/workspace", "workspace", "workspace"),
                new("AI Tutor", "/dashboard/chatbot", "ai", "ai_tutor"),
            ]),
            new("Learning",
            [
                new("Subjects", "/dashboard/subjects", "book"),
                new("Assessments", "/dashboard/assessments", "assignment"),
                new("Practice tests", "/dashboard/practice", "quiz"),
                new("Past papers", "/dashboard/past-papers", "library"),
                new("Mastery", "/dashboard/mastery", "insights", "mastery.snapshot"),
                new("Analytics", "/dashboard/analytics", "analytics"),
                new("Reports", "/dashboard/reports", "report"),
                new("Goals", "/dashboard/goals", "flag"),
                new("Journey map", "/dashboard/journey", "route"),
            ]),
            new("Wellbeing",
            [
                new("Diary", "/dashboard/diary", "diary"),
                new("Wellbeing", "/dashboard/wellbeing", "heart"),
                new("Talk to a psychologist", "/dashboard/psychologist", "psychology", "psychologist.read"),
            ]),
            new("Future",
            [
                new("Career navigator", "/dashboard/career", "lightbulb", "career_navigator"),
            ]),
            new("Community",
            [
                new("Connections", "/dashboard/connections", "link"),
                new("Find a tutor", "/dashboard/tutors", "groups", "tutor.connect"),
                new("Study groups", "/dashboard/study-groups", "forum", "study_groups"),
                new("Rewards", "/dashboard/rewards", "trophy", "rewards.redeem"),
            ]),
            new("Account",
            [
                new("Calendar", "/dashboard/calendar", "calendar"),
                new("Notifications", "/dashboard/notifications", "bell"),
                new("Billing", "/dashboard/billing", "payments"),
                new("Settings", "/dashboard/settings", "settings"),
                new("Help", "/dashboard/help", "help"),
            ]),
        ];

        // Parents don't manage a "family"; they link to individual students by
        // invite and get a read-only view. Kept deliberately lean.
        private static readonly NavSection[] ParentNav =
        [
            new("Overview",
            [
                new("Dashboard", "/parent", "home"),
                new("Students", "/parent/students", "child"),
            ]),
            new("Account",
            [
                new("Billing", "/parent/billing", "payments"),
                new("Settings", "/parent/settings", "settings"),
            ]),
        ];

        private static readonly NavSection[] TeacherNav =
        [
            new("Overview",
            [
                new("Dashboard", "/teacher", "home"),
                new("Live activity", "/teacher/live", "hub", "teacher.live_view", "Live"),
                new("Analytics", "/teacher/analytics", "analytics", "teacher.analytics"),
            ]),
            new("Classes",
            [
                new("Classes", "/teacher/classes", "groups", "teacher.classes"),
                new("Students", "/teacher/students", "school"),
                new("Assignments", "/teacher/assignments", "assignment", "teacher.assignments"),
                new("Differentiator", "/teacher/differentiator", "tune", "teacher.differentiator"),
                new("Gap analysis", "/teacher/gap-analysis", "chart", "teacher.gap_analysis"),
                new("Goal verifications", "/teacher/verifications", "verified", "teacher.verifications"),
            ]),
            new("Account",
            [
                new("Calendar", "/teacher/calendar", "calendar"),
                new("Settings", "/teacher/settings", "settings"),
            ]),
        ];

        private static readonly NavSection[] SchoolAdminNav =
        [
            new("Overview",
            [
                new("Dashboard", "/school-admin", "home"),
                new("Analytics", "/school-admin/analytics", "analytics", "school_admin.analytics"),
                new("Readiness report", "/school-admin/readiness", "insights", "school_admin.readiness"),
            ]),
            new("School",
            [
                new("Teachers", "/school-admin/teachers", "groups", "school_admin.teachers"),
                new("Classes", "/school-admin/classes", "school", "school_admin.classes"),
                new("Students", "/school-admin/students", "child", "school_admin.students"),
            ]),
            new("Account",
            [
                new("Settings", "/school-admin/settings", "settings"),
            ]),
        ];

        private static readonly NavSection[] TutorNav =
        [
            new("Overview",
            [
                new("Dashboard", "/tutor", "home"),
            ]),
            new("Teaching",
            [
                new("Profile", "/tutor/profile", "profile"),
                new("Connections", "/tutor/connections", "hub"),
                new("Reviews", "/tutor/reviews", "trophy"),
            ]),
            new("Account",
            [
                new("Billing", "/tutor/billing", "payments"),
                new("Settings", "/tutor/settings", "settings"),
            ]),
        ];

        private static readonly NavSection[] AdminNav =
        [
            new("Overview",
            [
                new("Admin home", "/admin", "home"),
                new("System health", "/admin/system", "hub"),
                new("Audit log", "/admin/audit", "verified"),
            ]),
            new("Users & schools",
            [
                new("Users", "/admin/users", "groups"),
                new("Schools", "/admin/schools", "school"),
                new("School enquiries", "/admin/school-enquiries", "volunteer"),
                new("Tutors", "/admin/tutors", "groups"),
                new("Impersonate", "/admin/impersonate", "swap"),
            ]),
            new("Content",
            [
                new("Moderation queue", "/admin/moderation", "forum"),
            ]),
            new("Money",
            [
                new("Subscriptions", "/admin/subscriptions", "payments"),
                new("Payments & refunds", "/admin/payments", "payments"),
                new("Invoices", "/admin/invoices", "assignment"),
            ]),
            new("Platform",
            [
                new("Feature flags", "/admin/flags", "tune"),
                new("Settings", "/admin/settings", "settings"),
            ]),
        ];
    }

    public record NavItemDto
    {
        [JsonPropertyName("label")] public string Label { get; init; } = "";
        [JsonPropertyName("href")] public string Href { get; init; } = "";
        // String key resolved to an icon component on the client.
        [JsonPropertyName("icon")] public string Icon { get; init; } = "";
        [JsonPropertyName("badge")] public string? Badge { get; init; }
    }

    public record NavSectionDto
    {
        [JsonPropertyName("heading")] public string Heading { get; init; } = "";
        [JsonPropertyName("items")] public IList<NavItemDto> Items { get; init; } = [];
    }
}
