import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Mobile-first content column: 16px gutters at 360px, capped width on desktop. */
export function PageContainer({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn("mx-auto w-full max-w-3xl px-4 py-8 sm:py-12", className)}
    >
      {children}
    </div>
  );
}
