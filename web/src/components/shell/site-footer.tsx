import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t bg-background">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-2 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>Aptiverse. Study support for school and university students.</p>
        <nav aria-label="Footer">
          <Link
            href="/help"
            className="inline-flex min-h-11 items-center rounded-md underline-offset-4 hover:text-foreground hover:underline focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
          >
            Help and FAQs
          </Link>
        </nav>
      </div>
    </footer>
  );
}
