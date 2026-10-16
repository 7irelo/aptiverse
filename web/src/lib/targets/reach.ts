// The gap engine.
//
// One pure module, because the same arithmetic has to serve three surfaces and
// they must never disagree: the triage list ("clear for UJ, 4 short for Wits"),
// the granular per-unit breakdown, and the what-if. A second implementation in
// a component would drift within a week.
//
// The rule the whole file obeys: every number here is either something the
// student entered (the requirement) or something the server measured from real
// work (the standing). Nothing is modelled, predicted or guessed. Where there
// is no evidence the answer is null and the UI says "no marks yet", because a
// student who is told they are at 0% when they simply have not been graded is
// being lied to about the worst possible thing.

import type { AcademicUnit, UnitSignal } from "@/lib/api/queries";
import type { CatalogSubject, Goal } from "@/lib/mockData";
import type { AdmissionTarget, AdmissionRequirement } from "@/lib/api/targets";
import { prettifyUnitId } from "@/lib/format";

/** Where a requirement stands against the student's real record. */
export type RequirementStatus =
  /** Standing meets or beats the minimum. Good news. */
  | "clear"
  /** Standing is below the minimum. This is the one that becomes a goal. */
  | "short"
  /** Enrolled, but nothing graded and nothing practised. Not a zero. */
  | "unknown"
  /** The plan needs this subject and the student is not taking it. */
  | "not_enrolled"
  /** Not taking it, and taking the other subject in the same either/or pair. */
  | "substituted";

/** Where a standing figure came from. Shown, never implied. */
export type StandingSource = "mark" | "practice" | "what_if";

export type RequirementView = {
  id: string;
  unitId: string;
  unitName: string;
  minimumPercent: number;
  goalId?: string | null;
  status: RequirementStatus;
  /** Null when there is no evidence. Never defaulted to 0. */
  standing: number | null;
  standingSource: StandingSource | null;
  /** minimumPercent - standing, when short. Null otherwise. */
  gap: number | null;
  /** For "substituted": the subject they took instead. */
  substituteName?: string;
};

export type OverallView = {
  unit: "aps" | "average";
  required: number;
  /** Only ever set for "average". APS is recorded, never calculated. See below. */
  standing: number | null;
  gap: number | null;
  /** How many units fed the average, so the figure can be read honestly. */
  countedUnits: number;
};

/** How far a whole plan is from reach. The triage axis. */
export type TargetStatus =
  | "clear"
  | "short"
  /** A required subject the student is not taking. Marks cannot fix this. */
  | "blocked"
  | "unknown"
  /** No granular requirements entered yet. */
  | "empty";

export type TargetReach = {
  target: AdmissionTarget;
  requirements: RequirementView[];
  status: TargetStatus;
  /** The largest single gap across the plan: the number that defines the reach. */
  worstGap: number | null;
  blocked: RequirementView[];
  short: RequirementView[];
  clearCount: number;
  unknownCount: number;
  overall: OverallView | null;
};

export type ReachInputs = {
  units: AcademicUnit[];
  signalsFor: (unitId: string) => UnitSignal;
  /** CAPS catalog, for naming and category of subjects the student is NOT taking. */
  catalog: CatalogSubject[];
  /** What-if: hypothetical marks keyed by unit id. Overrides real evidence. */
  overrides?: Record<string, number>;
};

// Where the student stands in one unit, with the source kept attached so the
// UI can never present a practice figure as a graded mark.
function standingFor(
  unitId: string,
  { signalsFor, overrides }: ReachInputs,
): { value: number | null; source: StandingSource | null } {
  const override = overrides?.[unitId];
  if (override !== undefined) return { value: override, source: "what_if" };

  const s = signalsFor(unitId);
  // A graded mark outranks practice: it is the thing the institution will
  // actually read. Practice mastery is the fallback, labelled as such.
  if (s.currentMark !== null) return { value: s.currentMark, source: "mark" };
  if (s.mastery) return { value: s.mastery.avg, source: "practice" };
  return { value: null, source: null };
}

