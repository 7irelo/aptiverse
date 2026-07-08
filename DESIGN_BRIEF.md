# Aptiverse Design and Build Brief

A complete brief for designing and building the Aptiverse product from scratch. Hand this to a design-capable Claude session. It is self-contained: it defines the audience, the constraints, the design system, the full page inventory, per-page specifications, cross-cutting patterns, the data model, and the order of work.

---

## 0. How to use this brief

1. Read sections 1 to 5 first. They are the rules of the whole project. Do not deviate from the Hard Constraints (section 3).
2. Build in the order given in section 12 (Sequencing). Start with the design system and the two app shells, then public pages, then auth, then the student app, then the parent app, then payments and analytics.
3. For each page, deliver: the responsive layout (mobile first), all states (loading, empty, error, populated), and real South African student content. Never use placeholder lorem text.
4. Ask for nothing you can decide with good judgment. Where this brief leaves a detail open, choose the option that is simplest for a student on a phone.

---

## 1. What Aptiverse is

Aptiverse is a South African student success platform. It brings a learner's academic life and wellbeing into one calm workspace: coursework and mastery tracking, practice, an AI study assistant, wellbeing and mood support, goals, and career and university planning. Parents get their own connected view of how their children are doing, academically and emotionally.

It is a consumer product for individuals and families, sold on a subscription. It is not a school LMS. There is no school, teacher, or tutor side in this version.

The tone is warm, grounded, and honest. It is a product a parent trusts and a student actually wants to open. It is a startup, so it must never claim scale, testimonials, or partnerships it does not have.

---

## 2. Audience and personas

Two entity types only: **Student** and **Parent**. Plus a small internal **Admin** for the team (section 11).

### Student
Any South African learner from **Grade R through university**. The product adapts to an education stage:

- **Primary** (Grade R to 7): lighter, more guided, often parent-managed. Simple goals, gentle wellbeing, foundational practice.
- **High school** (Grade 8 to 12): the core. CAPS or IEB subjects, School-Based Assessment (SBA) tracking, past papers, predicted results, APS and university readiness, career guidance.
- **University** (year 1 and up): modules and courses rather than school subjects, assignments and exams, GPA-style progress, coursework planning, and career and postgraduate planning.

Design every student feature to be stage-aware. A university student must never see "Grade 11" or "SBA"; a Grade 5 learner must never see "APS" or "matric". Where a feature only makes sense for one stage, hide it for the others rather than showing an empty or wrong version.

### Parent
An adult managing one or more children on the platform. Wants a quick, honest read on each child: are they on track, are they okay, what needs attention. Can hold the subscription and pay. Sees insight, not surveillance: trends and celebrations, not raw private diary content.

### Cross-stage principle
A single family can span stages: one child in Grade 4, one in Grade 11, one at university. The parent view must handle a mixed set of children gracefully.

---

## 3. Hard constraints (do not violate)

1. **Font: keep Frygia.** This is the single immutable brand asset. Use the stack below. Do not substitute a different display or body face.
   ```
   font-family: "Frygia", "Roboto", -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif;
   ```
   Frygia is loaded via a stylesheet link in the document head; Roboto (bundled) is the fallback.
