import { CircleAlert } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/** An inline error message for a form or action, announced when it appears. */
export function FormAlert({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-2 rounded-lg border border-error/40 bg-card p-3 text-sm",
        className,
      )}
    >
      <CircleAlert
        aria-hidden="true"
        className="mt-0.5 size-4 shrink-0 text-error"
      />
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  );
}
