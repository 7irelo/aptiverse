import Link from "next/link";

import { Wordmark } from "@/components/shell/wordmark";

const navLinkClass =
  "inline-flex min-h-11 items-center rounded-md px-3 text-sm font-medium text-muted-foreground hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none";

export function SiteHeader() {
  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-4 py-2">
        <Wordmark />
        <nav aria-label="Main">
          <ul className="flex items-center gap-1">
            <li>
              <Link href="/help" className={navLinkClass}>
                Help
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