2. **No emojis anywhere.** Not in UI, not in copy, not in seed data. Use Lucide icons for all iconography.
3. **Icons: Lucide (`lucide-react`) only.** Do not use the Material icon set or emoji glyphs. Icons are line icons, consistent stroke, sized in steps (14, 16, 18, 20, 24).
4. **No em dashes** in any copy. Use commas, colons, parentheses, or separate sentences. Avoid the long dash character entirely.
5. **No AI-slop design.** Avoid: warm cream plus serif plus terracotta; a lone acid-green pop on near-black; purple-to-blue gradient heroes; dot-grid or slate-glow backdrops; glassmorphism; everything centered; a rounded pill on every card; numbered eyebrows (01 / 02 / 03) where there is no real sequence; fake testimonials or logo walls.
6. **Mobile first.** Most users are on a phone. Design and verify at ~360px width first, then scale up. Touch targets at least 44px. No horizontal page scroll. Use bottom sheets and drawers instead of hover menus. Data tables must become cards or scroll within their own container on small screens.
7. **Colour scheme follows the operating system only.** There is no in-app light/dark toggle. Support both light and dark, driven by the OS preference, with full parity.
8. **Accessibility.** WCAG AA contrast minimum. Visible keyboard focus on every interactive element. Respect `prefers-reduced-motion`. Label every control and icon-only button.
9. **South African context is real.** Currency is ZAR shown as `R1 234`. Curricula are CAPS or NSC and IEB. Funding includes NSFAS. Universities use APS. Privacy follows POPIA. Payment gateways are South African (PayFast, Paystack, Ozow, or Yoco), not US-only.
10. **Tech stack.** Next.js (App Router, React 19) with MUI v7 and Emotion. Design tokens live in a TypeScript theme, not CSS variables or Tailwind. Deliver components that fit this stack.

---

## 4. Design system

The following system is already implemented in code and is the recommended baseline. Keep it unless you have a clearly stronger, subject-grounded idea; if you refine it, keep the font and the semantic colour-zone discipline.

### 4.1 Colour: "Chalk & Pine"
Warm, grounded, scholarly. Three semantic zones applied with discipline, plus functional accents.

- **Academic (pine), primary:** `#0F6E5C`. Everyday academic UI.
- **Achievement (gold):** `#C0872B`. Earned milestones only. Never decorative.
- **Wellbeing (sage):** `#6E8B78`. Non-academic safe space (mood, diary, counselling). Signals "not graded, not ranked".
- **Attention (clay):** `#C25A44`. Warm "needs work", not punitive red.
- **Destructive (rose):** `#8B4A52`. Genuinely destructive actions only.
- **Success (forest):** `#3D9762`. "Growing well" signals.
- **Ink (text):** `#1B2B27` on light. **Ground:** `#FBFAF6`. Warm, slightly pine-tinted neutrals throughout.
- **Dark mode:** near-black warm ground `#0F1310`, paper `#171C18`, pine lifts to `#72B1A3`, text `#E7EAE3`.

Semantic colour is separate from decoration. Good, warning, and critical states use success, clay, and rose, not the primary hue.

### 4.2 Type
Frygia for everything (display, body, labels). Set a clear scale and stay on it. Headings get tight tracking and `text-wrap: balance`. Body near 65 characters wide. Uppercase labels get letter-spacing. Use `font-variant-numeric: tabular-nums` wherever digits align (stats, tables, currency).

### 4.3 Shape, spacing, elevation
- Radius: 10 for controls, 14 for cards. 999 for pills and progress bars.
- Spacing on an 8px grid; lay out with flex or grid and `gap`, not per-element margins.
- Elevation: cards sit on a soft warm shadow plus a hairline border, not a flat divider-only look and not heavy Material shadows.
- Focus: a soft 3px halo ring in the accent colour, recolouring to rose on invalid fields.

### 4.4 Iconography and motion
- Lucide line icons, consistent stroke.
- Motion is restrained and purposeful: short reveals, hover micro-interactions, a calm page-load sequence on the landing page. Never animate for its own sake. Everything collapses under `prefers-reduced-motion`.

### 4.5 Voice and tone
Warm, plain, specific. Speak to the student ("your"), not about the system. Buttons say exactly what they do. Errors say what went wrong and how to fix it, no apology, no vagueness. Celebrate real achievement, never inflate. No hype, no cliches.

---

## 5. Global patterns

Design these once; reuse everywhere.

