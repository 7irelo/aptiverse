// Maps the string icon keys returned by GET /api/navigation to the actual
// icon components. The backend can't serialise React components, so it
// sends stable keys and the registry resolves them here. Unknown keys fall
// back to a neutral dot so a new backend key never renders blank.
import HomeIcon from "@mui/icons-material/HomeOutlined";
import WorkspacesIcon from "@mui/icons-material/WorkspacesOutlined";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesomeOutlined";
import MenuBookIcon from "@mui/icons-material/MenuBookOutlined";
import AssignmentIcon from "@mui/icons-material/AssignmentOutlined";
import QuizIcon from "@mui/icons-material/QuizOutlined";
import LocalLibraryIcon from "@mui/icons-material/LocalLibraryOutlined";
import InsightsIcon from "@mui/icons-material/Insights";
import FlagIcon from "@mui/icons-material/FlagOutlined";
import RouteIcon from "@mui/icons-material/RouteOutlined";
import EventNoteIcon from "@mui/icons-material/EventNoteOutlined";
import FavoriteIcon from "@mui/icons-material/FavoriteBorder";
import PsychologyIcon from "@mui/icons-material/PsychologyOutlined";
import LightbulbIcon from "@mui/icons-material/LightbulbOutlined";
import GroupsIcon from "@mui/icons-material/GroupsOutlined";
import StorefrontIcon from "@mui/icons-material/StorefrontOutlined";
import ForumIcon from "@mui/icons-material/ForumOutlined";
import EmojiEventsIcon from "@mui/icons-material/EmojiEventsOutlined";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonthOutlined";
import NotificationsIcon from "@mui/icons-material/NotificationsNoneOutlined";
import PaymentsIcon from "@mui/icons-material/PaymentsOutlined";
import SettingsIcon from "@mui/icons-material/SettingsOutlined";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import HubIcon from "@mui/icons-material/HubOutlined";
import AnalyticsIcon from "@mui/icons-material/AnalyticsOutlined";
import SchoolIcon from "@mui/icons-material/SchoolOutlined";
import TuneIcon from "@mui/icons-material/TuneOutlined";
import SsidChartIcon from "@mui/icons-material/SsidChartOutlined";
import VerifiedIcon from "@mui/icons-material/VerifiedOutlined";
import ChildCareIcon from "@mui/icons-material/ChildCareOutlined";
import CelebrationIcon from "@mui/icons-material/CelebrationOutlined";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivismOutlined";
import SwapHorizIcon from "@mui/icons-material/SwapHorizOutlined";
import SummarizeIcon from "@mui/icons-material/SummarizeOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import Diversity3Icon from "@mui/icons-material/Diversity3Outlined";
import CircleIcon from "@mui/icons-material/CircleOutlined";
import { Gift as GiftLucide, HandCoins as HandCoinsLucide, Wallet as WalletLucide } from "lucide-react";
import { navIcon } from "./lucide-nav-icon";

export type NavIcon = React.ComponentType<{ fontSize?: "small" | "medium" | "large" }>;

const REGISTRY: Record<string, NavIcon> = {
  home: HomeIcon,
  workspace: WorkspacesIcon,
  ai: AutoAwesomeIcon,
  book: MenuBookIcon,
  assignment: AssignmentIcon,
  quiz: QuizIcon,
  library: LocalLibraryIcon,
  insights: InsightsIcon,
  flag: FlagIcon,
  route: RouteIcon,
  diary: EventNoteIcon,
  heart: FavoriteIcon,
  psychology: PsychologyIcon,
  lightbulb: LightbulbIcon,
  groups: GroupsIcon,
  storefront: StorefrontIcon,
  forum: ForumIcon,
  trophy: EmojiEventsIcon,
  calendar: CalendarMonthIcon,
  bell: NotificationsIcon,
  payments: PaymentsIcon,
  settings: SettingsIcon,
  help: HelpOutlineIcon,
  hub: HubIcon,
  analytics: AnalyticsIcon,
  school: SchoolIcon,
  tune: TuneIcon,
  chart: SsidChartIcon,
  verified: VerifiedIcon,
  child: ChildCareIcon,
  celebration: CelebrationIcon,
  volunteer: VolunteerActivismIcon,
  swap: SwapHorizIcon,
  report: SummarizeIcon,
  profile: PersonOutlineIcon,
  link: Diversity3Icon,
  // New keys use Lucide through the adapter. The MUI entries above are the
  // existing set, being replaced separately.
  refer: navIcon(GiftLucide),
  affiliates: navIcon(HandCoinsLucide),
  wallet: navIcon(WalletLucide),
};

export function iconForKey(key: string): NavIcon {
  return REGISTRY[key] ?? CircleIcon;
}
