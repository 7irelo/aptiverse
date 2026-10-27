/**
 * Mastery bands from the API (emerging, developing, secure, mastered) in
 * the words students see. Null means no evidence: "Not started", never 0%.
 */
export const BANDS = [
  { band: null, label: "Not started", range: "No practice answers yet" },
  { band: "emerging", label: "Building", range: "Under 50%" },
  { band: "developing", label: "Developing", range: "50% to 69%" },
  { band: "secure", label: "Secure", range: "70% to 84%" },
  { band: "mastered", label: "Strong", range: "85% and above" },
] as const;

export function bandLabel(band: string | null | undefined): string {
  return BANDS.find((b) => b.band === (band ?? null))?.label ?? "Not started";
}

/** Score (0 to 1) as a whole percent string, or null without evidence. */
export function masteryPercent(
  score: number | null | undefined,
): number | null {
  if (score === null || score === undefined) return null;
  return Math.round(score * 100);
}

/** Weakest first, ties by fewest answers, then topics without evidence by name. */
export function sortTopics<
  T extends { topic: string; score: number | null; evidenceQuestions: number },
>(topics: readonly T[]): T[] {
  return [...topics].sort((a, b) => {
    if (a.score === null && b.score === null)
      return a.topic.localeCompare(b.topic);
    if (a.score === null) return 1;
    if (b.score === null) return -1;
    if (a.score !== b.score) return a.score - b.score;
    return a.evidenceQuestions - b.evidenceQuestions;
  });
}

export function bandTone(band: string | null | undefined): string {
  if (band === "emerging") return "text-warning";
  if (band === "mastered") return "text-success";
  return "text-muted-foreground";
}
