import type { ReactNode } from "react";

import { Wordmark } from "@/components/shell/wordmark";

/** Placeholder layout for sign in, register, verify and reset (Phase 2). */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-1 flex-col items-center gap-8 px-4 py-10">
      <Wordmark />
      <main id="main" className="w-full max-w-sm">
        {children}
      </main>
    </div>
  );
}