/**
 * The subject-choice check, and the highest-stakes thing this file does.
 *
 * In South Africa, taking Mathematical Literacy instead of Mathematics closes
 * off engineering, actuarial science and most BScs, and the decision is made in
 * Grade 9 by a fourteen-year-old who is told none of this. By Grade 11 it is
 * usually too late to switch. If a student's own plan names Mathematics and
 * their own enrolment says Mathematical Literacy, that is not a prediction we
 * are making, it is a contradiction between two things they told us, and saying
 * so plainly and early is the most useful thing this feature can do.
 *
 * Scoped to the mathematics category on purpose. That is where the CAPS catalog
 * encodes a genuine either/or (math | math_lit | further_math) and where the
 * consequence is severe. Languages and sciences are multi-select, so reading a
 * different enrolment there as a "substitute" would be noise, and noise in a
 * warning is how a real warning gets ignored.
 */
function substituteFor(
  requiredUnitId: string,
  units: AcademicUnit[],
  catalog: CatalogSubject[],
): string | undefined {
  const required = catalog.find((c) => c.id === requiredUnitId);
  if (!required || required.category !== "mathematics") return undefined;

  const enrolledMaths = units.find((u) => {
    if (u.id === requiredUnitId) return false;
    const entry = catalog.find((c) => c.id === u.id);
    return entry?.category === "mathematics";
  });

  return enrolledMaths?.name;
}

/** Resolve a unit id to something a person can read. Never prints the raw slug. */
export function nameForUnit(
  unitId: string,
  units: AcademicUnit[],
  catalog: CatalogSubject[],
): string {
  return (
    units.find((u) => u.id === unitId)?.name ??
    catalog.find((c) => c.id === unitId)?.name ??
    prettifyUnitId(unitId)
  );
}

function viewForRequirement(
  requirement: AdmissionRequirement,
  inputs: ReachInputs,
): RequirementView {
  const { units, catalog } = inputs;
  const unitName = nameForUnit(requirement.unitId, units, catalog);
  const enrolled = units.some((u) => u.id === requirement.unitId);

  const base = {
    id: requirement.id,
    unitId: requirement.unitId,
    unitName,
    minimumPercent: requirement.minimumPercent,
    goalId: requirement.goalId,
  };

  if (!enrolled) {
    const substituteName = substituteFor(requirement.unitId, units, catalog);
    return {
      ...base,
      status: substituteName ? "substituted" : "not_enrolled",
      substituteName,
      // Deliberately null. A subject they are not taking has no standing, and
      // showing 0% would read as "you are failing it" rather than "you are not
      // in it", which are different problems with different fixes.
      standing: null,
      standingSource: null,
      gap: null,
    };
  }

  const { value, source } = standingFor(requirement.unitId, inputs);
  if (value === null) {
    return { ...base, status: "unknown", standing: null, standingSource: null, gap: null };
  }

  const short = value < requirement.minimumPercent;
  return {
    ...base,
    status: short ? "short" : "clear",
    standing: value,
    standingSource: source,
    gap: short ? requirement.minimumPercent - value : null,
  };
}

// The overall requirement.
//
// "average" is measurable: it is the mean of the graded marks we already hold,
// and the what-if flows through it.
//
// "aps" is NOT, and this is the single most important refusal in the feature.
// APS is scored differently by nearly every institution: some count six
// subjects, some seven, some exclude Life Orientation, some weight it half,
// several run a bespoke scale (UCT's own admission score is not APS at all).
// Picking one of those tables and calling the output "your APS" would hand a
// student a number precise enough to plan around and wrong enough to cost them
// a place. So we store what they researched, show it back, and leave the tally
// to them and their source. A blank is the honest answer here.
function overallFor(target: AdmissionTarget, inputs: ReachInputs): OverallView | null {
  if (!target.overallUnit || target.overallRequired == null) return null;

  const required = target.overallRequired;
  if (target.overallUnit === "aps") {
    return { unit: "aps", required, standing: null, gap: null, countedUnits: 0 };
  }

  // Graded marks only. Averaging a term mark together with a practice mastery
  // percentage would produce a figure that is neither, so units with practice
  // but no marks sit this one out. A what-if override counts, because that is
  // exactly what the student is asking about.
  const marks = inputs.units
    .map((u) => {
      const override = inputs.overrides?.[u.id];
      if (override !== undefined) return override;
      return inputs.signalsFor(u.id).currentMark;
    })
    .filter((m): m is number => m !== null && m !== undefined);

  if (marks.length === 0) {
    return { unit: "average", required, standing: null, gap: null, countedUnits: 0 };
  }

  const standing = Math.round(marks.reduce((s, m) => s + m, 0) / marks.length);
  return {
    unit: "average",
    required,
    standing,
    gap: standing < required ? required - standing : null,
    countedUnits: marks.length,
  };
}

