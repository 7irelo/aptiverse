"use client";

import { RoleLanding } from "@/components/marketing/RoleLanding";
import StorefrontIcon from "@mui/icons-material/StorefrontOutlined";
import EventAvailableIcon from "@mui/icons-material/EventAvailableOutlined";
import PaymentsIcon from "@mui/icons-material/PaymentsOutlined";
import StarIcon from "@mui/icons-material/StarBorder";
import GroupsIcon from "@mui/icons-material/GroupsOutlined";
import VerifiedIcon from "@mui/icons-material/VerifiedOutlined";


export default function Page() {
  return (
    <RoleLanding
      eyebrow="For tutors"
      title="Teach more. Hustle less."
      description="Sell courses, run sessions, and build your reputation on a marketplace that brings you motivated, matched students."
      primaryCta={{ label: "Apply as a tutor", href: "/register?role=tutor" }}
      secondaryCta={{ label: "How it works", href: "/features" }}
      features={[
        { icon: <StorefrontIcon />, title: "Course marketplace", description: "Sell on-demand courses (curriculum-aligned) with one-time pricing.", accent: "primary" },
        { icon: <EventAvailableIcon />, title: "Smart booking", description: "Match with students by subject, level and timezone. Calendar synced.", accent: "secondary" },
        { icon: <PaymentsIcon />, title: "Instant payouts", description: "Stripe-powered earnings dashboard with weekly payouts.", accent: "info" },
        { icon: <StarIcon />, title: "Reputation that compounds", description: "Verified reviews and an objective performance score.", accent: "warning" },
        { icon: <GroupsIcon />, title: "Group & 1:1 sessions", description: "Run masterclasses for 50, or quiet 1:1 deep-dives.", accent: "primary" },
        { icon: <VerifiedIcon />, title: "Verified tutor badge", description: "Background check + reference verification — trust by default.", accent: "success" },
      ]}
      outcomeTitle="Top tutor metrics"
      outcomes={[
        { stat: "R28k", label: "average top-quartile monthly earnings" },
        { stat: "4.8★", label: "average rating across the marketplace" },
        { stat: "<24h", label: "median time from listing to first booking" },
      ]}
    />
  );
}
