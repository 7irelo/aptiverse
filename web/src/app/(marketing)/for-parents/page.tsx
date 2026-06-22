"use client";

import { RoleLanding } from "@/components/marketing/RoleLanding";
import FavoriteIcon from "@mui/icons-material/FavoriteBorder";
import CelebrationIcon from "@mui/icons-material/CelebrationOutlined";
import InsightsIcon from "@mui/icons-material/Insights";
import VisibilityIcon from "@mui/icons-material/VisibilityOutlined";
import HandshakeIcon from "@mui/icons-material/HandshakeOutlined";
import LightbulbIcon from "@mui/icons-material/LightbulbOutlined";


export default function Page() {
  return (
    <RoleLanding
      eyebrow="For parents & guardians"
      title="Support without surveillance."
      description="See how your child is really doing — academically and emotionally — and get plain-language suggestions for how to help, not hover."
      primaryCta={{ label: "Family plan — coming soon", disabled: true }}
      secondaryCta={{ label: "See pricing", href: "/pricing" }}
      features={[
        { icon: <LightbulbIcon />, title: "How can I help? dashboard", description: "Actionable suggestions: 'Your child is stuck on Equilibrium — here are 3 things you can do at home.'", accent: "primary" },
        { icon: <CelebrationIcon />, title: "Celebration alerts", description: "Streaks, completed goals, kind reviews from peers — never just bad news.", accent: "secondary" },
        { icon: <VisibilityIcon />, title: "Realtime activity (with consent)", description: "See if your child is actively studying, in a session, or done for the day.", accent: "info" },
        { icon: <FavoriteIcon />, title: "Wellbeing summary", description: "Weekly mood trend (always anonymised content), with a flag if stress is rising.", accent: "secondary" },
        { icon: <InsightsIcon />, title: "Predictive readiness", description: "University and bursary readiness scores so you can plan together calmly.", accent: "info" },
        { icon: <HandshakeIcon />, title: "1 free counselling session / quarter", description: "Sometimes you need to talk to a professional too. We make it easy.", accent: "warning" },
      ]}
      outcomeTitle="What families tell us"
      outcomes={[
        { stat: "92%", label: "say conversations at home got more productive" },
        { stat: "−40%", label: "reduction in 'how was school?' arguments (yes really)" },
        { stat: "1.4×", label: "more goal completions when parents are involved" },
      ]}
    />
  );
}