export function reachFor(target: AdmissionTarget, inputs: ReachInputs): TargetReach {
  const requirements = target.requirements.map((r) => viewForRequirement(r, inputs));

  const blocked = requirements.filter(
    (r) => r.status === "not_enrolled" || r.status === "substituted",
  );
  const short = requirements.filter((r) => r.status === "short");
  const clearCount = requirements.filter((r) => r.status === "clear").length;
  const unknownCount = requirements.filter((r) => r.status === "unknown").length;
  const overall = overallFor(target, inputs);

  // The reach of a plan is its worst gap, not its average one. An applicant is
  // rejected by the requirement they missed, not by the mean of the ones they
  // met, so averaging here would be a comforting lie.
  const gaps = [...short.map((r) => r.gap ?? 0), ...(overall?.gap != null ? [overall.gap] : [])];
  const worstGap = gaps.length ? Math.max(...gaps) : null;

  // Something we actually put a number to. "No requirement is short" is
  // trivially true when nothing has been graded, so clear has to be earned by
  // evidence: telling a student with no marks that they are on track for
  // medicine would be the worst bug in this codebase.
  const measuredCount = clearCount + short.length;

  const status: TargetStatus =
    requirements.length === 0 && overall === null
      ? "empty"
      : blocked.length > 0
        ? "blocked"
        : short.length > 0 || overall?.gap != null
          ? "short"
          : measuredCount === 0 && overall?.standing == null
            ? "unknown"
            : "clear";

  return {
    target,
    requirements,
    status,
    worstGap,
    blocked,
    short,
    clearCount,
    unknownCount,
    overall,
  };
}

const STATUS_ORDER: Record<TargetStatus, number> = {
  clear: 0,
  short: 1,
  // After "short" deliberately. A mark gap can be closed by working harder; a
  // subject you are not enrolled in usually cannot be closed at all by the time
  // a student reads this. It is the furthest thing from reach, so it sorts last
  // among the plans that are actually blocked on something.
  blocked: 2,
  unknown: 3,
  empty: 4,
};

/**
 * Triage. Sorts plans by how far off the student is, closest first, so the list
 * reads "clear for UJ, 4 short for Wits, 12 short for UCT".
 *
 * This ordering is the whole point of supporting several plans at once: a
 * student applying to five institutions is carrying five vague dreads, and a
 * sorted list converts that into one sentence they can act on. There is no
 * difficulty rating anywhere in it. The order comes only from the student's own
 * numbers and their own marks, which is why it can be trusted.
 */
export function triage(targets: AdmissionTarget[], inputs: ReachInputs): TargetReach[] {
  return targets
    .map((t) => reachFor(t, inputs))
    .sort((a, b) => {
      const byStatus = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
      if (byStatus !== 0) return byStatus;
      return (a.worstGap ?? 0) - (b.worstGap ?? 0);
    });
}

/** The rungs of the tertiary ladder, in the student's words rather than ours. */
export function stageLabel(stage: string): string {
  switch (stage) {
    case "next_year":
      return "Next year";
    case "honours":
      return "Honours";
    case "masters":
      return "Masters";
    case "phd":
      return "PhD";
    default:
      return stage;
  }
}

/** One-line summary of a plan's reach. The sentence the triage list is built on. */
export function reachLabel(r: TargetReach): string {
  switch (r.status) {
    case "clear":
      return "On track";
    case "short":
      return r.worstGap != null ? `${r.worstGap} short` : "Short";
    case "blocked":
      return r.blocked.length === 1 ? "Subject missing" : `${r.blocked.length} subjects missing`;
    case "unknown":
      // A plan carrying only an overall APS has nothing we can measure, and the
      // fix is not "go get marks", it is "tell us which subjects gate this".
      // Point at the thing that would actually make the plan useful.
      return r.requirements.length === 0 ? "Add subject minimums" : "No marks yet";
    case "empty":
      return "No requirements yet";
  }
}

/** Which requirements are worth turning into goals: the gaps, and only the gaps. */
export function goalCandidates(r: TargetReach, goals: Goal[]): RequirementView[] {
  const liveGoalIds = new Set(goals.map((g) => g.id));
  return r.short.filter((req) => {
    // A dangling link (student deleted the goal) reads as "not generated",
    // which is the truth, and lets them generate it again.
    if (req.goalId && liveGoalIds.has(req.goalId)) return false;
    return true;
  });
}