- **App shell (student and parent):** top bar (logo, page context, search, notifications, avatar and account menu) plus a primary navigation. On desktop a left sidebar; on mobile a bottom navigation bar of 4 to 5 primary destinations plus a "more" sheet. Solid surfaces, hairline dividers, no glass blur.
- **Public shell (marketing):** sticky top nav (logo, a short set of links, Sign in, Get started, a mobile drawer) and a footer (lean columns of real pages only, plus legal).
- **States:** every data view specifies loading (skeletons, not spinners where possible), empty (a clear next action), error (retry plus plain explanation), and populated.
- **Forms:** labels always visible, inline validation, one primary action, disabled-until-valid where it helps. Sensible mobile keyboards and autofill.
- **Data display:** summary before detail. Encode state in form as well as number (a chip, a coloured stripe, a small trend arrow using a Lucide icon). Charts get an area fill, a faint grid, and an emphasised latest point. Tables collapse to cards on mobile.
- **Notifications:** a bell with unread count, a panel or sheet, and per-type Lucide icons (no emoji).
- **Search:** global search in the top bar (subjects, resources, help, pages).
- **Modals and sheets:** center-screen dialogs on desktop, bottom sheets on mobile.
- **Skeleton of stage-awareness:** a single helper decides the current stage (primary, high school, university) and drives which modules, labels, and metrics appear.

---

## 6. Information architecture (full sitemap)

### Public (marketing)
- Home / landing
- Features (overview, with real interactive mini-demos)
- For students
- For parents
- Pricing
- Universities and careers (informational)
- About
- Contact
- Help centre (public articles)
- Legal: Privacy (POPIA), Terms

### Auth and onboarding
- Sign up (students and parents)
- Log in
- Forgot password
- Reset password
- Verify email
- Onboarding (stage and profile setup for students; child linking for parents)

### Student app
- Dashboard (overview)
- Subjects and courses (stage-aware)
- Subject detail
- Mastery and progress (analytics)
- Practice (adaptive)
- Practice session
- Assessments and assignments (SBA for school, coursework for university)
- Past papers and resources (school stages)
- Study planner and calendar
- Study groups
- AI study assistant (chat)
- Wellbeing and mood check-in
- Diary (private, encrypted)
- Counselling and support
- Goals
- Career and university planner
- Rewards and achievements
- Notifications
- Billing and subscription
- Settings and profile
- Help and support

### Parent app
- Dashboard (all children overview)
- Children (list)
- Child detail (per-child academics and wellbeing)
- Live activity
- Wellbeing insights (per child)
- Celebrations
- Billing and payments
- Notifications
- Settings and profile
- Help and support

### Payments and billing
- Plans and pricing selection
- Checkout and subscription
- Billing management (plan, payment method, invoices, receipts)

### Internal admin (team only, section 11)
- Admin dashboard
- Users
- Subscriptions and payments
- Content and moderation
- Feature flags and system

---

## 7. Public pages (specifications)

**Home / landing.** A thesis hero: one clear headline (the student success platform for South African high school and university), a short honest subhead, one primary CTA (Start free) and one secondary (See how it works), and a real product preview (a calm dashboard mock, not a screenshot wall). Below: three to five feature bands, each with a small live mini-demo (AI tutor chat, mastery forecast, wellbeing check-in) built as real interactive components. A parents band. A pricing teaser. An honest closing CTA. No fake logos, no testimonials, no "trusted by thousands". Mobile: single column, the preview stacks under the headline.

**Features.** The full feature set grouped by theme (Learn, Practice, Wellbeing, Plan your future). Each feature is a titled block with a real mini-demo or a precise description and a Lucide icon. Stage coverage noted where relevant. One CTA at the end.

**For students.** Speaks directly to a learner. What a day on Aptiverse feels like: check your dashboard, do a 20-minute practice drill, log a mood, chat with the study assistant, see your predicted result climb. Stage examples for high school and university.

**For parents.** Speaks to a parent. What you see and what you do not (insight and trends, not private diary content). Peace of mind, early wellbeing signals, celebrations, one subscription for the family.

