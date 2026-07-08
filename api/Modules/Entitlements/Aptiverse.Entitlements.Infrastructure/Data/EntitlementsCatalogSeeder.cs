using Aptiverse.Api.Data;
using Aptiverse.Entitlements.Domain.Models;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Entitlements.Infrastructure.Data
{
    // Seeds the canonical Plan catalog, plan→feature mapping, and the
    // per-plan monthly quotas. Mirrors the public pricing page (see
    // web/src/app/(marketing)/pricing).
    //
    // Tier strategy is Claude-style — within a group (student / parent /
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
                    Code = "student.pro",
                    Name = "Student Pro",
                    Description = "Adds the moat features — curriculum-aware AI tutor, SBA coach, adaptive practice, past-paper walk-throughs, career navigator.",
                    MonthlyPriceZar = 129m,
                    AnnualPriceZar = 1290m,
                    MaxMembers = 1,
                    Kind = "paid",
                },
                new Plan
                {
                    Code = "student.max",
                    Name = "Student Max",
                    Description = "For matric finalists — exam simulator, weekly AI debrief, audio explanations, study-plan AI, contextual WhatsApp tutor.",
                    MonthlyPriceZar = 229m,
                    AnnualPriceZar = 2290m,
                    MaxMembers = 1,
                    Kind = "paid",
                },

                // --- Parent track ---------------------------------------
                // Billed by number of children: one child equals a base student
                // (Student Pro) plus the parent tooling layer, then combo
                // pricing as children are added. Every tier grants the same
                // features; tiers differ only by child count and shared quotas.
                new Plan
                {
                    Code = "parent",
                    Name = "Parent (1 child)",
                    Description = "One child on Student Pro, plus the parent dashboard, wellbeing view, and mark forecast.",
                    MonthlyPriceZar = 159m,
                    AnnualPriceZar = 1590m,
                    MaxMembers = 1,
                    Kind = "paid",
                },
                new Plan
                {
                    Code = "parent.2",
                    Name = "Parent (2 children)",
                    Description = "Two children on Student Pro with a shared AI pool, plus the full parent toolkit. Combo pricing.",
                    MonthlyPriceZar = 269m,
                    AnnualPriceZar = 2690m,
                    MaxMembers = 2,
                    Kind = "paid",
                },
                new Plan
                {
                    Code = "parent.3",
                    Name = "Parent (3 children)",
                    Description = "Three children on Student Pro with a shared AI pool, plus the full parent toolkit. Combo pricing.",
                    MonthlyPriceZar = 379m,
                    AnnualPriceZar = 3790m,
                    MaxMembers = 3,
                    Kind = "paid",
                },
                new Plan
                {
                    Code = "parent.4",
                    Name = "Parent (4 children)",
                    Description = "Four children on Student Pro with a shared AI pool, plus the full parent toolkit. Combo pricing.",
                    MonthlyPriceZar = 489m,
                    AnnualPriceZar = 4890m,
                    MaxMembers = 4,
                    Kind = "paid",
                },

                // --- Tutor track (profiles only — no marketplace, no commission) ---
                new Plan
                {
                    Code = "tutor.free",
                    Name = "Tutor Free",
                    Description = "List a public tutor profile at no cost. Show your subjects, qualifications, and rates, and be found by students and families. You arrange lessons and get paid directly; Aptiverse never takes a cut.",
                    MonthlyPriceZar = null,
                    AnnualPriceZar = null,
                    MaxMembers = 1,
                    Kind = "free",
                    CommissionPercent = null,
                },
                new Plan
                {
                    Code = "tutor.pro",
                    Name = "Tutor Pro",
                    Description = "Featured placement, AI lesson-plan and worksheet generator, curriculum-aware AI for your own prep, and profile-view insights. No commission, ever.",
                    MonthlyPriceZar = 199m,
                    AnnualPriceZar = 1990m,
                    MaxMembers = 1,
                    Kind = "paid",
                    CommissionPercent = null,
                },
                // --- Tutor Premium (the top tutor tier offered on /pricing) ---
                new Plan
                {
                    Code = "tutor.premium",
                    Name = "Tutor Premium",
                    Description = "Top placement in search, every prep tool, the highest AI limits, and priority support. No commission, ever.",
                    MonthlyPriceZar = 349m,
                    AnnualPriceZar = 3490m,
                    MaxMembers = 1,
                    Kind = "paid",
                    CommissionPercent = null,
                },

                // --- School ---------------------------------------------
                new Plan
                {
                    Code = "school",
                    Name = "School",
                    Description = "Whole-school deployment — teacher AI tools, school analytics, SSO, success manager.",
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

            // SYNC: remove tiers no longer in the catalog (e.g. pruned legacy
            // plans). A plan is only deleted when nothing points at it — a
            // live subscription keeps it alive so we never orphan a paying
            // member. Its PlanFeature and PlanQuota rows are removed by the
            // feature/quota syncs, and EF orders those child deletes before
            // the plan delete (both declare a FK to Plan.Code).
            var desiredCodes = desired.Select(p => p.Code).ToHashSet();
            foreach (var current in existing.Values)
            {
                if (desiredCodes.Contains(current.Code)) continue;
                var inUse = await db.Set<Subscription>()
                    .AnyAsync(s => s.PlanCode == current.Code, ct);
                if (inUse) continue;
                db.Set<Plan>().Remove(current);
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

                ("student.pro",  "ai.quick",  300),
                ("student.pro",  "ai.deep",    30),
                ("student.pro",  "whatsapp",   50),
                ("student.max",  "ai.quick", 1200),
                ("student.max",  "ai.deep",   100),
                ("student.max",  "whatsapp",  200),

                // Parent tiers pool one Student-Pro allowance per child.
                ("parent",       "ai.quick",  300),
                ("parent",       "ai.deep",    30),
                ("parent",       "whatsapp",   50),
                ("parent.2",     "ai.quick",  600),
                ("parent.2",     "ai.deep",    60),
                ("parent.2",     "whatsapp",  100),
                ("parent.3",     "ai.quick",  900),
                ("parent.3",     "ai.deep",    90),
                ("parent.3",     "whatsapp",  150),
                ("parent.4",     "ai.quick", 1200),
                ("parent.4",     "ai.deep",   120),
                ("parent.4",     "whatsapp",  200),

                ("tutor.free",   "ai.quick",   15),
                ("tutor.free",   "ai.deep",     0),
                ("tutor.free",   "whatsapp",   10),
                ("tutor.pro",    "ai.quick",  300),
                ("tutor.pro",    "ai.deep",    20),
                ("tutor.pro",    "whatsapp",  100),
                ("tutor.premium","ai.quick", 1500),
                ("tutor.premium","ai.deep",    80),
                ("tutor.premium","whatsapp",  500),

                ("school",       "ai.quick",   -1),
                ("school",       "ai.deep",    -1),
                ("school",       "whatsapp",   -1),

                // Claude-generated practice tests. Each generation is an
                // Opus call (+ a verify pass for STEM), so allowances are
                // deliberately tighter than the chat quotas above.
                ("free",         "practice.generate",   3),
                ("student.pro",  "practice.generate",  40),
                ("student.max",  "practice.generate", 150),
                ("parent",       "practice.generate",  40),
                ("parent.2",     "practice.generate",  80),
                ("parent.3",     "practice.generate", 120),
                ("parent.4",     "practice.generate", 160),
                ("tutor.free",   "practice.generate",   5),
                ("tutor.pro",    "practice.generate",  60),
                ("tutor.premium","practice.generate", 200),
                ("school",       "practice.generate",  -1),
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

            // SYNC: drop quota rows for tiers no longer in the catalog, so a
            // pruned plan doesn't leave orphaned allowances behind. Mirrors
            // the PlanFeature sync in UpsertFeaturesAsync.
            var desiredKeys = desired.Select(d => $"{d.PlanCode}|{d.QuotaKey}").ToHashSet();
            foreach (var (key, row) in existing)
            {
                if (!desiredKeys.Contains(key))
                {
                    db.Set<PlanQuota>().Remove(row);
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
                "rewards.redeem",
                "tutor.connect",
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

            // ----- Parent track -----------------------------------------
            // The full parent tooling layer, granted on every parent tier
            // (tiers differ only by child count + shared quotas, not features).
            string[] parentAdds =
            [
                "parent.dashboard",
                "parent.realtime_feed",
                "parent.wellbeing_view",
                "parent.celebrations",
                "parent.forecast",           // matric mark prediction per child
                "parent.billing",
                "family.linked_children",
                "parent.uni_readiness",      // university match probability
                "family.shared_calendar",
                "family.whatsapp_recap",     // weekly WhatsApp recap to parent
            ];

            // School-only parent extras (a real counselling session + the
            // concierge/coach features). Kept out of the paid parent tiers.
            string[] familyProAdds =
            [
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

            // ----- Tutor track (profiles only — no marketplace, no commission) ---
            // All tutor tiers — the basics that justify having an account.
            // Tutors subscribe to be discoverable and meet students; there is
            // no course selling and no payouts.
            string[] tutorEntry =
            [
                "tutor.dashboard",
                "tutor.discoverable",
                "tutor.scheduling",
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
            AddStudent("student.pro");
            foreach (var f in studentProAdds) rows.Add(("student.pro", f));
            AddStudent("student.max");
            foreach (var f in studentProAdds) rows.Add(("student.max", f));
            foreach (var f in studentMaxAdds) rows.Add(("student.max", f));

            // Parent track — every tier grants the same features: each child
            // gets the Student Pro moat, and the parent gets the full toolkit.
            // The four tiers differ only in child count and shared quotas.
            void AddParent(string code)
            {
                foreach (var f in freeFeatures) rows.Add((code, f));
                foreach (var f in studentEntry) rows.Add((code, f));
                foreach (var f in studentProAdds) rows.Add((code, f));
                foreach (var f in parentAdds) rows.Add((code, f));
            }
            AddParent("parent");
            AddParent("parent.2");
            AddParent("parent.3");
            AddParent("parent.4");

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
            // Tutor Premium (the offered top tier) mirrors Tutor Max's grants.
            AddTutor("tutor.premium");
            foreach (var f in tutorProAdds) rows.Add(("tutor.premium", f));
            foreach (var f in tutorMaxAdds) rows.Add(("tutor.premium", f));

            // School — gets the entire stack plus the school extras.
            foreach (var f in freeFeatures) rows.Add(("school", f));
            foreach (var f in studentEntry) rows.Add(("school", f));
            foreach (var f in studentProAdds) rows.Add(("school", f));
            foreach (var f in studentMaxAdds) rows.Add(("school", f));
            foreach (var f in parentAdds) rows.Add(("school", f));
            foreach (var f in familyProAdds) rows.Add(("school", f));
            foreach (var f in familyMaxAdds) rows.Add(("school", f));
            foreach (var f in schoolExtras) rows.Add(("school", f));

            return rows;
        }
    }
}
