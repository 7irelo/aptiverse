// Feature keys mirror the backend's PlanFeature catalog (see
// api/Modules/Entitlements/.../EntitlementsCatalogSeeder.cs). Keep this
// in sync with that seeder — both sides are the contract for what
// FeatureGuard / [RequiresFeature] check against.
//
// Type-safe string union so typos are caught at compile time. Adding a
// new feature is two edits: add the key here, add the row in the seeder.

export type FeatureKey =
  // -------- Free baseline (every user) --------
  | "subjects.up_to_6"
  | "goals.basic"
  | "ai_practice.basic"
  | "diary"
  | "wellbeing.basic"
  | "bursaries.read"
  | "past_papers.read"
  | "universities.read"
  | "calendar"
  | "notifications"
  | "settings"
  | "help"

  // -------- Student entry --------
  | "subjects.unlimited"
  | "goals.unlimited"
  | "ai_practice.unlimited"
  | "mastery.snapshot"
  | "courses.enrol"
  | "psychologist.read"

  // -------- Student Pro (the AI moat) --------
  | "goals.milestones"
  | "ai_tutor"
  | "ai_tutor.curriculum_aware"
  | "ai_practice.adaptive"
  | "past_papers.solved"
  | "sba.coach"
  | "mastery.predictions"
  | "career_navigator"
  | "bursaries.checklist"
  | "rewards.redeem"
  | "tutor_marketplace.book"
  | "study_groups"
  | "workspace"
  | "support.priority"

  // -------- Student Max (exam-finals tier) --------
  | "exam.simulator"
  | "audio.explanations"
  | "study_plan.ai"
  | "ai_debrief.weekly"
  | "whatsapp.contextual"

  // -------- Family entry --------
  | "parent.dashboard"
  | "parent.realtime_feed"
  | "parent.wellbeing_view"
  | "parent.celebrations"
  | "parent.forecast"
  | "parent.billing"
  | "family.linked_children"

  // -------- Family Pro --------
  | "parent.bursary_pipeline"
  | "parent.uni_readiness"
  | "family.shared_calendar"
  | "family.whatsapp_recap"
  | "counselling.session_included"

  // -------- Family Max --------
  | "parent.ai_coach"
  | "parent.interventions"
  | "parent.tutor_concierge"
  | "family.wellbeing_dashboard"

  // -------- Tutor entry (Tutor Free) --------
  | "tutor.dashboard"
  | "tutor.marketplace_listing"
  | "tutor.scheduling"
  | "tutor.payments"
  | "tutor.client_tracker"
  | "tutor.messaging"

  // -------- Tutor Pro (AI moat for tutors) --------
  | "tutor.lesson_plans_ai"
  | "tutor.mastery_per_client"
  | "tutor.parent_reports_auto"
  | "tutor.worksheets_ai"
  | "tutor.marketplace_featured"

  // -------- Tutor Max (white-glove) --------
  | "tutor.sba_marker_ai"
  | "tutor.parent_reports_whitelabel"
  | "tutor.sars_export"
  | "tutor.group_mode"
  | "tutor.marketplace_top"

  // -------- School --------
  | "teacher.dashboard"
  | "teacher.gap_analysis"
  | "teacher.differentiator"
  | "teacher.analytics"
  | "teacher.classes"
  | "teacher.assignments"
  | "teacher.verifications"
  | "teacher.live_view"
  | "school_admin.dashboard"
  | "school_admin.analytics"
  | "school_admin.readiness"
  | "school_admin.teachers"
  | "school_admin.students"
  | "school_admin.classes"
  | "school.bursary_partners"
  | "school.sso"
  | "school.success_manager";

export type PlanCode =
  | "free"
  | "student"
  | "student.pro"
  | "student.max"
  | "family"
  | "family.pro"
  | "family.max"
  | "tutor.free"
  | "tutor.pro"
  | "tutor.max"
  | "school";

