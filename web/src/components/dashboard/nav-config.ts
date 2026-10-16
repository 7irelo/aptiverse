import HomeIcon from "@mui/icons-material/HomeOutlined";
import MenuBookIcon from "@mui/icons-material/MenuBookOutlined";
import AssignmentIcon from "@mui/icons-material/AssignmentOutlined";
import FlagIcon from "@mui/icons-material/FlagOutlined";
import QuizIcon from "@mui/icons-material/QuizOutlined";
import InsightsIcon from "@mui/icons-material/Insights";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesomeOutlined";
import GroupsIcon from "@mui/icons-material/GroupsOutlined";
import EventNoteIcon from "@mui/icons-material/EventNoteOutlined";
import FavoriteIcon from "@mui/icons-material/FavoriteBorder";
import RouteIcon from "@mui/icons-material/RouteOutlined";
import EmojiEventsIcon from "@mui/icons-material/EmojiEventsOutlined";
import ForumIcon from "@mui/icons-material/ForumOutlined";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonthOutlined";
import NotificationsIcon from "@mui/icons-material/NotificationsNoneOutlined";
import SettingsIcon from "@mui/icons-material/SettingsOutlined";
import SchoolIcon from "@mui/icons-material/SchoolOutlined";
import BadgeIcon from "@mui/icons-material/BadgeOutlined";
import PsychologyIcon from "@mui/icons-material/PsychologyOutlined";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivismOutlined";
import SsidChartIcon from "@mui/icons-material/SsidChartOutlined";
import VerifiedIcon from "@mui/icons-material/VerifiedOutlined";
import TuneIcon from "@mui/icons-material/TuneOutlined";
import ChildCareIcon from "@mui/icons-material/ChildCareOutlined";
import HubIcon from "@mui/icons-material/HubOutlined";
import PaymentsIcon from "@mui/icons-material/PaymentsOutlined";
import AnalyticsIcon from "@mui/icons-material/AnalyticsOutlined";
import LightbulbIcon from "@mui/icons-material/LightbulbOutlined";
import LocalLibraryIcon from "@mui/icons-material/LocalLibraryOutlined";
import CelebrationIcon from "@mui/icons-material/CelebrationOutlined";
import WorkspacesIcon from "@mui/icons-material/WorkspacesOutlined";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import ExploreIcon from "@mui/icons-material/ExploreOutlined";
import DescriptionIcon from "@mui/icons-material/DescriptionOutlined";
import CampaignIcon from "@mui/icons-material/CampaignOutlined";
import { Gift as GiftLucide, HandCoins as HandCoinsLucide, Wallet as WalletLucide } from "lucide-react";
import { navIcon } from "./lucide-nav-icon";
import type { Role } from "@/providers/RoleProvider";

// New entries use Lucide via the adapter. The MUI imports above are the
// existing set and are being replaced separately; nothing here adds to them.
const ReferIcon = navIcon(GiftLucide);
const AffiliateAdminIcon = navIcon(HandCoinsLucide);
const WalletIcon = navIcon(WalletLucide);

export type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ fontSize?: "small" | "medium" | "large" }>;
  badge?: string | number;
};

export type NavSection = {
  heading: string;
  items: NavItem[];
};

