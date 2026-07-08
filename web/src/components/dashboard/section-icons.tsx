// Section-level icons for the collapsible rail. When our nav `section -> items`
// data is turned into Euphoria's clickable tree, each multi-item section
// becomes a top-level opener and needs its own icon (the collapsed rail shows
// only icons). Falls back to the first child's icon, then a folder.
import FolderIcon from "@mui/icons-material/FolderOutlined";
import HomeIcon from "@mui/icons-material/HomeOutlined";
import SchoolIcon from "@mui/icons-material/SchoolOutlined";
import FavoriteIcon from "@mui/icons-material/FavoriteBorder";
import LightbulbIcon from "@mui/icons-material/LightbulbOutlined";
import GroupsIcon from "@mui/icons-material/GroupsOutlined";
import SettingsIcon from "@mui/icons-material/SettingsOutlined";
import InsightsIcon from "@mui/icons-material/Insights";
import ChildCareIcon from "@mui/icons-material/ChildCareOutlined";
import ForumIcon from "@mui/icons-material/ForumOutlined";
import PaymentsIcon from "@mui/icons-material/PaymentsOutlined";
import TuneIcon from "@mui/icons-material/TuneOutlined";
import type { NavIcon } from "./nav-icons";

const SECTION_ICONS: Record<string, NavIcon> = {
  Today: HomeIcon,
  Learning: SchoolIcon,
  Wellbeing: FavoriteIcon,
  Future: LightbulbIcon,
  Community: GroupsIcon,
  Account: SettingsIcon,
  Overview: InsightsIcon,
  Classes: GroupsIcon,
  Family: ChildCareIcon,
  School: SchoolIcon,
  Teaching: SchoolIcon,
  "Users & schools": GroupsIcon,
  Content: ForumIcon,
  Money: PaymentsIcon,
  Platform: TuneIcon,
};

export function iconForSection(heading: string, fallback?: NavIcon): NavIcon {
  return SECTION_ICONS[heading] ?? fallback ?? FolderIcon;
}