// Cheapest plan that unlocks each feature. Used by FeatureGuard's fallback
// to suggest the right "Upgrade to X" CTA. For cross-track features (like
// `ai_tutor`, which is in both Student Pro and Tutor Pro) we pick the
// student-track entry since that's the cheaper / more common upgrade path.
export const FEATURE_MIN_PLAN: Record<FeatureKey, PlanCode> = {
  // Free baseline
  "subjects.up_to_6": "free",
  "goals.basic": "free",
  "ai_practice.basic": "free",
  diary: "free",
  "wellbeing.basic": "free",
  "bursaries.read": "free",
  "past_papers.read": "free",
  "universities.read": "free",
  calendar: "free",
  notifications: "free",
  settings: "free",
  help: "free",

  // Student entry
  "subjects.unlimited": "student",
  "goals.unlimited": "student",
  "ai_practice.unlimited": "student",
  "mastery.snapshot": "student",
  "courses.enrol": "student",
  "psychologist.read": "student",

  // Student Pro
  "goals.milestones": "student.pro",
  ai_tutor: "student.pro",
  "ai_tutor.curriculum_aware": "student.pro",
  "ai_practice.adaptive": "student.pro",
  "past_papers.solved": "student.pro",
  "sba.coach": "student.pro",
  "mastery.predictions": "student.pro",
  career_navigator: "student.pro",
  "bursaries.checklist": "student.pro",
  "rewards.redeem": "student.pro",
  "tutor_marketplace.book": "student.pro",
  study_groups: "student.pro",
  workspace: "student.pro",
  "support.priority": "student.pro",

  // Student Max
  "exam.simulator": "student.max",
  "audio.explanations": "student.max",
  "study_plan.ai": "student.max",
  "ai_debrief.weekly": "student.max",
  "whatsapp.contextual": "student.max",

  // Family entry
  "parent.dashboard": "family",
  "parent.realtime_feed": "family",
  "parent.wellbeing_view": "family",
  "parent.celebrations": "family",
  "parent.forecast": "family",
  "parent.billing": "family",
  "family.linked_children": "family",

  // Family Pro
  "parent.bursary_pipeline": "family.pro",
  "parent.uni_readiness": "family.pro",
  "family.shared_calendar": "family.pro",
  "family.whatsapp_recap": "family.pro",
  "counselling.session_included": "family.pro",

  // Family Max
  "parent.ai_coach": "family.max",
  "parent.interventions": "family.max",
  "parent.tutor_concierge": "family.max",
  "family.wellbeing_dashboard": "family.max",

  // Tutor entry (Free with commission)
  "tutor.dashboard": "tutor.free",
  "tutor.marketplace_listing": "tutor.free",
  "tutor.scheduling": "tutor.free",
  "tutor.payments": "tutor.free",
  "tutor.client_tracker": "tutor.free",
  "tutor.messaging": "tutor.free",

  // Tutor Pro
  "tutor.lesson_plans_ai": "tutor.pro",
  "tutor.mastery_per_client": "tutor.pro",
  "tutor.parent_reports_auto": "tutor.pro",
  "tutor.worksheets_ai": "tutor.pro",
  "tutor.marketplace_featured": "tutor.pro",

  // Tutor Max
  "tutor.sba_marker_ai": "tutor.max",
  "tutor.parent_reports_whitelabel": "tutor.max",
  "tutor.sars_export": "tutor.max",
  "tutor.group_mode": "tutor.max",
  "tutor.marketplace_top": "tutor.max",

  // School
  "teacher.dashboard": "school",
  "teacher.gap_analysis": "school",
  "teacher.differentiator": "school",
  "teacher.analytics": "school",
  "teacher.classes": "school",
  "teacher.assignments": "school",
  "teacher.verifications": "school",
  "teacher.live_view": "school",
  "school_admin.dashboard": "school",
  "school_admin.analytics": "school",
  "school_admin.readiness": "school",
  "school_admin.teachers": "school",
  "school_admin.students": "school",
  "school_admin.classes": "school",
  "school.bursary_partners": "school",
  "school.sso": "school",
  "school.success_manager": "school",
};

export const PLAN_LABELS: Record<PlanCode, string> = {
  free: "Free",
  student: "Student",
  "student.pro": "Student Pro",
  "student.max": "Student Max",
  family: "Family",
  "family.pro": "Family Pro",
  "family.max": "Family Max",
  "tutor.free": "Tutor Free",
  "tutor.pro": "Tutor Pro",
  "tutor.max": "Tutor Max",
  school: "School",
};
