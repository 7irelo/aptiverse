import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

export const formatDate = (iso: string, fmt = "DD MMM YYYY") => dayjs(iso).format(fmt);
export const formatRelative = (iso: string) => dayjs(iso).fromNow();
export const formatCurrency = (n: number) =>
  new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR", maximumFractionDigits: 0 }).format(n);

export const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");

// Turn a raw study-unit slug ("uct:calculus-i") into something readable
// ("Calculus I"). This is the LAST resort, for when useAcademicUnits().nameFor
// can't resolve an id: a student should never be shown our internal slug.
//
// It lives here because three pages grew their own copy and they disagreed.
// One rendered "Calculus I" and another "Calculus I" for the same course, and
// a third just printed the raw slug. The roman-numeral case is the whole point
// on a tertiary catalogue full of I/II/III courses, so that behaviour wins.
export const prettifyUnitId = (raw: string): string => {
  const tail = raw.includes(":") ? raw.slice(raw.lastIndexOf(":") + 1) : raw;
  return tail
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((w) => (/^[ivx]+$/i.test(w) ? w.toUpperCase() : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(" ");
};

export const minutesToHours = (m: number) => {
  const h = Math.floor(m / 60);
  const r = m % 60;
  if (h === 0) return `${r}m`;
  if (r === 0) return `${h}h`;
  return `${h}h ${r}m`;
};