export const STUDENT_NAV: NavSection[] = [
  {
    heading: "Overview",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: HomeIcon },
      { label: "Workspace", href: "/dashboard/workspace", icon: WorkspacesIcon },
      { label: "AI Tutor", href: "/dashboard/chatbot", icon: AutoAwesomeIcon },
    ],
  },
  {
    heading: "Learning",
    items: [
      { label: "Subjects", href: "/dashboard/subjects", icon: MenuBookIcon },
      { label: "Assessments", href: "/dashboard/assessments", icon: AssignmentIcon },
      { label: "Practice tests", href: "/dashboard/practice", icon: QuizIcon },
      { label: "Past papers", href: "/dashboard/past-papers", icon: LocalLibraryIcon },
      { label: "Mastery", href: "/dashboard/mastery", icon: InsightsIcon },
      { label: "Goals", href: "/dashboard/goals", icon: FlagIcon },
      { label: "Journey map", href: "/dashboard/journey", icon: RouteIcon },
    ],
  },
  {
    heading: "Wellbeing",
    items: [
      { label: "Diary", href: "/dashboard/diary", icon: EventNoteIcon },
      { label: "Wellbeing", href: "/dashboard/wellbeing", icon: FavoriteIcon },
      { label: "Talk to a psychologist", href: "/dashboard/psychologist", icon: PsychologyIcon },
    ],
  },
  {
    heading: "Future",
    items: [
      { label: "Career navigator", href: "/dashboard/career", icon: LightbulbIcon },
    ],
  },
  {
    heading: "Community",
    items: [
      { label: "Find a tutor", href: "/dashboard/tutors", icon: GroupsIcon },
      { label: "My tutor requests", href: "/dashboard/tutors/listings", icon: CampaignIcon },
      { label: "Study groups", href: "/dashboard/study-groups", icon: ForumIcon },
      { label: "Rewards", href: "/dashboard/rewards", icon: EmojiEventsIcon },
    ],
  },
  {
    heading: "Account",
    items: [
      { label: "Calendar", href: "/dashboard/calendar", icon: CalendarMonthIcon },
      { label: "Notifications", href: "/dashboard/notifications", icon: NotificationsIcon },
      { label: "Refer and earn", href: "/refer", icon: ReferIcon },
      { label: "Billing", href: "/dashboard/billing", icon: PaymentsIcon },
      { label: "Settings", href: "/dashboard/settings", icon: SettingsIcon },
      { label: "Help", href: "/dashboard/help", icon: HelpOutlineIcon },
    ],
  },
];

export const TEACHER_NAV: NavSection[] = [
  {
    heading: "Overview",
    items: [
      { label: "Dashboard", href: "/teacher", icon: HomeIcon },
      { label: "Live activity", href: "/teacher/live", icon: HubIcon, badge: "Live" },
      { label: "Analytics", href: "/teacher/analytics", icon: AnalyticsIcon },
    ],
  },
  {
    heading: "Classes",
    items: [
      { label: "Classes", href: "/teacher/classes", icon: GroupsIcon },
      { label: "Students", href: "/teacher/students", icon: SchoolIcon },
      { label: "Assignments", href: "/teacher/assignments", icon: AssignmentIcon },
      { label: "Differentiator", href: "/teacher/differentiator", icon: TuneIcon },
      { label: "Gap analysis", href: "/teacher/gap-analysis", icon: SsidChartIcon },
      { label: "Goal verifications", href: "/teacher/verifications", icon: VerifiedIcon },
    ],
  },
  {
    heading: "Account",
    items: [
      { label: "Calendar", href: "/teacher/calendar", icon: CalendarMonthIcon },
      { label: "Settings", href: "/teacher/settings", icon: SettingsIcon },
    ],
  },
];

export const PARENT_NAV: NavSection[] = [
  {
    heading: "Overview",
    items: [
      { label: "Dashboard", href: "/parent", icon: HomeIcon },
      { label: "Students", href: "/parent/students", icon: ChildCareIcon },
    ],
  },
  {
    heading: "Insights",
    items: [
      { label: "Wellbeing", href: "/parent/wellbeing", icon: FavoriteIcon },
      { label: "Celebrations", href: "/parent/celebrations", icon: CelebrationIcon },
      { label: "How can I help?", href: "/parent/help", icon: LightbulbIcon },
    ],
  },
  {
    heading: "Account",
    items: [
      { label: "Refer and earn", href: "/refer", icon: ReferIcon },
      { label: "Billing", href: "/parent/billing", icon: PaymentsIcon },
      { label: "Settings", href: "/parent/settings", icon: SettingsIcon },
    ],
  },
];

