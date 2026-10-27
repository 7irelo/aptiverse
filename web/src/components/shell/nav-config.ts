import type { NavIconName } from "@/components/shell/nav-icons";
import {
  filterNavigation,
  type Navigation,
  type NavItem,
} from "@/components/shell/nav";
import type { Role, SessionUser } from "@/lib/auth";

/**
 * Static navigation per role, used until the API serves GET /navigation.
 * Routes that do not exist yet arrive in later phases.
 */

type ConfigItem = NavItem & { icon: NavIconName };
type ConfigNavigation = {
  sections: { id: string; label: string; items: ConfigItem[] }[];
  primary: string[];
};

const studentNav: ConfigNavigation = {
  sections: [
    {
      id: "learn",
      label: "Learn",
      items: [
        {
          id: "dashboard",
          label: "Dashboard",
          href: "/dashboard",
          icon: "home",
        },
        {
          id: "subjects",
          label: "Subjects",
          href: "/dashboard/subjects",
          icon: "book-open",
        },
        {
          id: "practice",
          label: "Practice",
          href: "/dashboard/practice",
          icon: "clipboard-check",
        },
        {
          id: "past-papers",
          label: "Past papers",
          href: "/dashboard/past-papers",
          icon: "library-big",
        },
        {
          id: "tutor",
          label: "AI tutor",
          href: "/dashboard/tutor",
          icon: "sparkles",
          entitlement: "ai-tutor",
        },
        {
          id: "progress",
          label: "Progress",
          href: "/dashboard/progress",
          icon: "chart-line",
        },
        { id: "goals", label: "Goals", href: "/dashboard/goals", icon: "flag" },
      ],
    },
    {
      id: "wellbeing",
      label: "Wellbeing",
      items: [
        {
          id: "diary",
          label: "Diary",
          href: "/dashboard/diary",
          icon: "notebook-pen",
        },
        {
          id: "wellbeing",
          label: "Wellbeing",
          href: "/dashboard/wellbeing",
          icon: "heart-handshake",
        },
      ],
    },
    {
      id: "future",
      label: "Future",
      items: [
        {
          id: "careers",
          label: "Careers",
          href: "/dashboard/careers",
          icon: "compass",
        },
      ],
    },
    {
      id: "account",
      label: "Account",
      items: [
        {
          id: "calendar",
          label: "Calendar",
          href: "/dashboard/calendar",
          icon: "calendar",
        },
        {
          id: "notifications",
          label: "Notifications",
          href: "/dashboard/notifications",
          icon: "bell",
        },
        { id: "refer", label: "Refer and earn", href: "/refer", icon: "gift" },
        {
          id: "billing",
          label: "Billing",
          href: "/dashboard/billing",
          icon: "credit-card",
          permission: "billing.manage",
        },
        {
          id: "settings",
          label: "Settings",
          href: "/dashboard/settings",
          icon: "settings",
        },
        { id: "help", label: "Help", href: "/help", icon: "help" },
      ],
    },
  ],
  primary: ["dashboard", "subjects", "practice", "progress"],
};

const parentNav: ConfigNavigation = {
  sections: [
    {
      id: "overview",
      label: "Overview",
      items: [
        { id: "dashboard", label: "Dashboard", href: "/parent", icon: "home" },
        {
          id: "students",
          label: "My students",
          href: "/parent/students",
          icon: "users",
        },
        {
          id: "wellbeing",
          label: "Wellbeing",
          href: "/parent/wellbeing",
          icon: "heart-handshake",
        },
        {
          id: "celebrations",
          label: "Celebrations",
          href: "/parent/celebrations",
          icon: "party-popper",
        },
      ],
    },
    {
      id: "account",
      label: "Account",
      items: [
        { id: "refer", label: "Refer and earn", href: "/refer", icon: "gift" },
        {
          id: "billing",
          label: "Billing",
          href: "/parent/billing",
          icon: "credit-card",
          permission: "billing.manage",
        },
        {
          id: "settings",
          label: "Settings",
          href: "/parent/settings",
          icon: "settings",
        },
        { id: "help", label: "Help", href: "/help", icon: "help" },
      ],
    },
  ],
  primary: ["dashboard", "students", "wellbeing", "celebrations"],
};

const adminNav: ConfigNavigation = {
  sections: [
    {
      id: "operations",
      label: "Operations",
      items: [
        {
          id: "dashboard",
          label: "Dashboard",
          href: "/admin",
          icon: "dashboard",
        },
        {
          id: "users",
          label: "Users",
          href: "/admin/users",
          icon: "users",
          permission: "users.read",
        },
        {
          id: "content",
          label: "Content",
          href: "/admin/content",
          icon: "file-text",
          permission: "content.manage",
        },
        {
          id: "support",
          label: "Support",
          href: "/admin/support",
          icon: "support",
        },
        {
          id: "billing",
          label: "Billing",
          href: "/admin/billing",
          icon: "credit-card",
          permission: "billing.admin",
        },
      ],
    },
    {
      id: "account",
      label: "Account",
      items: [
        {
          id: "settings",
          label: "Settings",
          href: "/admin/settings",
          icon: "settings",
        },
      ],
    },
  ],
  primary: ["dashboard", "users", "content", "support"],
};

export const navByRole: Record<Role, ConfigNavigation> = {
  student: studentNav,
  parent: parentNav,
  admin: adminNav,
};

/** Root pages that should only be marked active on an exact match. */
export const navRootHrefs = ["/dashboard", "/parent", "/admin"] as const;

/**
 * Navigation for a signed-in user. Async on purpose: Phase 2 or later swaps
 * the body for a call to GET /navigation (validated with navigationSchema)
 * and nothing that renders the shell has to change.
 */
export async function getNavigation(user: SessionUser): Promise<Navigation> {
  return filterNavigation(navByRole[user.role], user);
}
