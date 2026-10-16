import Link from "next/link";

/** Text wordmark until the logo is ported. The dot is the citron accent. */
export function Wordmark() {
  return (
    <Link
      href="/"
      className="inline-flex min-h-11 items-center gap-1.5 rounded-md text-lg font-semibold tracking-tight focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
    >
      <span
        aria-hidden="true"
        className="size-2.5 rounded-full bg-citron-surface ring-1 ring-border"
      />
      Aptiverse
    </Link>
  );
}
