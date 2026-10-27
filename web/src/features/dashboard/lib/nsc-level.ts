/** NSC achievement level (1 to 7) for a percent. High school only. */
export function nscLevel(percent: number): number {
  if (percent >= 80) return 7;
  if (percent >= 70) return 6;
  if (percent >= 60) return 5;
  if (percent >= 50) return 4;
  if (percent >= 40) return 3;
  if (percent >= 30) return 2;
  return 1;
}

/** Days in the last week with any real practice. */
export function activeDays(
  days: readonly { practiceMinutes: number; attemptsGraded: number }[],
): number {
  return days.filter((d) => d.practiceMinutes > 0 || d.attemptsGraded > 0)
    .length;
}

/** Greeting by SAST hour. */
export function greetingFor(hour: number): string {
  if (hour >= 5 && hour < 12) return "Good morning";
  if (hour >= 12 && hour < 17) return "Good afternoon";
  return "Good evening";
}