**Pricing.** Honest ZAR tiers for individuals and families. A free tier, a student Pro, and a Family plan (multiple children). Monthly and annual toggle. Clear feature comparison table that collapses to stacked cards on mobile. No "contact sales", no school plan.

**Universities and careers.** Informational: APS, university readiness, career pathways, how the planner works.

**About.** Honest startup story, mission, the South African context, the team if real. No inflated milestones.

**Contact.** A simple form (name, email, reason, message) and direct contact details. No "book a demo".

**Help centre (public).** Searchable articles grouped by topic. Getting started, account, billing, features, privacy.

**Legal.** Privacy (POPIA compliant, plain language) and Terms. Readable, well-typeset long-form.

---

## 8. Auth and onboarding

Keep auth pages to their actual job: identity and credentials only. No profile data on the sign-up form.

**Sign up.** Choose Student or Parent, then name, email, password. Continue with Google option. Auto-login on success, then straight into onboarding. Clean split layout on desktop (brand panel plus form), single column on mobile.

**Log in.** Email, password, Continue with Google, forgot-password link. Nothing else.

**Forgot password.** Email input, clear confirmation, no token leakage.

**Reset password.** New password with strength guidance, consistent rules with sign-up.

**Verify email.** Simple confirmation and resend.

**Onboarding (student).** Short, skippable, editable later.
1. Education stage: Primary, High school, or University.
2. Stage-specific: high school asks grade (8 to 12) and curriculum (NSC or IEB) and school (optional); university asks institution, year of study, and programme; primary asks grade (R to 7) and school (optional).
3. A couple of goals or subjects to personalise the first dashboard.

**Onboarding (parent).** Link a child by invite or by creating a child profile (name, stage). Support adding several. Explain what the parent will and will not see.

---

## 9. Student app (specifications)

Design each screen mobile first, stage-aware, with all states.

**Dashboard.** The calm morning view. Top: a greeting and today's focus. Then: current mastery or progress summary, next best action (a specific practice or task), upcoming deadlines, a wellbeing nudge, streak and rewards, and a shortcut to the AI study assistant. Everything is a card that reads at a glance. University students see modules and GPA-style progress; school students see subjects and predicted results; primary sees a simpler, friendlier set.

**Subjects and courses.** The learner's enrolled subjects (school) or modules (university), each with a mastery ring or progress bar, next topic, and quick actions. Add or edit subjects. Empty state guides first setup.

**Subject detail.** Topic breakdown, mastery per topic, resources, past papers (school), assignments, a "practice this" action, and progress over time.

**Mastery and progress (analytics).** The student's own analytics. Mastery trend over the term, per-subject strengths and gaps, predicted result (school) or GPA projection (university), time on task, and a plain-language "what to do next". Charts with area fills and emphasised latest points. This is a hero analytics page; make it genuinely useful and honest.

**Practice (adaptive).** Choose a subject and topic, or accept the recommended drill. A focused practice session UI: one question at a time, clear progress, instant feedback, a calm result summary that updates mastery. Timed and untimed modes.

**Assessments and assignments.** School: SBA and Programme of Assessment tracking (tasks, weights, due dates, marks). University: assignments, coursework, exams. A calendar and list view. Add a task, log a mark, see weighting toward the final result.

**Past papers and resources (school stages).** Browsable, filterable by subject, grade, year, and paper. Download or practice. University stage shows course resources instead.

**Study planner and calendar.** A weekly and monthly plan blending deadlines, practice, and wellbeing. Drag or tap to schedule. Sync to external calendar.

**Study groups.** Lightweight peer groups: create or join, shared goals, a simple feed. Safe and moderated. Optional for v1; if included, keep it small.

**AI study assistant (chat).** A subject-aware conversational assistant (Claude powered). Streaming responses, message history, subject and topic context, and suggested prompts. It can explain a concept, generate a practice question, or summarise a topic. Clear that it is an aid, not a person. See section 13.

