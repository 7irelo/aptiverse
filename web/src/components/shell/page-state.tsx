import {
  CircleAlert,
  Compass,
  Inbox,
  LoaderCircle,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

const icons = {
  loading: LoaderCircle,
  error: CircleAlert,
  empty: Inbox,
  "not-found": Compass,
} satisfies Record<string, LucideIcon>;

type PageStateProps = {
  icon: keyof typeof icons;
  title: string;
  description?: string;
  /** Buttons or links, for example a retry button. */
  children?: ReactNode;
  className?: string;
};

/**
 * Shared layout for loading, empty, error and not-found states, so every
 * route segment shows these consistently.
 */
export function PageState({
  icon,
  title,
  description,
  children,
  className,
}: PageStateProps) {
  const Icon = icons[icon];
  return (
    <div
      role={
        icon === "error" ? "alert" : icon === "loading" ? "status" : undefined
      }
      className={cn(
        "flex flex-col items-center gap-3 rounded-lg border bg-card px-4 py-10 text-center text-card-foreground",
        className,
      )}
    >
      <Icon
        aria-hidden="true"
        className={cn(
          "size-8",
          icon === "error" ? "text-error" : "text-muted-foreground",
          icon === "loading" && "animate-spin motion-reduce:animate-none",
        )}
      />
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      {description ? (
        <p className="max-w-prose text-base text-muted-foreground">
          {description}
        </p>
      ) : null}
      {children ? (
        <div className="mt-2 flex flex-wrap justify-center gap-2">
          {children}
        </div>
      ) : null}
    </div>
  );
}
