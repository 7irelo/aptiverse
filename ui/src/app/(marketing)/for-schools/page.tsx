"use client";

import { RoleLanding } from "@/components/marketing/RoleLanding";
import SchoolIcon from "@mui/icons-material/School";
import InsightsIcon from "@mui/icons-material/Insights";
import HubIcon from "@mui/icons-material/HubOutlined";
import HandshakeIcon from "@mui/icons-material/HandshakeOutlined";
import LockIcon from "@mui/icons-material/LockOutlined";
import ScheduleIcon from "@mui/icons-material/ScheduleOutlined";


export default function Page() {
  return (
    <RoleLanding
      eyebrow="For schools & districts"
      title="A whole-school lift, calibrated."
      description="Aptiverse delivers university-readiness, learner wellbeing and SBA outcome reporting — alongside teacher tools that actually save time."
      primaryCta={{ label: "Book a school demo", href: "/contact?reason=school" }}
      secondaryCta={{ label: "Pricing", href: "/pricing" }}
      features={[
        { icon: <InsightsIcon />, title: "Whole-school analytics", description: "Year-by-year trends across grades, subjects, and demographics.", accent: "primary" },
        { icon: <SchoolIcon />, title: "University readiness reports", description: "Per-learner readiness, exportable for school marketing and funding.", accent: "info" },
        { icon: <HubIcon />, title: "SSO & SIS integration", description: "Connect to your school management system — no double admin.", accent: "secondary" },
        { icon: <HandshakeIcon />, title: "Bursary partnership pipeline", description: "Surface high-potential learners to bursary funders directly.", accent: "success" },
        { icon: <LockIcon />, title: "POPIA-compliant", description: "Data residency in SA, full audit trails, granular consent flows.", accent: "info" },
        { icon: <ScheduleIcon />, title: "Onboarding in days", description: "Dedicated success manager. Most schools live in under 2 weeks.", accent: "warning" },
      ]}
      outcomeTitle="What partner schools see in year one"
      outcomes={[
        { stat: "+7pp", label: "average matric pass mark uplift" },
        { stat: "3×", label: "more bursary applications submitted" },
        { stat: "−25%", label: "reduction in teacher admin time" },
      ]}
    />
  );
}