**Wellbeing and mood check-in.** A 60-second check-in with a small set of moods (use Lucide face icons, never emoji), an optional note, and a gentle trend over the week. Surface supportive nudges when stress trends up, and a one-tap route to a break or to counselling. This is the sage wellbeing zone: visually distinct, never graded.

**Diary (private, encrypted).** A reflective journal, clearly private and end-to-end encrypted. Simple entry composer, calm reading view, mood tag. Parents never see contents.

**Counselling and support.** Book or reach a counsellor, crisis resources, and self-help. South African helplines. Handle sensitive content with care and calm.

**Goals.** Set academic and wellbeing goals, track progress, celebrate completion. Link goals to subjects or habits.

**Career and university planner.** School and university stages: interests plus performance to realistic pathways, APS and university readiness (school), postgraduate options (university), and next steps. Grounded in South African labour-market and admissions reality.

**Rewards and achievements.** Earned badges and milestones (gold achievement zone only). Honest, tied to real effort and outcomes. A streak view.

**Notifications.** Grouped, per-type Lucide icons, mark read, deep links. Reminders, deadlines, wellbeing, celebrations.

**Billing and subscription.** Current plan, usage, upgrade or downgrade, payment method, invoices and receipts, cancel. ZAR, South African gateway.

**Settings and profile.** Profile (name, email, stage, grade or year, curriculum or institution, school), appearance note (follows system, no toggle), language (English, isiZulu, Afrikaans, isiXhosa), notifications, privacy (what parents can see, diary encryption), and security (password, sessions).

**Help and support.** Searchable articles plus a support contact and the help bot.

---

## 10. Parent app (specifications)

**Dashboard.** All children at a glance. Per child: on-track status, a wellbeing read, and anything that needs attention. Mixed stages handled cleanly. Quick links into each child.

**Children (list).** Manage linked children, add a child, pending invites.

**Child detail.** One child's academics (subjects or modules, mastery, predicted result, deadlines) and wellbeing (mood trend, engagement), plus celebrations. Insight, not raw private content. Clear boundary messaging about diary privacy.

**Live activity.** A real-time feed of a child's meaningful activity (completed practice, achievements, check-ins), respecting privacy settings.

**Wellbeing insights (per child).** Mood and stress trends, gentle guidance, and when to reach out. Never clinical, never alarmist, always supportive. Route to shared resources.

**Celebrations.** The positive feed: streaks, badges, improvements. Shareable within the family. Lucide icons, no emoji.

**Billing and payments.** The family subscription, payment method, invoices, and per-child seats. ZAR, South African gateway.

**Notifications, Settings, Help.** As per the student app, parent-scoped.

---

## 11. Internal admin (team only, keep lean)

Not a customer surface. A functional internal console: dashboard (key metrics), users (search, view, support actions), subscriptions and payments (status, refunds, dunning), content and moderation (flags, study groups), and feature flags and system health. Same design system, denser tables, still mobile-usable. No decorative flourish.

---

## 12. Payments and billing (detail)

- **Plans selection:** free, student Pro, family. Monthly and annual. ZAR pricing, clear value per tier, no hidden school tier.
- **Checkout:** a South African gateway (PayFast, Paystack, Ozow, or Yoco). Card and instant EFT. Clear totals in ZAR, VAT shown, secure and trustworthy.
- **Billing management:** current plan, change plan, payment method, invoices and receipts (downloadable), cancel with a plain retention-free flow.
- **Family billing:** one subscription, multiple child seats, add or remove a seat.
- Handle failed payments and renewals gracefully with clear, non-alarming messaging.

---

## 13. AI chat and assistants

- **Student study assistant:** Claude powered, subject and topic aware, streaming, with history and suggested prompts. It explains, generates practice, and summarises. Always framed as a study aid. Guardrails for academic honesty (guides, does not simply hand over answers to graded work). Calm chat UI, mobile first, clear input, stop and regenerate, copy.
- **Help bot:** a support and navigation assistant on help surfaces. Answers "how do I" questions and links to the right page. No emoji greeting.
- Show model thinking or sources only where it adds trust. Keep latency handled with streaming and skeletons.

