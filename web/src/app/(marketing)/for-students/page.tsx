"use client";

import { RoleLanding } from "@/components/marketing/RoleLanding";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import EmojiEventsIcon from "@mui/icons-material/EmojiEventsOutlined";
import FavoriteIcon from "@mui/icons-material/FavoriteBorder";
import InsightsIcon from "@mui/icons-material/Insights";
import SmartToyIcon from "@mui/icons-material/SmartToyOutlined";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivismOutlined";


export default function Page() {
  return (
    <RoleLanding
      eyebrow="For students"
      title="Your high school years, on your side."
      description="Aptiverse plans your study, drills your weak spots, and watches your wellbeing — so the only thing you have to do is grow."
      primaryCta={{ label: "Start free", href: "/register" }}
      secondaryCta={{ label: "See features", href: "/features" }}
      features={[
        { icon: <AutoAwesomeIcon />, title: "Practice that matches your SBA", description: "AI generates drills aligned to upcoming tasks — not random questions.", accent: "primary" },
        { icon: <SmartToyIcon />, title: "AI tutor in your pocket", description: "Stuck at 11pm? Ask. The bot won't judge or rush you.", accent: "secondary" },
        { icon: <InsightsIcon />, title: "Predictive mastery", description: "Know which topics will trip you up next term — before they do.", accent: "info" },
        { icon: <FavoriteIcon />, title: "Wellbeing built in", description: "Mood check-ins, breathing breaks, and a private diary.", accent: "secondary" },
        { icon: <VolunteerActivismIcon />, title: "Bursary navigator", description: "NSFAS and private bursaries with deadlines and document checklists.", accent: "success" },
        { icon: <EmojiEventsIcon />, title: "Real rewards for real wins", description: "Free courses, masterclasses, profile badges. Verified by your school.", accent: "warning" },
      ]}
      outcomeTitle="What students see in their first term"
      outcomes={[
        { stat: "+12%", label: "average mastery lift on weak topics" },
        { stat: "5×", label: "more practice questions completed weekly" },
        { stat: "9 / 10", label: "students say it reduces test anxiety" },
      ]}
    />
  );
}
