import type { NavIcon } from "./nav-icons";
import type { NavSection } from "./nav-config";
import { iconForSection } from "./section-icons";

// Euphoria's AppMenu is a recursive tree: items with children are openers, the
// rest are links. Our nav is `section -> items` (two levels), so we lift each
// section to a top-level node and hang its items underneath as children. A
// section with a single item collapses to a plain link (opening a popover for
// one entry is just friction).
export type NavNode = {
  name: string;
  path?: string;
  icon: NavIcon;
  badge?: string | number;
  items?: NavNode[];
};

// Landing pages that must match exactly — otherwise every /dashboard/* route
// would light up the "/dashboard" home item as well.
const ROOT_PATHS = new Set([
  "/dashboard",
  "/teacher",
  "/parent",
  "/school-admin",
  "/tutor",
  "/admin",
  // The affiliate "Referrals" landing. Without this it would stay highlighted
  // on /refer/earnings and the rest, lighting up two nav items at once.
  "/refer",
]);

export function sectionsToTree(sections: NavSection[]): NavNode[] {
  return sections.map((s) => {
    const children: NavNode[] = s.items.map((i) => ({
      name: i.label,
      path: i.href,
      icon: i.icon,
      badge: i.badge,
    }));

    if (children.length <= 1) {
      const only = children[0];
      if (only) return only;
      // Empty section (shouldn't happen) — keep a non-clickable header.
      return { name: s.heading, icon: iconForSection(s.heading) };
    }

    return {
      name: s.heading,
      icon: iconForSection(s.heading, children[0]?.icon),
      items: children,
    };
  });
}

export function isLeafActive(path: string | undefined, pathname: string): boolean {
  if (!path) return false;
  if (pathname === path) return true;
  if (ROOT_PATHS.has(path)) return false;
  return pathname.startsWith(path + "/") || pathname.startsWith(path);
}

// A node is active if it links to the current route or any descendant does.
export function isNodeActive(node: NavNode, pathname: string): boolean {
  if (isLeafActive(node.path, pathname)) return true;
  return (node.items ?? []).some((c) => isNodeActive(c, pathname));
}
