/**
 * Navigation model for the signed-in shell.
 *
 * Items are plain data (icons are names, not components) so the same shape
 * can come from the API's GET /navigation later; nav-schema.ts validates
 * that response. Until it exists, nav-config.ts holds a static config.
 *
 * This file has no dependencies so client components can import it.
 */
export type NavItem = {
  id: string;
  label: string;
  href: string;
  /** Key in the icon registry (nav-icons.ts). */
  icon: string;
  /** Hidden unless the user holds this permission. */
  permission?: string;
  /** Hidden unless the user's plan includes this entitlement. */
  entitlement?: string;
};

export type NavSection = {
  id: string;
  label: string;
  items: NavItem[];
};

export type Navigation = {
  sections: NavSection[];
  /**
   * Item ids for the mobile bottom bar, in order. At most four are shown;
   * the fifth slot is always "More" when anything is left over.
   */
  primary: string[];
};

export type NavAccess = {
  permissions: readonly string[];
  entitlements: readonly string[];
};

/** The bottom bar holds five slots at most, including More. */
export const MAX_BOTTOM_ITEMS = 5;

function canSee(item: NavItem, access: NavAccess): boolean {
  if (item.permission && !access.permissions.includes(item.permission)) {
    return false;
  }
  if (item.entitlement && !access.entitlements.includes(item.entitlement)) {
    return false;
  }
  return true;
}

/**
 * Removes items the user may not see and sections left empty. The server
 * will filter too; this keeps the client honest with a static config.
 */
export function filterNavigation(
  navigation: Navigation,
  access: NavAccess,
): Navigation {
  const sections = navigation.sections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => canSee(item, access)),
    }))
    .filter((section) => section.items.length > 0);
  const visible = new Set(
    sections.flatMap((section) => section.items.map((item) => item.id)),
  );
  return {
    sections,
    primary: navigation.primary.filter((id) => visible.has(id)),
  };
}

export type BottomNavModel = {
  /** Items shown directly in the bar. */
  items: NavItem[];
  /** True when a More button is needed for the rest. */
  hasMore: boolean;
};

/**
 * Picks what the mobile bottom bar shows. If everything fits in five slots
 * it is shown directly; otherwise four primary items plus More.
 */
export function bottomNavModel(navigation: Navigation): BottomNavModel {
  const all = navigation.sections.flatMap((section) => section.items);
  if (all.length <= MAX_BOTTOM_ITEMS) return { items: all, hasMore: false };
  const byId = new Map(all.map((item) => [item.id, item]));
  const items = navigation.primary
    .map((id) => byId.get(id))
    .filter((item): item is NavItem => item !== undefined)
    .slice(0, MAX_BOTTOM_ITEMS - 1);
  return { items, hasMore: true };
}

/**
 * True when `href` is the current page or a parent of it. Section roots
 * such as /dashboard only match exactly, so Dashboard is not lit up on
 * every page below it.
 */
export function isActiveHref(
  pathname: string,
  href: string,
  rootHrefs: readonly string[] = [],
): boolean {
  if (pathname === href) return true;
  if (rootHrefs.includes(href)) return false;
  return pathname.startsWith(`${href}/`);
}
