/**
 * Dates for students, always in South African time (Africa/Johannesburg,
 * UTC+2 all year, no daylight saving). "Today", "Tomorrow" and "Overdue"
 * use SAST midnight, never the browser's time zone, so a phone set to
 * another zone still sees the same labels as the server.
 */

export const SAST = "Africa/Johannesburg";
const SAST_OFFSET_MS = 2 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

/** The current time in epoch ms. Server Components render once per request. */
export function nowMs(): number {
  return Date.now();
}

function toDate(value: string | Date): Date {
  return typeof value === "string" ? new Date(value) : value;
}

/** Days since the epoch at SAST midnight, for whole-day comparisons. */
export function sastDayNumber(value: string | Date): number {
  return Math.floor((toDate(value).getTime() + SAST_OFFSET_MS) / DAY_MS);
}

/** "2026-10-19" for the SAST calendar day of an instant. */
export function sastDateKey(value: string | Date): string {
  return new Date(toDate(value).getTime() + SAST_OFFSET_MS)
    .toISOString()
    .slice(0, 10);
}

/** Whole SAST days from now until the value (negative when past). */
export function daysFromToday(
  value: string | Date,
  now: Date = new Date(),
): number {
  return sastDayNumber(value) - sastDayNumber(now);
}

/** The SAST hour (0 to 23) of an instant. */
export function sastHour(value: Date = new Date()): number {
  return new Date(value.getTime() + SAST_OFFSET_MS).getUTCHours();
}

const formatters = new Map<string, Intl.DateTimeFormat>();
function fmt(options: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
  const key = JSON.stringify(options);
  let formatter = formatters.get(key);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat("en-ZA", {
      timeZone: SAST,
      ...options,
    });
    formatters.set(key, formatter);
  }
  return formatter;
}

/** "Monday 19 October" */
export function formatLongDay(value: string | Date): string {
  const d = toDate(value);
  const weekday = fmt({ weekday: "long" }).format(d);
  return `${weekday} ${formatDayMonth(d)}`;
}

/** "19 October" */
export function formatDayMonth(value: string | Date): string {
  const d = toDate(value);
  return `${fmt({ day: "numeric" }).format(d)} ${fmt({ month: "long" }).format(d)}`;
}

/** "19 Oct 2026" */
export function formatDate(value: string | Date): string {
  const d = toDate(value);
  return `${fmt({ day: "numeric" }).format(d)} ${fmt({ month: "short" }).format(d)} ${fmt({ year: "numeric" }).format(d)}`;
}

/** "14:00" */
export function formatTime(value: string | Date): string {
  const d = new Date(toDate(value).getTime() + SAST_OFFSET_MS);
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mm = String(d.getUTCMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

/**
 * Due label for an assessment: "Overdue by 2 days", "Due today, 14:00",
 * "Due tomorrow", "Due Fri 24 Oct", "Due 3 Nov".
 */
export function formatDueLabel(
  dueAt: string | Date,
  options: { done?: boolean; now?: Date } = {},
): string {
  const now = options.now ?? new Date();
  const due = toDate(dueAt);
  const days = daysFromToday(due, now);
  if (!options.done && due.getTime() < now.getTime()) {
    const late = Math.max(1, -days);
    if (days === 0) return `Overdue since ${formatTime(due)}`;
    return `Overdue by ${late} ${late === 1 ? "day" : "days"}`;
  }
  if (days === 0) return `Due today, ${formatTime(due)}`;
  if (days === 1) return "Due tomorrow";
  const day = fmt({ day: "numeric" }).format(due);
  const month = fmt({ month: "short" }).format(due);
  if (days > 1 && days < 7) {
    const weekday = fmt({ weekday: "short" }).format(due);
    return `Due ${weekday} ${day} ${month}`;
  }
  return `Due ${day} ${month}`;
}

/** "today", "yesterday", "3 days ago", "19 Oct 2026" for past instants. */
export function formatRelativeDay(
  value: string | Date,
  now: Date = new Date(),
): string {
  const days = -daysFromToday(value, now);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 7) return `${days} days ago`;
  return formatDate(value);
}

/** SAST date and time inputs to a UTC ISO string. Time defaults to 23:59. */
export function sastInputToIso(date: string, time?: string): string {
  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm] = (time && time.length >= 4 ? time : "23:59")
    .split(":")
    .map(Number);
  const utc = Date.UTC(y!, m! - 1, d!, hh!, mm!) - SAST_OFFSET_MS;
  return new Date(utc).toISOString();
}

/** "12:34" or "1:02:03" from whole seconds. */
export function formatClock(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const mmss = `${String(m).padStart(h > 0 ? 2 : 1, "0")}:${String(sec).padStart(2, "0")}`;
  return h > 0 ? `${h}:${mmss}` : mmss.padStart(5, "0");
}

/** "12 min 5 s" */
export function formatDuration(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds));
  const m = Math.floor(s / 60);
  return `${m} min ${s % 60} s`;
}
