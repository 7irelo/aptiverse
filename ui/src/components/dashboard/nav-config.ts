import HomeIcon from "@mui/icons-material/HomeOutlined";
import MenuBookIcon from "@mui/icons-material/MenuBookOutlined";
import AssignmentIcon from "@mui/icons-material/AssignmentOutlined";
import FlagIcon from "@mui/icons-material/FlagOutlined";
import QuizIcon from "@mui/icons-material/QuizOutlined";
import InsightsIcon from "@mui/icons-material/Insights";
import SmartToyIcon from "@mui/icons-material/SmartToyOutlined";
import GroupsIcon from "@mui/icons-material/GroupsOutlined";
import StorefrontIcon from "@mui/icons-material/StorefrontOutlined";
import EventNoteIcon from "@mui/icons-material/EventNoteOutlined";
import FavoriteIcon from "@mui/icons-material/FavoriteBorder";
import RouteIcon from "@mui/icons-material/RouteOutlined";
import EmojiEventsIcon from "@mui/icons-material/EmojiEventsOutlined";
import ForumIcon from "@mui/icons-material/ForumOutlined";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonthOutlined";
import NotificationsIcon from "@mui/icons-material/NotificationsNoneOutlined";
import SettingsIcon from "@mui/icons-material/SettingsOutlined";
import SchoolIcon from "@mui/icons-material/SchoolOutlined";
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
import SwapHorizIconNav from "@mui/icons-material/SwapHorizOutlined";
import ForumIconNav from "@mui/icons-material/Forum";
import type { Role } from "@/providers/RoleProvider";

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
    heading: "Today",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: HomeIcon },
      { label: "Workspace", href: "/dashboard/workspace", icon: WorkspacesIcon, badge: "Live" },
      { label: "AI Tutor", href: "/dashboard/chatbot", icon: SmartToyIcon },
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
      { label: "Universities", href: "/dashboard/universities", icon: SchoolIcon },
      { label: "Bursaries", href: "/dashboard/bursaries", icon: VolunteerActivismIcon },
      { label: "Career navigator", href: "/dashboard/career", icon: LightbulbIcon },
    ],
  },
  {
    heading: "Community",
    items: [
      { label: "Tutors", href: "/dashboard/tutors", icon: GroupsIcon },
      { label: "Courses", href: "/dashboard/courses", icon: StorefrontIcon },
      { label: "Study groups", href: "/dashboard/study-groups", icon: ForumIcon },
      { label: "Rewards", href: "/dashboard/rewards", icon: EmojiEventsIcon },
    ],
  },
  {
    heading: "Account",
    items: [
      { label: "Calendar", href: "/dashboard/calendar", icon: CalendarMonthIcon },
      { label: "Notifications", href: "/dashboard/notifications", icon: NotificationsIcon },
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
      { label: "Live activity", href: "/parent/live", icon: HubIcon, badge: "Live" },
    ],
  },
  {
    heading: "Family",
    items: [
      { label: "Children", href: "/parent/children", icon: ChildCareIcon },
      { label: "How can I help?", href: "/parent/help", icon: LightbulbIcon },
      { label: "Celebrations", href: "/parent/celebrations", icon: CelebrationIcon },
      { label: "Wellbeing summary", href: "/parent/wellbeing", icon: FavoriteIcon },
    ],
  },
  {
    heading: "Account",
    items: [
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
      { label: "Bursary partners", href: "/school-admin/bursary-partners", icon: VolunteerActivismIcon },
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
      { label: "Earnings", href: "/tutor/earnings", icon: PaymentsIcon },
    ],
  },
  {
    heading: "Teaching",
    items: [
      { label: "Courses", href: "/tutor/courses", icon: StorefrontIcon },
      { label: "Sessions", href: "/tutor/sessions", icon: CalendarMonthIcon },
      { label: "Students", href: "/tutor/students", icon: SchoolIcon },
      { label: "Reviews", href: "/tutor/reviews", icon: EmojiEventsIcon },
    ],
  },
  {
    heading: "Account",
    items: [
      { label: "Settings", href: "/tutor/settings", icon: SettingsIcon },
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
  {
    heading: "Users & schools",
    items: [
      { label: "Users", href: "/admin/users", icon: GroupsIcon },
      { label: "Schools", href: "/admin/schools", icon: SchoolIcon },
      { label: "Tutors", href: "/admin/tutors", icon: GroupsIcon },
      { label: "Impersonate", href: "/admin/impersonate", icon: SwapHorizIconNav },
    ],
  },
  {
    heading: "Content",
    items: [
      { label: "Courses", href: "/admin/courses", icon: StorefrontIcon },
      { label: "Bursaries", href: "/admin/bursaries", icon: VolunteerActivismIcon },
      { label: "Moderation queue", href: "/admin/moderation", icon: ForumIconNav },
    ],
  },
  {
    heading: "Money",
    items: [
      { label: "Subscriptions", href: "/admin/subscriptions", icon: PaymentsIcon },
      { label: "Payments & refunds", href: "/admin/payments", icon: PaymentsIcon },
      { label: "Invoices", href: "/admin/invoices", icon: AssignmentIcon },
    ],
  },
  {
    heading: "Platform",
    items: [
      { label: "Feature flags", href: "/admin/flags", icon: TuneIcon },
      { label: "Settings", href: "/admin/settings", icon: SettingsIcon },
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
    case "admin":
    case "super_admin":
      return ADMIN_NAV;
  }
}
