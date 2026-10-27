import type { ReactNode } from "react";

import { PageHeader } from "@/components/shell/page-header";
import { cn } from "@/lib/utils";

const widths = {
  narrow: "max-w-3xl",
  default: "max-w-5xl",
  wide: "max-w-7xl",
} as const;

type PageShellProps = {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  eyebrow?: ReactNode;
  width?: keyof typeof widths;
  children: ReactNode;
  className?: string;
};

/**
 * Standard layout for a page inside the signed-in app: a content column with
 * 16px gutters at 360px, the PageHeader, then the page body.
 */
export function PageShell({
  title,
  description,
  actions,
  eyebrow,
  width = "default",
  children,
  className,
}: PageShellProps) {
  return (
    <div
      className={cn(
        "mx-auto flex w-full flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8",
        widths[width],
        className,
      )}
    >
      <PageHeader
        title={title}
        description={description}
        actions={actions}
        eyebrow={eyebrow}
      />
      {children}
    </div>
  );
}
