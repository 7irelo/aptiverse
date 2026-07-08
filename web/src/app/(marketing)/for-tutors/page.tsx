"use client";

import { RoleLanding } from "@/components/marketing/RoleLanding";
import { IdCard, BadgeCheck, Users, Sparkles, BookOpen, Handshake } from "lucide-react";

export default function ForTutorsPage() {
  return (
    <RoleLanding
      eyebrow="For tutors"
      title="Get found by the families looking for you."
      description="List a profile, show what you teach, and reach students and parents. You keep every arrangement, and every rand, direct."
      primaryCta={{ label: "List your profile free", href: "/register?role=tutor" }}
      secondaryCta={{ label: "See pricing", href: "/pricing" }}
      featuresEyebrow="What you get"
      featuresTitle="A profile that works while you teach"
      features={[
        {
          icon: <IdCard size={18} />,
          title: "A profile that gets found",
          description: "Show your subjects, qualifications, experience, and rates in a clean public profile.",
          accent: "primary",
        },
        {
          icon: <BadgeCheck size={18} />,
          title: "Qualifications up front",
          description: "Put your credentials where students and parents can see them, not buried in a chat.",
          accent: "primary",
        },
        {
          icon: <Users size={18} />,
          title: "Reach students and parents",
          description: "Be discoverable by the families searching for exactly what you teach.",
          accent: "info",
        },
        {
          icon: <Sparkles size={18} />,
          title: "AI lesson prep",
          description: "Generate curriculum-aligned lesson plans and worksheets in minutes, at your students' level.",
          accent: "secondary",
        },
        {
          icon: <BookOpen size={18} />,
          title: "Your own study assistant",
          description: "The same curriculum-aware AI, for your own prep and revision.",
          accent: "secondary",
        },
        {
          icon: <Handshake size={18} />,
          title: "You own the relationship",
          description: "Arrangements and payments happen directly between you and the student. Aptiverse never takes a cut.",
          accent: "success",
        },
      ]}
      closingTitle="List your profile today."
      closingBody="Start free, or upgrade for featured placement and AI tools. Cancel any time."
    />
  );
}
