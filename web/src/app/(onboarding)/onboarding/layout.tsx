import type { Metadata } from "next";
import type { ReactNode } from "react";

import { Wordmark } from "@/components/shell/wordmark";

export const metadata: Metadata = {
  title: "Set up your account",
  robots: { index: false, follow: false },
};

/**
 * Onboarding sits in its own route group so it gets the focused auth-style
 * shell (wordmark, one column, no app navigation) instead of the (app)
 * shell. The URL is still /onboarding, protected by proxy.ts.
 */
export default function OnboardingLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col items-center gap-8 px-4 py-8 sm:pt-16">
      <Wordmark href="/onboarding" />
      <main id="main" className="w-full max-w-md md:max-w-xl">
        {children}
      </main>
    </div>
  );
}
