import {
  BellRing,
  BookOpen,
  CalendarDays,
  ChartLine,
  CircleHelp,
  ClipboardCheck,
  Compass,
  CreditCard,
  FileText,
  Flag,
  Gift,
  HeartHandshake,
  House,
  LayoutDashboard,
  LibraryBig,
  type LucideIcon,
  MessageCircleQuestion,
  NotebookPen,
  PartyPopper,
  Settings,
  Sparkles,
  UsersRound,
} from "lucide-react";

/**
 * The single swap point between navigation data and icons. Navigation items
 * name an icon with a string (so they can come from GET /navigation as
 * JSON); this registry turns the string into a Lucide component. To add an
 * icon, import it here and give it a kebab-case key.
 */
export const navIcons = {
  home: House,
  dashboard: LayoutDashboard,
  "book-open": BookOpen,
  "clipboard-check": ClipboardCheck,
  "library-big": LibraryBig,
  "chart-line": ChartLine,
  flag: Flag,
  sparkles: Sparkles,
  "notebook-pen": NotebookPen,
  "heart-handshake": HeartHandshake,
  compass: Compass,
  calendar: CalendarDays,
  bell: BellRing,
  gift: Gift,
  "credit-card": CreditCard,
  settings: Settings,
  help: CircleHelp,
  users: UsersRound,
  "party-popper": PartyPopper,
  "file-text": FileText,
  support: MessageCircleQuestion,
} satisfies Record<string, LucideIcon>;

export type NavIconName = keyof typeof navIcons;

/** Unknown names (for example from a newer server config) get a neutral icon. */
const fallbackIcon: LucideIcon = Compass;

export function resolveNavIcon(name: string): LucideIcon {
  return Object.hasOwn(navIcons, name)
    ? navIcons[name as NavIconName]
    : fallbackIcon;
}
