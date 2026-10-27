"use client";

import { createElement } from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { isActiveHref, type NavItem } from "@/components/shell/nav";
import { resolveNavIcon } from "@/components/shell/nav-icons";
import { cn } from "@/lib/utils";

/** Returns whether an item is the current page. */
export function useIsActive(rootHrefs: readonly string[]) {
  const pathname = usePathname() ?? "";
  return (href: string) => isActiveHref(pathname, href, rootHrefs);
}

type NavLinkProps = {
  item: NavItem;
  active: boolean;
  variant: "sidebar" | "bottom" | "sheet";
  onNavigate?: () => void;
};

const linkBase =
  "outline-none focus-visible:ring-3 focus-visible:ring-ring/50 transition-colors";

/**
 * Renders a registry icon by name. createElement keeps the component type out of a render-time variable,
 * which the React compiler would otherwise treat as a component created during render.
 */
function NavIcon({ name, className }: { name: string; className: string }) {
  return createElement(resolveNavIcon(name), {
    "aria-hidden": true,
    className,
  });
}

/** One navigation link, styled for where it sits. */
export function NavLink({ item, active, variant, onNavigate }: NavLinkProps) {
  const current = active ? ("page" as const) : undefined;

  if (variant === "bottom") {
    return (
      <Link
        href={item.href}
        aria-current={current}
        onClick={onNavigate}
        className={cn(
          linkBase,
          "group flex min-h-16 flex-col items-center justify-center gap-1 rounded-lg px-1 text-xs font-medium",
          active
            ? "text-foreground"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        <span
          className={cn(
            "flex h-7 w-12 items-center justify-center rounded-full",
            active && "bg-citron-surface text-on-citron",
          )}
        >
          <NavIcon name={item.icon} className="size-5" />
        </span>
        <span className="max-w-full truncate">{item.label}</span>
      </Link>
    );
  }

  if (variant === "sheet") {
    return (
      <Link
        href={item.href}
        aria-current={current}
        onClick={onNavigate}
        className={cn(
          linkBase,
          "flex min-h-12 items-center gap-3 rounded-lg px-3 text-base",
          active
            ? "bg-citron-surface font-medium text-on-citron"
            : "hover:bg-muted",
        )}
      >
        <NavIcon name={item.icon} className="size-5 shrink-0" />
        <span className="truncate">{item.label}</span>
      </Link>
    );
  }

  return (
    <Link
      href={item.href}
      aria-current={current}
      onClick={onNavigate}
      className={cn(
        linkBase,
        "flex min-h-10 items-center gap-3 rounded-md px-3 text-sm",
        active
          ? "bg-citron-surface font-medium text-on-citron"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      <NavIcon name={item.icon} className="size-4 shrink-0" />
      <span className="truncate">{item.label}</span>
    </Link>
  );
}