---

## 14. Analytics surfaces (detail)

Two audiences, same care.

- **Student analytics (Mastery and progress):** honest mastery trend, per-subject or per-module strengths and gaps, predicted result or GPA projection, time on task, streak, and a plain next-step recommendation. This is a flagship page; make the data genuinely legible and motivating without inflating.
- **Parent analytics (Child detail and Wellbeing insights):** academic trend and wellbeing trend per child, engagement, and celebrations. Insight framed for a non-expert adult, never surveillance, never clinical.
- Charts: area fills, faint grid, emphasised latest point, tabular-nums, accessible colour and labels, and a text summary alongside every chart.

---

## 15. Data model (so pages carry real content)

Design against these entities. Do not invent a school, teacher, or tutor entity.

- **User:** id, role (student or parent), name, email, education stage (primary, high school, university), and stage fields: grade (R to 12) or study year, curriculum (nsc, ieb) or institution and programme, school (optional), created and updated.
- **Family link:** parent to one or more student children, with per-child privacy settings.
- **Subject or Module:** stage-scoped, with topics, mastery, and progress.
- **Assessment or Assignment:** task, type, weight, due date, mark, and contribution to a predicted result or GPA.
- **Practice session:** subject, topic, questions, score, mastery delta.
- **Wellbeing entry:** mood, note (private), timestamp; aggregated trends visible to parents, raw notes not.
- **Diary entry:** encrypted content, mood tag; never exposed to parents.
- **Goal:** academic or wellbeing, progress, linked entity.
- **Reward or Achievement:** earned milestone, criteria.
- **Notification:** type, message, read state, deep link.
- **Subscription:** plan, seats, status, payment method, invoices.
- **AI conversation:** messages, subject or topic context.

Currency ZAR. Dates and terms in South African academic calendar terms (Term 1 to 4 for school, semesters for university).

---

## 16. Deliverables and sequencing

Build and deliver in this order. Verify each at ~360px before desktop. Every page in light and dark.

1. **Design system:** tokens (colour, type, shape, elevation, focus), core components (buttons, inputs, cards, chips, tabs, tables, sheets, dialogs, navigation), Lucide icon usage, chart primitives, and the two shells (public and app).
2. **Public pages:** home, features, for students, for parents, pricing, universities and careers, about, contact, help, legal.
3. **Auth and onboarding:** sign up, log in, forgot and reset password, verify email, student onboarding, parent onboarding.
4. **Student app:** dashboard first, then subjects and subject detail, mastery analytics, practice and session, assessments, past papers, planner, AI assistant, wellbeing and check-in, diary, counselling, goals, career planner, rewards, notifications, billing, settings, help.
5. **Parent app:** dashboard, children, child detail, live activity, wellbeing insights, celebrations, billing, notifications, settings, help.
6. **Payments:** plans, checkout, billing management, family billing.
7. **Internal admin:** dashboard, users, subscriptions, content and moderation, flags and system.

For each: layout, all states, real content, mobile and desktop, light and dark, accessible, on the design system, Lucide icons, no emoji, no em dashes.

---

## 17. Acceptance checklist (per page)

- Mobile at 360px works with no horizontal scroll and 44px touch targets.
- Light and dark both correct, driven by OS.
- Loading, empty, error, and populated states all designed.
- Real South African student or parent content, ZAR where money appears.
- Lucide icons only, zero emojis, zero em dashes.
- Stage-appropriate (no school terms for university users and the reverse).
- Frygia type scale respected, tabular-nums on aligned digits.
- Keyboard focus visible, controls and icons labelled, AA contrast.
- Copy is warm, plain, specific, and honest. No hype, no fake proof.
