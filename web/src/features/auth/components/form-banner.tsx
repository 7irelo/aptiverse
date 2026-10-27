"use client";

import { CircleAlert, Info } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

import type { FormBanner as FormBannerData } from "../lib/form-state";

/**
 * Form-level message shared by every auth page. Errors are announced
 * (role="alert") and take focus each time a new result arrives, so screen
 * reader and keyboard users land on what went wrong.
 */
export function FormBanner({
  banner,
  version,
  focusOnShow = true,
  className,
}: {
  banner: FormBannerData | undefined;
  /** Changes on every server result; refocuses a repeated message. */
  version?: number;
  /** Move focus to the banner when it appears (off for page-load notices). */
  focusOnShow?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (banner && focusOnShow) ref.current?.focus();
  }, [banner, version, focusOnShow]);

  if (!banner) return null;
  const isError = banner.tone === "error";
  const Icon = isError ? CircleAlert : Info;
  return (
    <div
      ref={ref}
      tabIndex={-1}
      role={isError ? "alert" : "status"}
      className={cn(
        "flex gap-3 rounded-lg border px-4 py-3 text-base outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        isError
          ? "border-error/40 bg-error/10 text-foreground"
          : "border-border bg-muted text-foreground",
        className,
      )}
    >
      <Icon
        aria-hidden="true"
        className={cn(
          "mt-0.5 size-5 shrink-0",
          isError ? "text-error" : "text-muted-foreground",
        )}
      />
      <p>
        {banner.message}
        {banner.link ? (
          <>
            {" "}
            <Link
              href={banner.link.href}
              className="font-medium underline underline-offset-4"
            >
              {banner.link.label}
            </Link>
          </>
        ) : null}
      </p>
    </div>
  );
}
