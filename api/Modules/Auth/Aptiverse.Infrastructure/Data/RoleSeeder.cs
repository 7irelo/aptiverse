using Microsoft.AspNetCore.Identity;

namespace Aptiverse.Infrastructure.Data
{
    public static class RoleSeeder
    {
        public static async Task SeedAsync(RoleManager<IdentityRole> roleManager)
        {
            string[] roles =
            {
                "Superuser",
                "Admin",
                "SchoolAdmin",
                "Teacher",
                "Parent",
                "Student",
                "Tutor",
                // Affiliate-only accounts: people who joined to earn, not to
                // study. They land on the referral dashboard and never see the
                // student app. The programme itself is still open to every
                // account regardless of role.
                "Affiliate"
            };

            foreach (var role in roles)
            {
                if (!await roleManager.RoleExistsAsync(role))
                {
                    await roleManager.CreateAsync(new IdentityRole
                    {
                        Name = role,
                        NormalizedName = role.ToUpper()
                    });
                }
            }
        }
    }
}
