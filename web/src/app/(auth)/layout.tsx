import Link from "next/link";
import type { ReactNode } from "react";

import { Wordmark } from "@/components/shell/wordmark";

/**
 * Auth shell (SHL-02) for log in, sign up, verify email and password reset.
 * Mobile: wordmark, then one centred column with 16px gutters. From `lg:` a
 * brand panel sits on the left (5/12) and the form column on the right.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-1 flex-col lg:grid lg:grid-cols-12">
      <aside className="hidden flex-col justify-between bg-brand-surface p-10 text-on-brand-surface lg:col-span-5 lg:flex">
        <Wordmark />
        <p className="max-w-sm text-2xl font-semibold tracking-tight">
          Study support for South African high school and university students.
        </p>
      </aside>
      <div className="flex flex-1 flex-col items-center gap-8 px-4 py-8 sm:py-12 lg:col-span-7 lg:justify-center">
        <div className="lg:hidden">
          <Wordmark />
        </div>
        <main id="main" className="w-full max-w-sm">
          {children}
        </main>
        <footer className="text-sm text-muted-foreground">
          <Link
            href="/help"
            className="inline-flex min-h-11 items-center rounded-md px-2 underline-offset-4 hover:underline focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
          >
            Help
          </Link>
        </footer>
      </div>
    </div>
  );
}
