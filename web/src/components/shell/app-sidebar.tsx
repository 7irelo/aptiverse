"use client";

import type { Navigation } from "@/components/shell/nav";
import { NavLink, useIsActive } from "@/components/shell/nav-link";

type AppSidebarProps = {
  navigation: Navigation;
  rootHrefs: readonly string[];
};

/** Section list for the desktop sidebar (lg and up). */
export function AppSidebarNav({ navigation, rootHrefs }: AppSidebarProps) {
  const isActive = useIsActive(rootHrefs);
  return (
    <nav aria-label="Main" className="flex flex-col gap-6">
      {navigation.sections.map((section) => (
        <div key={section.id} className="flex flex-col gap-1">
          <p
            id={`sidebar-${section.id}`}
            className="px-3 text-xs font-medium tracking-wide text-muted-foreground uppercase"
          >
            {section.label}
          </p>
          <ul
            aria-labelledby={`sidebar-${section.id}`}
            className="flex flex-col gap-0.5"
          >
            {section.items.map((item) => (
              <li key={item.id}>
                <NavLink
                  item={item}
                  variant="sidebar"
                  active={isActive(item.href)}
                />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}
