# Aptiverse — Product context

register: product

## Product purpose
Aptiverse is a South African student learning and wellbeing platform. It helps students practice, track their academic progress, and look after their mental wellbeing in one place. The student dashboard is the core surface: the daily home base where a learner practices questions, sees where they stand per subject, plans around assessments, and checks in on how they are doing.

## Users
- **Primary:** students aged roughly 13 to 24. Two cohorts share the app: high-school learners on the CAPS curriculum, and university/tertiary students who define their own subjects. They are on **mobile first**, often studying in short windows (between classes, on transport, late at night), sometimes stressed near exams. They are not power users; they want to know "what should I do next" and "am I on track."
- Secondary roles (parent, teacher, tutor, school-admin) have their own apps and are out of scope for this student redesign.

## Tone and brand
Calm, credible, quietly encouraging. A serious study tool that also cares about the person using it. Confident, not clinical; supportive, not saccharine. Copy is plain South African English, direct, never patronising.

## Anti-references (what this is NOT)
- Not Duolingo-style gamification: no XP bars, streak-shaming, mascots, confetti, or points as the point. Progress is real academic signal, not game currency.
- Not a flashy consumer edtech toy with cartoon illustrations.
- Not a cold enterprise analytics dashboard either: it serves an anxious teenager, not an ops team.

## Strategic principles
- **Real data only.** No fake metrics, no hardcoded numbers. Every figure traces to a real API hook.
- **De-gamified.** Motivation comes from clarity (you have mastered 6 of 9 topics; your next assessment is in 4 days), not from invented rewards.
- **Mobile-first.** Design and verify the phone layout first; desktop is the widened case.
- **Answer "what next".** Every page should make the next useful action obvious.

## Hard rules
No emojis. No em dashes (use commas, colons, periods, parentheses). Lucide icons only. MUI v7 (`Grid`, not `Grid2`). TanStack Query for data (`useX()` hooks in `web/src/lib/api/queries.ts`), never raw fetch in components.
