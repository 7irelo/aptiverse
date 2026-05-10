"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Link from "next/link";
import { Section } from "@/components/common/Section";
import { GradientBackdrop } from "@/components/common/GradientBackdrop";
import { FeatureCard } from "@/components/common/FeatureCard";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import InsightsIcon from "@mui/icons-material/Insights";
import EmojiEventsIcon from "@mui/icons-material/EmojiEventsOutlined";
import PsychologyIcon from "@mui/icons-material/PsychologyOutlined";
import GroupIcon from "@mui/icons-material/GroupsOutlined";
import EventNoteIcon from "@mui/icons-material/EventNoteOutlined";
import TimelineIcon from "@mui/icons-material/Timeline";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonthOutlined";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivismOutlined";
import FavoriteIcon from "@mui/icons-material/FavoriteBorder";
import MenuBookIcon from "@mui/icons-material/MenuBookOutlined";
import SmartToyIcon from "@mui/icons-material/SmartToyOutlined";
import SchoolIcon from "@mui/icons-material/School";


export default function FeaturesPage() {
  return (
    <>
      <GradientBackdrop variant="soft">
        <Box sx={{ maxWidth: 1240, mx: "auto", px: { xs: 2.5, sm: 4, lg: 6 }, py: { xs: 8, md: 12 } }}>
          <Stack spacing={2} sx={{ maxWidth: 760 }}>
            <Typography variant="overline" color="primary.main">
              The full toolkit
            </Typography>
            <Typography variant="h1" component="h1">
              Everything you need to grow into matric — and beyond.
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400 }}>
              No silo apps. No toxic comparisons. One platform that connects your study to your future.
            </Typography>
            <Stack direction="row" spacing={1.5} sx={{ pt: 2 }}>
              <Button component={Link} href="/register" variant="contained" size="large">
                Start free
              </Button>
              <Button component={Link} href="/demo" variant="outlined" size="large">
                Book a demo
              </Button>
            </Stack>
          </Stack>
        </Box>
      </GradientBackdrop>

      <Section eyebrow="Academic core" title="Plan, practise, prove it" subtitle="The cycle that turns SBAs from anxiety into momentum.">
        <Grid container spacing={3}>
          {ACADEMIC.map((f) => (
            <Grid key={f.title} size={{ xs: 12, sm: 6, md: 4 }}>
              <FeatureCard {...f} />
            </Grid>
          ))}
        </Grid>
      </Section>

      <Section bg="paper" eyebrow="Wellbeing" title="Mental health woven through" subtitle="The platform itself watches for stress, and gives you tools — not just numbers.">
        <Grid container spacing={3}>
          {WELLBEING.map((f) => (
            <Grid key={f.title} size={{ xs: 12, sm: 6, md: 4 }}>
              <FeatureCard {...f} />
            </Grid>
          ))}
        </Grid>
      </Section>

      <Section eyebrow="Future-ready" title="University & career navigation" subtitle="Demystifying what comes after matric.">
        <Grid container spacing={3}>
          {FUTURE.map((f) => (
            <Grid key={f.title} size={{ xs: 12, sm: 6, md: 4 }}>
              <FeatureCard {...f} />
            </Grid>
          ))}
        </Grid>
      </Section>

      <Section bg="paper" eyebrow="Community" title="Learn together" subtitle="Peer learning is the most underrated tool in matric.">
        <Grid container spacing={3}>
          {COMMUNITY.map((f) => (
            <Grid key={f.title} size={{ xs: 12, sm: 6, md: 4 }}>
              <FeatureCard {...f} />
            </Grid>
          ))}
        </Grid>
      </Section>
    </>
  );
}

const ACADEMIC = [
  { icon: <SchoolIcon />, title: "SBA capture & planning", description: "Add upcoming SBAs once. AI maps a balanced study lead-up.", accent: "primary" as const },
  { icon: <AutoAwesomeIcon />, title: "AI practice tests", description: "Generated against your weakest topics — including past papers.", accent: "secondary" as const },
  { icon: <InsightsIcon />, title: "Predictive mastery", description: "Term-over-term strength tracking with next-term forecasts.", accent: "info" as const },
  { icon: <TimelineIcon />, title: "Learning journey map", description: "A landmark-based visual of your growth — gamified, not ranked.", accent: "primary" as const },
  { icon: <SmartToyIcon />, title: "AI tutor (chatbot)", description: "Patient, exam-aware. Explain like I'm 14, or drill me on chain rule.", accent: "secondary" as const },
  { icon: <MenuBookIcon />, title: "Catch-up modules", description: "Foundations: 'Algebra for Physics', 'Grammar for Essays'.", accent: "info" as const },
];

const WELLBEING = [
  { icon: <FavoriteIcon />, title: "Daily mood check-in", description: "60 seconds. The AI watches for stress trends and offers help early.", accent: "secondary" as const },
  { icon: <PsychologyIcon />, title: "In-app psychologist", description: "Connect with verified counsellors when you need to talk it out.", accent: "primary" as const },
  { icon: <span>🌬️</span>, title: "'Take a break' moments", description: "Breathing, mindfulness, a funny clip — without leaving the app.", accent: "info" as const },
  { icon: <span>📓</span>, title: "Reflective diary", description: "Prompts for gratitude, gripes, wins. Private by default.", accent: "secondary" as const },
  { icon: <span>📚</span>, title: "Stories of struggle", description: "South African role models who failed before they soared.", accent: "warning" as const },
  { icon: <EventNoteIcon />, title: "Healthy goal-setting", description: "Goals calibrated to your history — never punishing, always reachable.", accent: "primary" as const },
];

const FUTURE = [
  { icon: <SchoolIcon />, title: "University navigator", description: "What does a BCom actually lead to? We explain.", accent: "primary" as const },
  { icon: <VolunteerActivismIcon />, title: "Bursary navigator", description: "NSFAS & private bursaries with deadlines and document checklists.", accent: "success" as const },
  { icon: <CalendarMonthIcon />, title: "APS calculator", description: "Live APS tracking against your dream course's cutoff.", accent: "info" as const },
  { icon: <EmojiEventsIcon />, title: "Career match", description: "Performance + interests → realistic, surprising career suggestions.", accent: "warning" as const },
  { icon: <span>💸</span>, title: "Financial literacy basics", description: "Loans, budgeting, cost of living — built for first-time managers of money.", accent: "info" as const },
  { icon: <span>🎯</span>, title: "Dream-course planner", description: "Where you are now → where you want to be. Long-term strategies, monitored.", accent: "primary" as const },
];

const COMMUNITY = [
  { icon: <GroupIcon />, title: "Study groups", description: "Small virtual rooms with shared notes and scheduled sessions.", accent: "primary" as const },
  { icon: <span>🗣️</span>, title: "Explain it to me", description: "Record a concept explanation — solidify your own understanding while helping others.", accent: "secondary" as const },
  { icon: <span>📅</span>, title: "Calendar integration", description: "Push schedules and reminders to Google Calendar or Outlook.", accent: "info" as const },
  { icon: <GroupIcon />, title: "Verified tutors", description: "Background-checked tutors with public ratings and clear credentials.", accent: "warning" as const },
  { icon: <span>🏷️</span>, title: "Profile badges", description: "'Resilient Learner', 'Curious Mind', 'Helpful Peer' — soft skills made visible.", accent: "success" as const },
  { icon: <span>👨‍👩‍👧</span>, title: "Family plans", description: "Parents see actionable insights — never just numbers.", accent: "secondary" as const },
];