export const SCHOOL_ADMIN_NAV: NavSection[] = [
  {
    heading: "Overview",
    items: [
      { label: "Dashboard", href: "/school-admin", icon: HomeIcon },
      { label: "Analytics", href: "/school-admin/analytics", icon: AnalyticsIcon },
      { label: "Readiness report", href: "/school-admin/readiness", icon: InsightsIcon },
    ],
  },
  {
    heading: "School",
    items: [
      { label: "Teachers", href: "/school-admin/teachers", icon: GroupsIcon },
      { label: "Classes", href: "/school-admin/classes", icon: SchoolIcon },
      { label: "Students", href: "/school-admin/students", icon: ChildCareIcon },
    ],
  },
  {
    heading: "Account",
    items: [
      { label: "Settings", href: "/school-admin/settings", icon: SettingsIcon },
    ],
  },
];

export const TUTOR_NAV: NavSection[] = [
  {
    heading: "Overview",
    items: [
      { label: "Dashboard", href: "/tutor", icon: HomeIcon },
    ],
  },
  {
    heading: "Teaching",
    items: [
      { label: "Opportunities", href: "/tutor/opportunities", icon: ExploreIcon },
      { label: "Proposals", href: "/tutor/proposals", icon: DescriptionIcon },
      { label: "My students", href: "/tutor/connections", icon: SchoolIcon },
      { label: "Study groups", href: "/dashboard/study-groups", icon: ForumIcon },
      { label: "Reviews", href: "/tutor/reviews", icon: EmojiEventsIcon },
    ],
  },
  {
    heading: "Account",
    items: [
      { label: "Public profile", href: "/tutor/profile", icon: BadgeIcon },
      { label: "Refer and earn", href: "/refer", icon: ReferIcon },
      { label: "Billing", href: "/tutor/billing", icon: PaymentsIcon },
      { label: "Settings", href: "/tutor/settings", icon: SettingsIcon },
    ],
  },
];

// Affiliate-only accounts. Their whole world is the referral dashboard: the
// link, what they have earned, and where the money should go. No student app,
// no billing of their own, nothing to study. Deliberately small.
export const AFFILIATE_NAV: NavSection[] = [
  {
    heading: "Earn",
    items: [
      { label: "Referrals", href: "/refer", icon: GroupsIcon },
      { label: "Earnings", href: "/refer/earnings", icon: WalletIcon },
      { label: "Payments", href: "/refer/payments", icon: PaymentsIcon },
      { label: "Get paid", href: "/refer/get-paid", icon: VerifiedIcon },
      { label: "Tax statement", href: "/refer/tax", icon: AssignmentIcon },
    ],
  },
];

export const ADMIN_NAV: NavSection[] = [
  {
    heading: "Overview",
    items: [
      { label: "Admin home", href: "/admin", icon: HomeIcon },
      { label: "System health", href: "/admin/system", icon: HubIcon },
      { label: "Audit log", href: "/admin/audit", icon: VerifiedIcon },
    ],
  },
  // Kept in step with NavigationController.AdminNav on the API, which is what
  // actually drives the sidebar for a signed-in admin. Schools, Impersonate,
  // Moderation, Payments & refunds, Invoices, Feature flags and platform
  // Settings are gone along with the pages behind them: each was a facade over
  // data the platform does not hold.
  {
    heading: "People",
    items: [
      { label: "Users", href: "/admin/users", icon: GroupsIcon },
      { label: "School enquiries", href: "/admin/school-enquiries", icon: VolunteerActivismIcon },
      { label: "Tutors", href: "/admin/tutors", icon: GroupsIcon },
    ],
  },
  {
    heading: "Money",
    items: [
      { label: "Subscriptions", href: "/admin/subscriptions", icon: PaymentsIcon },
      { label: "Paystack", href: "/admin/paystack", icon: WalletIcon },
      { label: "Referral programme", href: "/admin/affiliates", icon: AffiliateAdminIcon },
    ],
  },
];

export function navForRole(role: Role): NavSection[] {
  switch (role) {
    case "student":
      return STUDENT_NAV;
    case "teacher":
      return TEACHER_NAV;
    case "parent":
      return PARENT_NAV;
    case "school_admin":
      return SCHOOL_ADMIN_NAV;
    case "tutor":
      return TUTOR_NAV;
    case "affiliate":
      return AFFILIATE_NAV;
    case "admin":
    case "super_admin":
      return ADMIN_NAV;
  }
}
