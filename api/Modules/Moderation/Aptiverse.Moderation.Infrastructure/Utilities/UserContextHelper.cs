using System.Security.Claims;

namespace Aptiverse.Moderation.Infrastructure.Utilities
{
    public static class UserContextHelper
    {
        public static string? GetUserId(ClaimsPrincipal user)
        {
            return user.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? user.FindFirst("sub")?.Value
                ?? user.FindFirst("userId")?.Value;
        }

        public static string? GetUserEmail(ClaimsPrincipal user)
        {
            return user.FindFirst(ClaimTypes.Email)?.Value
                ?? user.FindFirst("email")?.Value;
        }

        public static List<string> GetUserRoles(ClaimsPrincipal user)
        {
            return [.. user.Claims
                .Where(c => c.Type == ClaimTypes.Role || c.Type == "role")
                .Select(c => c.Value)];
        }

        public static bool IsInRole(ClaimsPrincipal user, string role)
        {
            return GetUserRoles(user).Contains(role, StringComparer.OrdinalIgnoreCase);
        }

        public static bool IsSuperUser(ClaimsPrincipal user) => IsInRole(user, "Superuser");
        public static bool IsAdmin(ClaimsPrincipal user) => IsInRole(user, "Admin");
        public static bool IsTeacher(ClaimsPrincipal user) => IsInRole(user, "Teacher");
        public static bool IsTutor(ClaimsPrincipal user) => IsInRole(user, "Tutor");
        public static bool IsParent(ClaimsPrincipal user) => IsInRole(user, "Parent");
        public static bool IsStudent(ClaimsPrincipal user) => IsInRole(user, "Student");
    }
}
