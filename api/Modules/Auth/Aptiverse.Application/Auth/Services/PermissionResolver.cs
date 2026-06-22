namespace Aptiverse.Application.Auth.Services
{
    /// <summary>
    /// Maps Identity role names → normalised role + permission strings.
    /// Mirrors the UI's lib/rbac.ts so the frontend doesn't have to compute
    /// permissions itself after login.
    /// </summary>
    public static class PermissionResolver
    {
        // Identity role → UI role (lowercase snake_case).
        public static string Normalise(string identityRole) => identityRole switch
        {
            "Superuser" => "super_admin",
            "Admin" => "admin",
            "SchoolAdmin" => "school_admin",
            "Teacher" => "teacher",
            "Parent" => "parent",
            "Student" => "student",
            "Tutor" => "tutor",
            _ => identityRole.ToLowerInvariant(),
        };

        public static string PrimaryRole(IEnumerable<string> identityRoles)
        {
            // Highest-privilege role wins for the primary persona.
            var rank = new Dictionary<string, int>
            {
                ["Superuser"] = 100,
                ["Admin"] = 90,
                ["SchoolAdmin"] = 70,
                ["Teacher"] = 60,
                ["Tutor"] = 50,
                ["Parent"] = 40,
                ["Student"] = 30,
            };
            var best = identityRoles
                .Where(r => rank.ContainsKey(r))
                .OrderByDescending(r => rank[r])
                .FirstOrDefault() ?? identityRoles.FirstOrDefault() ?? "Student";
            return Normalise(best);
        }

        public static IList<string> PermissionsFor(IEnumerable<string> identityRoles)
        {
            var perms = new HashSet<string>();
            foreach (var r in identityRoles)
            {
                foreach (var p in PermissionsForRole(Normalise(r)))
                {
                    perms.Add(p);
                }
            }
            return [.. perms];
        }

        private static readonly string[] StudentPerms =
        [
            "courses.read", "tutors.read", "bursaries.read",
            "subscriptions.read", "billing.read",
        ];

        private static readonly string[] ParentPerms =
        [
            .. StudentPerms,
            "students.read", "billing.write",
        ];

        private static readonly string[] TeacherPerms =
        [
            "classes.read", "classes.write",
            "students.read", "students.write",
            "courses.read", "audit.read",
        ];

        private static readonly string[] SchoolAdminPerms =
        [
            .. TeacherPerms,
            "classes.manage", "students.manage",
            "schools.read", "schools.write",
            "users.read", "bursaries.read",
            "billing.read", "billing.write",
        ];

        private static readonly string[] TutorPerms =
        [
            "courses.read", "courses.write",
            "students.read", "billing.read",
        ];

        private static readonly string[] AdminPerms =
        [
            "users.read", "users.write", "users.manage",
            "schools.read", "schools.write", "schools.manage",
            "classes.read", "classes.write", "classes.manage",
            "students.read", "students.write", "students.manage",
            "tutors.read", "tutors.write", "tutors.manage", "tutors.verify",
            "courses.read", "courses.write", "courses.manage",
            "bursaries.read", "bursaries.write", "bursaries.manage",
            "subscriptions.read", "subscriptions.write", "subscriptions.manage",
            "payments.read", "payments.refund", "payments.manage",
            "billing.read", "billing.write", "billing.manage",
            "content.read", "content.moderate",
            "audit.read",
            "flags.read", "flags.write",
            "system.read",
        ];

        private static readonly string[] SuperAdminPerms =
        [
            .. AdminPerms,
            "users.delete", "users.impersonate",
            "system.manage",
        ];

        private static IEnumerable<string> PermissionsForRole(string normalisedRole) => normalisedRole switch
        {
            "student" => StudentPerms,
            "parent" => ParentPerms,
            "teacher" => TeacherPerms,
            "school_admin" => SchoolAdminPerms,
            "tutor" => TutorPerms,
            "admin" => AdminPerms,
            "super_admin" => SuperAdminPerms,
            _ => [],
        };
    }
}
