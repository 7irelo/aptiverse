using Aptiverse.Api.Data;
using Aptiverse.Entitlements.Domain.Models;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Entitlements.Infrastructure.Data
{
    // Seeds the canonical Plan catalog, plan→feature mapping, and the
    // per-plan monthly quotas. Mirrors the public pricing page (see
    // web/src/app/(marketing)/pricing).
    //
    // Tier strategy is Claude-style — within a group (student / family /
    // tutor) features grow as you climb, and quotas grow with them. The
    // Tutor track has a marketplace commission that *tapers down* as
    // subscription goes up: 15% → 10% → 0%. That gives a free on-ramp
    // (commission-only) and rewards committing to a paid tier.
    //
    // Additive at the row level: re-running adds newly-defined plans /
    // features / quotas without disturbing rows already present. Safe to
    // call on every boot.
    public static class EntitlementsCatalogSeeder
    {
        public static async Task SeedAsync(ApplicationDbContext db, CancellationToken ct = default)
        {
            await UpsertPlansAsync(db, ct);
            await UpsertFeaturesAsync(db, ct);
            await UpsertQuotasAsync(db, ct);
            await db.SaveChangesAsync(ct);
        }

        // -----------------------------------------------------------------
        // Plans
        // -----------------------------------------------------------------
        private static async Task UpsertPlansAsync(ApplicationDbContext db, CancellationToken ct)
        {
            var desired = new[]
            {
                new Plan
                {
                    Code = "free",
                    Name = "Free",
                    Description = "Genuinely useful — start here. SBA tracking, basic AI practice, wellbeing.",
                    MonthlyPriceZar = null,
                    AnnualPriceZar = null,
                    MaxMembers = 1,
                    Kind = "free",
                },

                // --- Student track --------------------------------------
                new Plan
                {
                    Code = "student",
                    Name = "Student",
                    Description = "Entry tier — unlimited subjects, basic AI practice, daily diary, mastery snapshot.",
                    MonthlyPriceZar = 79m,
                    AnnualPriceZar = 790m,   // ≈17% off
                    MaxMembers = 1,
                    Kind = "paid",
                },
                new Plan
                {
                    Code = "student.pro",
                    Name = "Student Pro",
                    Description = "Adds the moat features — curriculum-aware AI tutor, SBA coach, adaptive practice, past-paper walk-throughs, career navigator.",
                    MonthlyPriceZar = 149m,
                    AnnualPriceZar = 1490m,
                    MaxMembers = 1,
                    Kind = "paid",
                },
                new Plan
                {
                    Code = "student.max",
                    Name = "Student Max",
                    Description = "For matric finalists — exam simulator, weekly AI debrief, audio explanations, study-plan AI, contextual WhatsApp tutor.",
                    MonthlyPriceZar = 299m,
                    AnnualPriceZar = 2990m,
                    MaxMembers = 1,
                    Kind = "paid",
                },

                // --- Family track ---------------------------------------
                new Plan
                {
                    Code = "family",
                    Name = "Family",
                    Description = "Up to 2 learners on one bill. Parent dashboard, realtime activity, mastery forecast per child.",
                    MonthlyPriceZar = 199m,
                    AnnualPriceZar = 1990m,
                    MaxMembers = 2,
                    Kind = "paid",
                },
                new Plan
                {
                    Code = "family.pro",
                    Name = "Family Pro",
                    Description = "Up to 4 learners — adds bursary pipeline tracker, university readiness, family WhatsApp recap, 1 counselling session / quarter.",
                    MonthlyPriceZar = 349m,
                    AnnualPriceZar = 3490m,
                    MaxMembers = 4,
                    Kind = "paid",
                },
                new Plan
                {
                    Code = "family.max",
                    Name = "Family Max",
                    Description = "Up to 6 learners — adds AI parenting coach, custom intervention plans, tutor concierge, family wellbeing dashboard.",
                    MonthlyPriceZar = 649m,
                    AnnualPriceZar = 6490m,
                    MaxMembers = 6,
                    Kind = "paid",
                },

                // --- Tutor track (marketplace + commission) -------------
                new Plan
                {
                    Code = "tutor.free",
                    Name = "Tutor Free",
                    Description = "Pay-as-you-go for tutors — list on the marketplace, schedule, take payments. Aptiverse takes 15% commission on platform bookings.",
                    MonthlyPriceZar = null,
                    AnnualPriceZar = null,
                    MaxMembers = 1,
                    Kind = "free",
                    CommissionPercent = 0.15m,
                },
                new Plan
                {
                    Code = "tutor.pro",
                    Name = "Tutor Pro",
                    Description = "Unlocks the AI moat — lesson plan generator, mastery per client, auto parent reports, AI worksheets, featured marketplace listing. 10% commission.",
                    MonthlyPriceZar = 149m,
                    AnnualPriceZar = 1490m,
                    MaxMembers = 1,
                    Kind = "paid",
                    CommissionPercent = 0.10m,
                },
                new Plan
                {
                    Code = "tutor.max",
                    Name = "Tutor Max",
                    Description = "The white-glove tier — AI SBA marker, white-label parent reports, SARS tax export, group mode, top marketplace placement. Zero commission.",
                    MonthlyPriceZar = 349m,
                    AnnualPriceZar = 3490m,
                    MaxMembers = 1,
                    Kind = "paid",
                    CommissionPercent = 0m,
                },

                // --- School ---------------------------------------------
                new Plan
                {
                    Code = "school",
                    Name = "School",
                    Description = "Whole-school deployment — teacher AI tools, school analytics, SSO, bursary partner pipeline, success manager.",
                    MonthlyPriceZar = null,
                    AnnualPriceZar = null,
                    MaxMembers = 5000,
                    Kind = "custom",
                },
            };

            // Upsert: insert missing plans, refresh display fields on
            // existing rows so catalog changes flow through on next boot.
            var existing = await db.Set<Plan>().ToDictionaryAsync(p => p.Code, ct);
            foreach (var p in desired)
            {
                if (!existing.TryGetValue(p.Code, out var current))
                {
                    db.Set<Plan>().Add(p);
                }
                else
                {
                    current.Name = p.Name;
                    current.Description = p.Description;
                    current.MonthlyPriceZar = p.MonthlyPriceZar;
                    current.AnnualPriceZar = p.AnnualPriceZar;
                    current.MaxMembers = p.MaxMembers;
                    current.Kind = p.Kind;
                    current.CommissionPercent = p.CommissionPercent;
                }
            }
        }

        // -----------------------------------------------------------------
        // Quotas (metered features — AI Quick/Deep + WhatsApp messages)
        // -----------------------------------------------------------------
        // -1 = unlimited (subject to fair-use enforced at the HTTP layer).
        // Margin holds at 50% utilisation across every paid tier; commission
        // covers the AI cost for Tutor Free.
        private static async Task UpsertQuotasAsync(ApplicationDbContext db, CancellationToken ct)
        {
            var desired = new (string PlanCode, string QuotaKey, int PerMonth)[]
            {
                ("free",         "ai.quick",   15),
                ("free",         "ai.deep",     0),
                ("free",         "whatsapp",    0),

                ("student",      "ai.quick",   60),
                ("student",      "ai.deep",     5),
                ("student",      "whatsapp",   10),
                ("student.pro",  "ai.quick",  300),
                ("student.pro",  "ai.deep",    30),
                ("student.pro",  "whatsapp",   50),
                ("student.max",  "ai.quick", 1200),
                ("student.max",  "ai.deep",   100),
                ("student.max",  "whatsapp",  200),

                ("family",       "ai.quick",  200),
                ("family",       "ai.deep",    15),
                ("family",       "whatsapp",   40),
                ("family.pro",   "ai.quick",  800),
                ("family.pro",   "ai.deep",    80),
                ("family.pro",   "whatsapp",  200),
                ("family.max",   "ai.quick", 2400),
                ("family.max",   "ai.deep",   200),
                ("family.max",   "whatsapp",  500),

                ("tutor.free",   "ai.quick",   15),
                ("tutor.free",   "ai.deep",     0),
                ("tutor.free",   "whatsapp",   10),
                ("tutor.pro",    "ai.quick",  300),
                ("tutor.pro",    "ai.deep",    20),
                ("tutor.pro",    "whatsapp",  100),
                ("tutor.max",    "ai.quick", 1500),
                ("tutor.max",    "ai.deep",    80),
                ("tutor.max",    "whatsapp",  500),

                ("school",       "ai.quick",   -1),
                ("school",       "ai.deep",    -1),
                ("school",       "whatsapp",   -1),
            };

            var existing = await db.Set<PlanQuota>()
                .ToDictionaryAsync(q => $"{q.PlanCode}|{q.QuotaKey}", ct);

            foreach (var (planCode, quotaKey, perMonth) in desired)
            {
                var key = $"{planCode}|{quotaKey}";
                if (existing.TryGetValue(key, out var current))
                {
                    current.PerMonth = perMonth;
                }
                else
                {
                    db.Set<PlanQuota>().Add(new PlanQuota
                    {
                        PlanCode = planCode,
                        QuotaKey = quotaKey,
                        PerMonth = perMonth,
                    });
                }
            }
        }

        // -----------------------------------------------------------------
        // Plan → Feature mapping
        // -----------------------------------------------------------------
        // Computed in code rather than nesting in the DB so the marketing
        // pitch on /pricing and the gating rules stay perfectly aligned.
        //
        // SYNC semantics (not just upsert): if a feature was previously
        // mapped to a plan but is no longer in the desired set, it gets
        // deleted. Otherwise raising the entry tier (e.g. "student" loses
        // ai_tutor when it moves to student.pro) would leave stale rows
        // and the entry tier would silently keep granting old features.
        private static async Task UpsertFeaturesAsync(ApplicationDbContext db, CancellationToken ct)
        {
            var desired = AllPlanFeatures().ToHashSet();
            var existing = await db.Set<PlanFeature>().ToListAsync(ct);

            var existingKeys = existing
                .Select(pf => (pf.PlanCode, pf.FeatureKey))
                .ToHashSet();

            // Add missing.
            foreach (var (planCode, featureKey) in desired)
            {
                if (!existingKeys.Contains((planCode, featureKey)))
                {
                    db.Set<PlanFeature>().Add(new PlanFeature
                    {
                        PlanCode = planCode,
                        FeatureKey = featureKey,
                    });
                }
            }

            // Remove rows no longer in the desired catalog. This handles
            // tier-restructuring (Student → Student / Pro / Max) where the
            // entry tier sheds features that have moved up.
            foreach (var pf in existing)
            {
                if (!desired.Contains((pf.PlanCode, pf.FeatureKey)))
                {
                    db.Set<PlanFeature>().Remove(pf);
                }
            }
        }

        private static List<(string PlanCode, string FeatureKey)> AllPlanFeatures()
        {
            // ----- Free baseline (everyone gets these) -----
            string[] freeFeatures =
            [
                "subjects.up_to_6",
                "goals.basic",
                "ai_practice.basic",
                "diary",
                "wellbeing.basic",
                "bursaries.read",
                "past_papers.read",
                "universities.read",
                "calendar",
                "notifications",
                "settings",
                "help",
            ];

            // ----- Student track ---------------------------------------
            // Entry tier — unlimited subjects, basic personalization.
            string[] studentEntry =
            [
                "subjects.unlimited",
                "goals.unlimited",
                "ai_practice.unlimited",
                "mastery.snapshot",          // a one-off prediction, not the
                                             // continuous forecasts in Pro
                "courses.enrol",
                "psychologist.read",
            ];

            // Pro — the AI moat. The reason a tutor or a student wouldn't
            // just use ChatGPT: curriculum-aware, rubric-aware, ZA-specific.
            string[] studentProAdds =
            [
                "goals.milestones",
                "ai_tutor",                  // generic name kept for back-compat
                "ai_tutor.curriculum_aware", // knows NSC/IEB syllabus + textbook refs
                "ai_practice.adaptive",      // difficulty scales to mastery
                "past_papers.solved",        // examiner-style walk-throughs
                "sba.coach",                 // real-time SBA draft feedback
                "mastery.predictions",       // continuous forecast w/ confidence
                "career_navigator",
                "bursaries.checklist",
                "rewards.redeem",
                "tutor_marketplace.book",
                "study_groups",
                "workspace",
                "support.priority",
            ];

            // Max — exam-finals tier. Long-context AI, audio, simulator.
            string[] studentMaxAdds =
            [
                "exam.simulator",            // timed full papers, AI-marked
                "audio.explanations",        // listen on the commute
                "study_plan.ai",             // cross-subject weekly plan
                "ai_debrief.weekly",         // long Sonnet session reviewing the week
                "whatsapp.contextual",       // WhatsApp tutor that remembers you
            ];

            // ----- Family track -----------------------------------------
            // Entry — multi-child dashboard + forecast.
            string[] familyEntryAdds =
            [
                "parent.dashboard",
                "parent.realtime_feed",
                "parent.wellbeing_view",
                "parent.celebrations",
                "parent.forecast",           // matric mark prediction per child
                "parent.billing",
                "family.linked_children",
            ];

            // Pro — bursary + university pipelines + counselling.
            string[] familyProAdds =
            [
                "parent.bursary_pipeline",   // eligibility + deadlines per child
                "parent.uni_readiness",      // university match probability
                "family.shared_calendar",
                "family.whatsapp_recap",     // weekly WhatsApp recap to parent
                "counselling.session_included",
            ];

            // Max — concierge + AI parenting coach.
            string[] familyMaxAdds =
            [
                "parent.ai_coach",           // Sonnet-powered parenting advisor
                "parent.interventions",      // AI-built per-child action plans
                "parent.tutor_concierge",    // Aptiverse books tutors on your behalf
                "family.wellbeing_dashboard",// aggregated trends over time
            ];

            // ----- Tutor track (marketplace + commission) ---------------
            // All tutor tiers — the basics that justify having an account.
            string[] tutorEntry =
            [
                "tutor.dashboard",
                "tutor.marketplace_listing",
                "tutor.scheduling",
                "tutor.payments",
                "tutor.client_tracker",
                "tutor.messaging",
            ];

            // Pro — the AI moat for tutors. ChatGPT + spreadsheet can't
            // do these because they're tied to Aptiverse's curriculum graph
            // and student data model.
            string[] tutorProAdds =
            [
                "tutor.lesson_plans_ai",     // personalised lesson plan per client
                "tutor.mastery_per_client",  // mastery forecast per learner
                "tutor.parent_reports_auto", // AI-written weekly recap per client
                "tutor.worksheets_ai",       // NSC/IEB-style problems at level
                "tutor.marketplace_featured",
                "ai_tutor",                  // tutor's own AI assistant
                "ai_tutor.curriculum_aware",
            ];

            // Max — the white-glove tier. Branding + tax + group mode.
            string[] tutorMaxAdds =
            [
                "tutor.sba_marker_ai",          // photo a draft → marked output
                "tutor.parent_reports_whitelabel",
                "tutor.sars_export",            // year-end income export
                "tutor.group_mode",             // adaptive worksheets in 1 session
                "tutor.marketplace_top",
                "support.priority",
            ];

            // ----- School (custom-priced; one tier) ---------------------
            string[] schoolExtras =
            [
                "teacher.dashboard",
                "teacher.gap_analysis",
                "teacher.differentiator",
                "teacher.analytics",
                "teacher.classes",
                "teacher.assignments",
                "teacher.verifications",
                "teacher.live_view",
                "school_admin.dashboard",
                "school_admin.analytics",
                "school_admin.readiness",
                "school_admin.teachers",
                "school_admin.students",
                "school_admin.classes",
                "school.bursary_partners",
                "school.sso",
                "school.success_manager",
            ];

            var rows = new List<(string, string)>();

            // Free baseline applies to every signed-in user.
            foreach (var f in freeFeatures) rows.Add(("free", f));

            // Student track — each tier strictly includes the one below.
            void AddStudent(string code)
            {
                foreach (var f in freeFeatures) rows.Add((code, f));
                foreach (var f in studentEntry) rows.Add((code, f));
            }
            AddStudent("student");
            AddStudent("student.pro");
            foreach (var f in studentProAdds) rows.Add(("student.pro", f));
            AddStudent("student.max");
            foreach (var f in studentProAdds) rows.Add(("student.max", f));
            foreach (var f in studentMaxAdds) rows.Add(("student.max", f));

            // Family track — each tier strictly includes the one below.
            // Family.* inherits everything from Student Pro (every learner
            // in the household gets the moat features), plus parent tooling.
            void AddFamily(string code)
            {
                foreach (var f in freeFeatures) rows.Add((code, f));
                foreach (var f in studentEntry) rows.Add((code, f));
                foreach (var f in studentProAdds) rows.Add((code, f));
                foreach (var f in familyEntryAdds) rows.Add((code, f));
            }
            AddFamily("family");
            AddFamily("family.pro");
            foreach (var f in familyProAdds) rows.Add(("family.pro", f));
            AddFamily("family.max");
            foreach (var f in familyProAdds) rows.Add(("family.max", f));
            foreach (var f in familyMaxAdds) rows.Add(("family.max", f));

            // Tutor track — each tier strictly includes the one below.
            // Tutor tiers also get free baseline so they can use the
            // platform like a student would (diary, calendar, etc.).
            void AddTutor(string code)
            {
                foreach (var f in freeFeatures) rows.Add((code, f));
                foreach (var f in tutorEntry) rows.Add((code, f));
            }
            AddTutor("tutor.free");
            AddTutor("tutor.pro");
            foreach (var f in tutorProAdds) rows.Add(("tutor.pro", f));
            AddTutor("tutor.max");
            foreach (var f in tutorProAdds) rows.Add(("tutor.max", f));
            foreach (var f in tutorMaxAdds) rows.Add(("tutor.max", f));

            // School — gets the entire stack plus the school extras.
            foreach (var f in freeFeatures) rows.Add(("school", f));
            foreach (var f in studentEntry) rows.Add(("school", f));
            foreach (var f in studentProAdds) rows.Add(("school", f));
            foreach (var f in studentMaxAdds) rows.Add(("school", f));
            foreach (var f in familyEntryAdds) rows.Add(("school", f));
            foreach (var f in familyProAdds) rows.Add(("school", f));
            foreach (var f in familyMaxAdds) rows.Add(("school", f));
            foreach (var f in schoolExtras) rows.Add(("school", f));

            return rows;
        }
    }
}
