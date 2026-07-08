using Aptiverse.Api.Data;
using Aptiverse.Domain.Models;
using Aptiverse.Entitlements.Domain.Models;
using Aptiverse.Notifications.Domain.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace Aptiverse.Infrastructure.Data
{
    // Development-only test accounts for the privileged roles that the
    // public sign-up form intentionally blocks (Admin, SchoolAdmin), and
    // pre-provisioned subscriptions so the e2e suite can exercise
    // paid-tier features without going through Paystack.
    //
    // Idempotent — re-running ensures roles + subscriptions are right.
    // Never runs in non-Development environments.
    //
    // The password is the team-wide dev convention ("Erincu76@"), shared
    // with the e2e suite's E2E_PASSWORD. It's a known-dev-only value and
    // never reaches a production deployment because of the env guard.
    public static class DevTestUsersSeeder
    {
        private const string DevPassword = "Erincu76@";

        public static async Task SeedAsync(
            UserManager<User> userManager,
            ApplicationDbContext db,
            IWebHostEnvironment env,
            ILogger logger)
        {
            if (!env.IsDevelopment())
            {
                logger.LogDebug("Dev test users seeder skipped — not Development environment.");
                return;
            }

            // Opt-in only. The seeded fixtures (per-role test logins +
            // pre-provisioned paid subscriptions) are OFF by default so a
            // wiped dev DB stays empty and every user/subscription is created
            // through the real signup + Paystack flow. Set SEED_DEV_USERS=true
            // to bring them back (e.g. for the e2e suite).
            var optIn = string.Equals(
                Environment.GetEnvironmentVariable("SEED_DEV_USERS"), "true",
                StringComparison.OrdinalIgnoreCase);
            if (!optIn)
            {
                logger.LogInformation(
                    "Dev test users seeder skipped — set SEED_DEV_USERS=true to seed test logins + subscriptions.");
                return;
            }

            // admin.test gets Superuser (strict superset of Admin) so it
            // can access every admin page including the Superuser-only
            // /admin/impersonate and /admin/settings.
            var adminId      = await EnsureUserAsync(userManager, "admin.test@gmail.com",      "Admin",       "Test", "Superuser",   logger);
            var schoolAdmId  = await EnsureUserAsync(userManager, "schooladmin.test@gmail.com", "SchoolAdmin", "Test", "SchoolAdmin", logger);
            var teacherId    = await EnsureUserAsync(userManager, "teacher.test@gmail.com",     "Teacher",     "Test", "Teacher",     logger);
            var tutorId      = await EnsureUserAsync(userManager, "tutor.test@gmail.com",       "Tutor",       "Test", "Tutor",       logger);
            var parentId     = await EnsureUserAsync(userManager, "parent.test@gmail.com",      "Parent",      "Test", "Parent",      logger);
            var studentId    = await EnsureUserAsync(userManager, "student.test@gmail.com",     "Student",     "Test", "Student",     logger);

            // Subscriptions — feature-tier gates rely on these. Without
            // them, parent.test / teacher.test land on /parent or /teacher
            // and see "Available on the Family plan" instead of the dashboard.
            //
            // Each test user gets the *Pro* tier of their track so they can
            // exercise the moat features (curriculum-aware AI tutor, SBA
            // Coach, parent forecast, AI lesson plans for tutors, etc.)
            // without having to manually upgrade. IUsageMeter takes the
            // MAX quota across every plan a user is a member of, so any
            // legacy "student" / "family" / "tutor.free" subscription left
            // on a test user from a previous seeder run is harmless — the
            // Pro one wins.
            if (studentId is not null)
            {
                await EnsureSubscriptionAsync(db, studentId, "student.pro", null, logger);
                await CancelLegacySubsAsync(db, studentId, kept: "student.pro",
                    superseded: ["free", "student", "student.max"], logger);
            }

            if (parentId is not null)
            {
                await EnsureSubscriptionAsync(db, parentId, "family.plus", "Parent Test family", logger);
                await CancelLegacySubsAsync(db, parentId, kept: "family.plus",
                    superseded: ["family", "family.pro", "family.max"], logger);
            }

            if (tutorId is not null)
            {
                await EnsureSubscriptionAsync(db, tutorId, "tutor.pro", null, logger);
                await CancelLegacySubsAsync(db, tutorId, kept: "tutor.pro",
                    superseded: ["tutor.free", "tutor.max"], logger);
            }

            // School subscription owned by schooladmin.test. Teacher.test
            // is added as a member, so the school's plan features cascade
            // to their /teacher dashboard.
            long? schoolSubId = null;
            if (schoolAdmId is not null)
                schoolSubId = await EnsureSubscriptionAsync(db, schoolAdmId, "school", "Test School", logger);
            if (schoolSubId is not null && teacherId is not null)
                await EnsureMemberAsync(db, schoolSubId.Value, teacherId, "member", logger);

            await db.SaveChangesAsync();

            // Sample notifications so the UI has something to render when
            // the developer hits /dashboard/notifications. Idempotent —
            // only inserts when the user has zero notifications already.
            if (studentId is not null)
                await SeedSampleNotificationsAsync(db, studentId, StudentSampleNotifications(), logger);
            if (parentId is not null)
                await SeedSampleNotificationsAsync(db, parentId, ParentSampleNotifications(), logger);

            await db.SaveChangesAsync();

            _ = adminId; // unused — Superuser bypasses entitlement checks via permissions
        }

        // Drop sample notifications onto a test user when their inbox is
        // empty. Production users start with no notifications until real
        // producers (assessment-reminders, goal-celebrations, wellbeing
        // alerts) write rows for them.
        private static async Task SeedSampleNotificationsAsync(
            ApplicationDbContext db,
            string userId,
            IEnumerable<(string Kind, string Title, string Body, TimeSpan Ago, string? ActionHref, bool Read)> samples,
            ILogger logger)
        {
            var existing = await db.Set<Notification>()
                .CountAsync(n => n.UserId == userId);
            if (existing > 0) return;

            var now = DateTime.UtcNow;
            foreach (var s in samples)
            {
                db.Set<Notification>().Add(new Notification
                {
                    UserId = userId,
                    Kind = s.Kind,
                    Title = s.Title,
                    Body = s.Body,
                    Time = now - s.Ago,
                    Read = s.Read,
                    ActionHref = s.ActionHref,
                });
            }
            logger.LogInformation("Seeded {Count} sample notifications for {UserId}.", samples.Count(), userId);
        }

        private static IEnumerable<(string Kind, string Title, string Body, TimeSpan Ago, string? ActionHref, bool Read)>
            StudentSampleNotifications() =>
            [
                ("celebration", "5-day study streak", "You hit your goals five days in a row — treat yourself to a 'Take a break' moment.", TimeSpan.FromHours(2), "/dashboard/wellbeing", false),
                ("reminder", "Maths SBA due Friday", "Your Mathematics SBA is due in 3 days. Workspace + AI tutor are ready when you are.", TimeSpan.FromHours(6), "/dashboard/workspace", false),
                ("info", "Mastery snapshot updated", "Your Maths predicted mark moved from 68% to 72% — keep it up.", TimeSpan.FromDays(1), "/dashboard/mastery", true),
                ("alert", "Stress trending up", "Your last 3 mood check-ins are dipping. A 3-minute Take A Break helps reset the load.", TimeSpan.FromDays(2), "/dashboard/wellbeing", true),
                ("info", "Welcome to Aptiverse", "Glad you're here. The help bot in the bottom-right knows how to do everything in the app.", TimeSpan.FromDays(5), null, true),
            ];

        private static IEnumerable<(string Kind, string Title, string Body, TimeSpan Ago, string? ActionHref, bool Read)>
            ParentSampleNotifications() =>
            [
                ("celebration", "Brian hit a study streak", "Your son completed his goals 5 days running. Sending him a quick 'proud of you' goes a long way.", TimeSpan.FromHours(3), "/parent/celebrations", false),
                ("info", "Weekly family recap is in", "Your weekly mastery + wellbeing recap for both learners is ready to read.", TimeSpan.FromDays(1), "/parent", true),
                ("alert", "Amara missed yesterday's check-in", "Two days in a row now. Nothing alarming — just worth a low-pressure chat at dinner.", TimeSpan.FromDays(2), "/parent/wellbeing", true),
            ];

        private static async Task<string?> EnsureUserAsync(
            UserManager<User> mgr,
            string email,
            string firstName,
            string lastName,
            string role,
            ILogger logger)
        {
            var existing = await mgr.FindByEmailAsync(email);
            if (existing is not null)
            {
                if (!await mgr.IsInRoleAsync(existing, role))
                {
                    var addResult = await mgr.AddToRoleAsync(existing, role);
                    if (addResult.Succeeded)
                        logger.LogInformation("Added {Role} role to existing dev user {Email}.", role, email);
                    else
                        logger.LogWarning("Could not assign {Role} to existing user {Email}: {Errors}",
                            role, email, string.Join(", ", addResult.Errors.Select(e => e.Description)));
                }
                return existing.Id;
            }

            var user = new User
            {
                Email = email,
                UserName = email,
                NormalizedEmail = email.ToUpperInvariant(),
                NormalizedUserName = email.ToUpperInvariant(),
                FirstName = firstName,
                LastName = lastName,
                EmailConfirmed = true,
                CreatedAt = DateTime.UtcNow,
            };

            var createResult = await mgr.CreateAsync(user, DevPassword);
            if (!createResult.Succeeded)
            {
                logger.LogWarning("Could not create dev test user {Email}: {Errors}",
                    email, string.Join(", ", createResult.Errors.Select(e => e.Description)));
                return null;
            }

            var roleResult = await mgr.AddToRoleAsync(user, role);
            if (!roleResult.Succeeded)
            {
                logger.LogWarning("Created dev user {Email} but could not assign role {Role}: {Errors}",
                    email, role, string.Join(", ", roleResult.Errors.Select(e => e.Description)));
            }

            logger.LogInformation("Created dev test user {Email} with role {Role}.", email, role);
            return user.Id;
        }

        // Ensure the given user owns an active subscription on the given
        // plan. If they're already an owner of a subscription on that
        // plan, no-op. Otherwise create it and add them as owner.
        private static async Task<long> EnsureSubscriptionAsync(
            ApplicationDbContext db,
            string ownerUserId,
            string planCode,
            string? name,
            ILogger logger)
        {
            var existing = await db.Set<Subscription>()
                .Where(s => s.OwnerUserId == ownerUserId && s.PlanCode == planCode && s.Status == "active")
                .Select(s => (long?)s.Id)
                .FirstOrDefaultAsync();
            if (existing is not null)
            {
                // Make sure the owner is a member too (legacy rows might not have this).
                await EnsureMemberAsync(db, existing.Value, ownerUserId, "owner", logger);
                return existing.Value;
            }

            var sub = new Subscription
            {
                PlanCode = planCode,
                OwnerUserId = ownerUserId,
                Name = name,
                Status = "active",
            };
            db.Set<Subscription>().Add(sub);
            await db.SaveChangesAsync();   // need Id before adding the owner member

            db.Set<SubscriptionMember>().Add(new SubscriptionMember
            {
                SubscriptionId = sub.Id,
                UserId = ownerUserId,
                Role = "owner",
            });
            logger.LogInformation("Seeded {Plan} subscription for {UserId} (sub id {SubId}).", planCode, ownerUserId, sub.Id);
            return sub.Id;
        }

        // Cancels any *active* subscription the test user owns on a plan
        // within the same track that isn't the one we just provisioned.
        // Lets the seeder be re-run after a tier reshuffle without leaving
        // stale entitlements behind. Production users would land here too
        // when they explicitly upgrade — keeping the symmetry deliberate.
        //
        // Filter applied client-side after a small per-user fetch — EF
        // Core 10's funcletizer can't translate a method-parameter
        // `string[]` into a SQL IN clause without throwing on the
        // ReadOnlySpan<string> conversion. The user-scoped fetch is tiny
        // (≤ a handful of rows) so the round-trip is fine.
        private static async Task CancelLegacySubsAsync(
            ApplicationDbContext db,
            string ownerUserId,
            string kept,
            string[] superseded,
            ILogger logger)
        {
            var allActive = await db.Set<Subscription>()
                .Where(s => s.OwnerUserId == ownerUserId && s.Status == "active")
                .ToListAsync();

            var supersededSet = new HashSet<string>(superseded, StringComparer.Ordinal);
            foreach (var sub in allActive)
            {
                if (sub.PlanCode == kept) continue;
                if (!supersededSet.Contains(sub.PlanCode)) continue;

                sub.Status = "cancelled";
                sub.UpdatedAt = DateTime.UtcNow;
                logger.LogInformation("Cancelled legacy {Plan} subscription (id {SubId}) for {UserId} — superseded by {Kept}.",
                    sub.PlanCode, sub.Id, ownerUserId, kept);
            }
        }

        private static async Task EnsureMemberAsync(
            ApplicationDbContext db,
            long subscriptionId,
            string userId,
            string role,
            ILogger logger)
        {
            var exists = await db.Set<SubscriptionMember>()
                .AnyAsync(m => m.SubscriptionId == subscriptionId && m.UserId == userId);
            if (exists) return;

            db.Set<SubscriptionMember>().Add(new SubscriptionMember
            {
                SubscriptionId = subscriptionId,
                UserId = userId,
                Role = role,
            });
            logger.LogInformation("Added user {UserId} as {Role} on subscription {SubId}.", userId, role, subscriptionId);
        }
    }
}
