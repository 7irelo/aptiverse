"use client";

import { RoleLanding } from "@/components/marketing/RoleLanding";
import GroupsIcon from "@mui/icons-material/GroupsOutlined";
import SsidChartIcon from "@mui/icons-material/SsidChartOutlined";
import AssignmentIcon from "@mui/icons-material/AssignmentOutlined";
import VerifiedIcon from "@mui/icons-material/VerifiedOutlined";
import TuneIcon from "@mui/icons-material/TuneOutlined";
import HubIcon from "@mui/icons-material/HubOutlined";


export default function Page() {
  return (
    <RoleLanding
      eyebrow="For teachers"
      title="Less marking. Better teaching."
      description="Aptiverse handles the busywork — practice generation, gap analysis, even goal verification — so you can focus on the students who need you."
      primaryCta={{ label: "Talk to sales", href: "/contact?reason=teacher" }}
      secondaryCta={{ label: "See teacher view", href: "/demo" }}
      features={[
        { icon: <SsidChartIcon />, title: "Class-wide gap analysis", description: "Spot 'the whole class is stuck on Le Chatelier' before the test, not after.", accent: "primary" },
        { icon: <TuneIcon />, title: "Differentiated assignments", description: "Assign one SBA, get foundation/core/challenge variants automatically.", accent: "secondary" },
        { icon: <AssignmentIcon />, title: "AI-assisted marking", description: "Rubric-based pre-grade for essays — you do the moderation, not the bulk.", accent: "info" },
        { icon: <VerifiedIcon />, title: "One-click goal verification", description: "Did Sarah meet her 70% goal? Yes/No. Done.", accent: "primary" },
        { icon: <HubIcon />, title: "Realtime engagement view", description: "See who's working, who's stuck, and who needs a check-in.", accent: "warning" },
        { icon: <GroupsIcon />, title: "Cross-class collaboration", description: "Share lesson plans and SBA libraries with colleagues.", accent: "info" },
      ]}
      outcomeTitle="What teachers tell us"
      outcomes={[
        { stat: "−6h", label: "less marking & admin per week" },
        { stat: "+18%", label: "improvement on identified gap-areas" },
        { stat: "100%", label: "of struggling students surfaced before test day" },
      ]}
    />
  );
}
