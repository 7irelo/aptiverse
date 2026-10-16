"use client";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { alpha, useTheme } from "@mui/material/styles";
import { CheckCircle2, Clock, Sparkles, User } from "lucide-react";
import { courseColor } from "@/components/common/chartPalette";
import { MathText } from "@/components/practice/MathText";
import {
  AdChip,
  AdEyebrow,
  AdPanel,
  Artboard,
  CitronBlock,
  Wordmark,
  adPanelBg,
  adSurfaces,
  CITRON,
  GRAPHITE,
  type AdScheme,
} from "./adkit";
import { AERO_MARKS, markAxisLabel } from "./charts";

// =====================================================================
// THREE-SCREEN UNIT. The features page, compressed into one image.
//
// THE COMPOSITION, and why it is this one.
//
// The first attempt at this brief was three windows stacked down the page
// with a caption over each. That is an inventory, not a layout: three
// identical bands, the eye reads straight down, and nothing anywhere says
// which of the three matters. The founder called it correctly.
//
// This is the alternating editorial rhythm the site already uses, in
// components/marketing/FeatureShowcase.tsx: a copy column and a screen
// column, sides swapping every row, vertically centred against each other.
// The reader's eye travels left, right, left, and the zigzag is what carries
// them down a static image with no scroll to do it for them.
//
// THE RUNNING ORDER, and why it is chart, test, tutor.
//
// The chart leads because it is the only row that is evidence rather than a
// capability. Every AI product in this market opens on a chat bubble, and an
// eye that has seen a thousand of them slides straight off the next one. A
// line of somebody's own marks with one course falling off a cliff in April
// is not a thing a first-year has seen a thousand times, and recognition is
// what stops a scroll. The test follows because it is the response to the
// problem the chart just posed, and it drills the very course the chart
// shows dropping: Chemistry falls 65, 48, 51 in the window above, and the
// window below is a Chemistry stoichiometry question. The red countdown is
// also the most arresting object in the set, which keeps the eye moving
// down rather than away. The tutor closes because it is the warmest of the three: ending on
// something that already knows the course beats ending on a clock.
//
// THE SCREEN LEADS EACH ROW, not the copy. Row one is screen left, copy
// right, and the zigzag inverts from there. In a left-to-right reading order
// that lands the picture before the sentence, which is what a scroll-stopper
// wants: the chart has to do its work before any words are read. It was
// drawn both ways; copy-first made the top of the artboard a paragraph, and
// a paragraph is not a hook.
//
// Four things keep it from flattening back into three rows of stuff:
//
//   1. THE ROWS ARE NOT EQUAL. Row one is the tallest and carries the only
//      44px heading; rows two and three step down to 36. The hook gets the
//      room because the chart is the element that actually needed it: a
//      0-100 domain is only honest if it has the height to be read at. Rows
//      two and three are not equal to each other either, and which is taller
//      is decided by what its screen has to hold: the test needs a
//      countdown panel, a topic chip and four full-size options, so it took
//      the room the two chat bubbles did not need. On the tightest cut, the
//      1080x1350, it is in fact the tallest row on the artboard: the founder
//      asked for the test window to grow as much as it needed and for the
//      other two to pay for it, so the hierarchy there is carried by the
//      44px heading and the lead position rather than by height.
//   2. THE SPLIT MOVES. Every row has its own ratio, and the chart row takes
//      the widest screen column of the three because a date axis with eleven
//      slots is the thing on this artboard most short of width. The copy
//      column edge therefore never lines up down the page, which is what
//      stops the outer rows reading as a repeat.
//   3. ONE ACCENT, AND IT IS AT THE BOTTOM. The tutor row, and only the
//      tutor row, gets the citron: a citron block on the second line of its
//      heading and a soft citron wash behind its screen, which is the same
//      radial the FeatureShowcase paints behind every demo. It sits on the
//      last row on purpose. An accent at the top only confirms where the eye
//      already entered; low down it is a second focal point that pulls the
//      eye through the full height. It also keeps a block of citron away
//      from the chart, whose blue, orange and green are doing categorical
//      work and do not need a fourth strong colour beside them.
//   4. THE SCREENS BREATHE PAST THE GUTTER. Each window is 24px wider than
//      its column and pulled toward the copy, so it crosses the gutter
//      line instead of sitting in a tidy box. The chrome always keeps its
//      left edge, because the traffic lights live there.
//
// WHY THE WINDOW CHROME IS DIFFERENT HERE. Every other panel in the kit
// draws its rail dots as hairlines. This unit turns on the real macOS hues
// (#FF5F57, #FEBC2E, #28C840) via AdPanel's `traffic` flag. That is the one
// place the citron-and-graphite rule is deliberately not applied: those
// three dots are recognised as a shape rather than read as a colour, and
// repainting them brand colours makes a window stop looking like a window.
// Nothing else on the artboard borrows them. The badges the other units put
// on the rail are dropped here: at 540px wide the rail is only comfortable
// with dots and a URL, and the copy column is already saying the thing the
// badge would say.
//
// WHAT READS AT WHAT SIZE, checked by re-shooting the portrait cut at 0.241
// scale rather than by guessing:
//   full size (1080 wide, or the 2160 export)  everything.
//   half feed (~540px)  every heading, every body line, the three lines with
//       their points and the date axis under them, the countdown, the four
//       options with the chosen one, and the shape of the chat.
//   thumbnail (~260px)  the three headings, the citron block, the three
//       window silhouettes with their traffic lights and the zigzag they
//       make, the countdown digits, the four option rows with the chosen one
//       visibly heavier, and in the chart three separated coloured lines
//       holding their shape, blue high and steady, green low with a dive in
//       the middle. What goes: every body line, the legend labels, the axis
//       labels, the option text, the chat text and the chips.
//   And one honest correction to the premise this order was built on. The
//       chart does survive the thumbnail and it does read as a chart of
//       somebody's marks, which is the part that matters. It is not the
//       loudest object at that size: the countdown panel and the citron
//       block are, because both are high-contrast blocks and three 4px lines
//       are not. The chart leads because of what it MEANS at half feed and
//       above, not because it shouts at 260px.
//
// THE GROUND. The artboard carries the campaign-wide dot lattice from
// adkit's Artboard, at 5% ink. It is masked by every window and never sits
// under a run of type, so nothing on here lost contrast for it.
//
// TRUTH. Each screen is drawn from the source the showcase tiles were
// checked against:
//   /dashboard/chatbot   the reply carries the student's level and study
//                        units, which is what BuildTutorPrompt hands the
//                        model. Not citations: nothing in the AI module can
//                        cite anything.
//   /dashboard/analytics MarksByCourse. Every graded mark already logged,
//                        on a shared date axis, one line per course, y
//                        pinned 0 to 100, marks shown at every point. Real
//                        marks on their real due dates for the seeded
//                        first-year Aeronautical Engineering account. No
//                        forward curve, no band, no interval: this is what
//                        happened, and the projection is a different screen.
//   /dashboard/practice  PracticeRunner on a timed generated test: the
//                        countdown, the question position and answered
//                        count, the topic chip, the mark value and four
//                        options with one chosen. Every part of that is in
//                        the code; see the header on PracticeScreen for the
//                        file and symbol behind each element, including the
//                        one liberty taken there and why.
//
// AUDIENCE AND LABEL ARE NOT THE SAME THING. What is depicted is a
// university account: semesters, courses the student added, first year, a
// tertiary marking model. What is PRINTED is "For students". Leading with
// "university" on the artwork is a targeting decision made in the wrong
// place, the ad platform already targets by institution and age, and the
// word only narrows who feels spoken to. No CAPS, no matric, no grades
// anywhere in the picture. Nothing here shows a citation, a worked
// past-paper solution, a confidence band, a counsellor, a teacher class, a
// school report, or any statistic about anybody.
// =====================================================================

const SITE = "aptiverse.co.za";

/**
 * Rail URL size, set once for all three windows rather than per panel.
 *
 * The exam window is the constraint: its rail carries the live-attempt pill
 * as well as the path, and at the kit's default 21px the URL ran out of room
 * and ellipsised, which reads as a mistake rather than as chrome. Dropping
 * only that one window's URL would have left three windows on one artboard
 * with two different rail sizes, which is worse than all three being a
 * little smaller. 16px is what the longest of the three needs, measured off
 * the export rather than estimated: at 17 the practice path was eight pixels
 * short and lost its last two characters to the ellipsis.
 */
const RAIL_URL = 16;

/**
 * Window chrome, trimmed once for all three panels.
 *
 * The kit's defaults (18px rail padding, 30px body inset) are drawn for a
 * unit with one window on it. This one has three, and at the kit defaults the
 * chrome alone eats roughly 130px per window before a single pixel of product
 * is drawn. On the 1080x1350 cut that is most of a row, and it was the
 * difference between four exam options fitting and being clipped. Chrome is
 * the cheapest height on a crowded artboard: nobody looks at rail padding.
 * The rail still reads as a rail and the body still has a clear inset.
 */
const RAIL_PAD = 10;
const PANEL_PAD = 22;

// ---------------------------------------------------------------------
// The row. Copy on one side, screen on the other, vertically centred.
// ---------------------------------------------------------------------

type RowProps = {
  scheme: AdScheme;
  /** Which side the copy sits on. The screen takes the other. */
  copySide: "left" | "right";
  height: number;
  copyWidth: number;
  screenWidth: number;
  eyebrow: string;
  heading: React.ReactNode;
  headingSize: number;
  body: string;
  bodySize?: number;
  bullets?: string[];
  /** The citron wash behind the screen. Row one only. */
  glow?: boolean;
  screen: (w: number, h: number) => React.ReactNode;
};

function Row({
  scheme,
  copySide,
  height,
  copyWidth,
  screenWidth,
  eyebrow,
  heading,
  headingSize,
  body,
  bodySize = 22,
  bullets,
  glow,
  screen,
}: RowProps) {
  const s = adSurfaces(scheme);
  // The window overruns its column toward the copy. Its left edge is never
  // the one that moves, because the traffic lights are on it.
  const bleed = 24;
  const drawnWidth = screenWidth + bleed;

  const copy = (
    <Box sx={{ width: copyWidth, flexShrink: 0 }}>
      <Stack spacing="14px">
        <AdEyebrow scheme={scheme} size={18}>
          {eyebrow}
        </AdEyebrow>
        <Typography
          component="p"
          sx={{
            fontSize: headingSize,
            fontWeight: 700,
            lineHeight: 1.1,
            letterSpacing: "-0.03em",
            color: s.ink,
            textWrap: "balance",
          }}
        >
          {heading}
        </Typography>
        <Typography sx={{ fontSize: bodySize, lineHeight: 1.4, color: s.muted }}>{body}</Typography>
        {bullets && (
          <Stack spacing="10px" sx={{ pt: "2px" }}>
            {bullets.map((b) => (
              <Stack key={b} direction="row" spacing="12px" alignItems="flex-start">
                <Box sx={{ display: "flex", color: s.ink, pt: "3px", flexShrink: 0 }}>
                  <CheckCircle2 size={19} />
                </Box>
                <Typography sx={{ fontSize: 20, lineHeight: 1.35, color: s.ink }}>{b}</Typography>
              </Stack>
            ))}
          </Stack>
        )}
      </Stack>
    </Box>
  );

  const window = (
    <Box
      sx={{
        width: drawnWidth,
        height,
        flexShrink: 0,
        position: "relative",
        // A real flex column, so the panel's flex:1 resolves against the row
        // height instead of the panel sizing itself to its content and
        // running into the row below.
        display: "flex",
        flexDirection: "column",
        // The overrun goes toward the copy column, which is the inside edge.
        ml: copySide === "left" ? `${-bleed}px` : 0,
        mr: copySide === "right" ? `${-bleed}px` : 0,
      }}
    >
      {glow && (
        // The same radial FeatureShowcase paints behind every demo, in the
        // one colour this kit allows as a surface.
        <Box
          sx={{
            position: "absolute",
            inset: -40,
            borderRadius: "40px",
            background: `radial-gradient(58% 58% at 50% 50%, ${alpha(CITRON, 0.22)} 0%, ${alpha(
              CITRON,
              0,
            )} 70%)`,
            filter: "blur(28px)",
            zIndex: 0,
          }}
        />
      )}
      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {screen(drawnWidth, height)}
      </Box>
    </Box>
  );

  return (
    <Stack
      direction="row"
      spacing="44px"
      alignItems="center"
      sx={{ height, flexShrink: 0, minWidth: 0 }}
    >
      {copySide === "left" ? (
        <>
          {copy}
          {window}
        </>
      ) : (
        <>
          {window}
          {copy}
        </>
      )}
    </Stack>
  );
}

/** Window body, centred so a taller artboard just gives the screen air. */
function ScreenBody({ gap = 12, children }: { gap?: number; children: React.ReactNode }) {
  return (
    <Stack spacing={`${gap}px`} sx={{ height: "100%", justifyContent: "center" }}>
      {children}
    </Stack>
  );
}

function Avatarish({ bg, fg, children }: { bg: string; fg: string; children: React.ReactNode }) {
  return (
    <Box
      sx={{
        width: 38,
        height: 38,
        borderRadius: "50%",
        bgcolor: bg,
        color: fg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      {children}
    </Box>
  );
}

// ---------------------------------------------------------------------
// Screen 1. The AI tutor, mid conversation.
// ---------------------------------------------------------------------

function TutorScreen({ scheme }: { scheme: AdScheme }) {
  const t = useTheme();
  const s = adSurfaces(scheme);
  const bubble = scheme === "dark" ? "#1B1D22" : "#F1F2EF";

  return (
    <AdPanel
      scheme={scheme}
      url={`${SITE}/dashboard/chatbot`}
      traffic
      dotSize={16}
      urlSize={RAIL_URL}
      railPad={RAIL_PAD}
      pad={PANEL_PAD}
      flex={1}
    >
      <ScreenBody gap={12}>
        <Stack direction="row" spacing="12px" justifyContent="flex-end" alignItems="flex-start">
          <Box
            sx={{
              maxWidth: "82%",
              px: "17px",
              py: "10px",
              borderRadius: "14px",
              bgcolor: t.palette.primary.main,
              color: t.palette.primary.contrastText,
              fontSize: 20,
              lineHeight: 1.3,
            }}
          >
            I keep losing marks on friction problems. Where do I start?
          </Box>
          <Avatarish bg={CITRON} fg={GRAPHITE}>
            <User size={19} />
          </Avatarish>
        </Stack>

        <Stack direction="row" spacing="12px" alignItems="flex-start">
          <Avatarish bg={t.palette.primary.main} fg={t.palette.primary.contrastText}>
            <Sparkles size={19} />
          </Avatarish>
          <Box
            sx={{
              maxWidth: "96%",
              px: "17px",
              py: "11px",
              borderRadius: "14px",
              bgcolor: bubble,
              color: s.ink,
              fontSize: 20,
              lineHeight: 1.35,
            }}
          >
            Start with the free body diagram. Most friction marks are lost before any arithmetic
            happens.
            {/* What the tutor is handed, not what it cites. There is no
                retrieval and no citation path anywhere in the AI module. */}
            <Stack direction="row" spacing="8px" sx={{ mt: "10px" }} flexWrap="wrap" useFlexGap>
              <AdChip scheme={scheme} size={15}>
                Knows you take Mechanics I
              </AdChip>
              <AdChip scheme={scheme} size={15}>
                Pitched at first year
              </AdChip>
            </Stack>
          </Box>
        </Stack>
      </ScreenBody>
    </AdPanel>
  );
}

// ---------------------------------------------------------------------
// Screen 2. The marks chart on /dashboard/analytics.
//
// WHAT THIS REDRAWS. MarksByCourse in
// src/app/(app)/dashboard/analytics/page.tsx, element for element:
//   - one shared date axis, built from the union of every course's mark
//     dates, sorted, with scaleType "point", so the slots are evenly spaced
//     however far apart the real dates are
//   - one series per course, a point only where that course has a mark,
//     connectNulls so a course with marks weeks apart stays one line
//   - curve linear, showMark true, so every plotted point is a real logged
//     mark and nothing between two points is invented
//   - y pinned 0 to 100, horizontal gridlines, a legend because there is
//     more than one series (AptiverseLineChart turns it on at two)
//   - axis labels formatted DD MMM
//
// THE DOMAIN IS THE FULL 0 TO 100, exactly as the real yAxis pins it. The
// data here spans 48 to 82; cropping to that range would double the apparent
// size of every move and turn a four-mark wobble into a cliff. That is the
// most common way a truthful number becomes a dishonest picture, and it is
// the same rule charts.tsx states.
//
// NO PROJECTION ON THIS SCREEN. No forward curve past the last mark, no
// band, no interval, no confidence. This is the marks already logged and
// nothing else. The previous occupant of this row was the mastery
// projection, and it moved out rather than sitting alongside: a line of
// dated marks with a projection drawn on the same axes invites the reader to
// read the projection as more of the same measurement, which it is not.
//
// WHY THREE COURSES. See the note on AERO_MARKS in charts.tsx. Six lines on
// one axis at this size is spaghetti; the three kept are the ones that
// occupy separate horizontal bands and never cross.
//
// HOW THE LINES ARE DRAWN. The plot area has no fixed pixel size: it is
// whatever the row and the cut leave after the rail, the header, the legend
// and the axis. So the geometry is expressed in percentages of that box.
// The lines are one SVG on a 0-100 viewBox with preserveAspectRatio "none",
// which stretches the coordinate space to the box exactly, plus
// vector-effect non-scaling-stroke so the stroke stays the same weight in
// device pixels however the box is stretched. The point markers are laid out
// as positioned elements instead, because a circle in a stretched viewBox is
// an ellipse.
// ---------------------------------------------------------------------

/** Y axis label gutter. Right aligned, so "100" is what sets the width. */
const MARKS_Y_W = 32;
/**
 * Gridlines and y labels. Horizontal only, which is the grid the real chart
 * asks for, and five of them across a 0-100 domain: enough that a reader can
 * place a point without counting, few enough that the lines stay the quietest
 * thing in the panel.
 */
const MARKS_TICKS = [0, 25, 50, 75, 100];
/**
 * The point marker. Deliberately small: eleven of them land on this plot, and
 * a fat dot on a four-mark move covers the move it is there to mark. It is
 * ringed in the panel surface so two points that land close still read as two
 * points.
 */
const MARKS_DOT = 11;
/** Line weight in device pixels, held there by non-scaling-stroke. */
const MARKS_STROKE = 4;
/**
 * Print every other date, and always the last one. Eleven labels across this
 * width overlap at every cut, and the real axis thins its labels for the same
 * reason. The dates that survive are real dates off real assessments; none is
 * moved to a rounder day to make the axis tidier.
 */
const MARKS_LABEL_EVERY = 2;

function MarksScreen({ scheme }: { scheme: AdScheme }) {
  const s = adSurfaces(scheme);
  // The marker ring, read off the same helper AdPanel fills the panel with
  // rather than a second copy of the literal that would quietly drift.
  const ring = adPanelBg(scheme);
  const grid = alpha(s.ink, 0.12);

  // The shared axis, built the way MarksByCourse builds it: the union of every
  // course's mark dates, sorted, then spaced evenly. Even spacing is what
  // scaleType "point" does, so 23 April and 24 April sit one slot apart just
  // as two dates a month apart do. That is the real screen's behaviour, not a
  // simplification of it.
  const dates = [...new Set(AERO_MARKS.flatMap((c) => c.marks.map((m) => m.date)))].sort();
  const xAt = (i: number) => (i / (dates.length - 1)) * 100;

  // Colour comes from the app's own categorical accessor at the slot each
  // course holds in the list, which is exactly what the real chart passes it.
  // No hue is invented for the ad, and the three slots used are Okabe-Ito
  // blue, orange and green, which stay separable under every CVD type.
  const series = AERO_MARKS.map((c, i) => ({
    name: c.name,
    colour: courseColor(i, scheme),
    points: c.marks.map((m) => ({ x: xAt(dates.indexOf(m.date)), y: m.mark })),
  }));

  return (
    <AdPanel
      scheme={scheme}
      url={`${SITE}/dashboard/analytics`}
      traffic
      dotSize={16}
      urlSize={RAIL_URL}
      railPad={RAIL_PAD}
      pad={PANEL_PAD}
      flex={1}
    >
      <Stack sx={{ height: "100%" }}>
        <Stack direction="row" alignItems="baseline" spacing="14px" sx={{ mb: "10px" }}>
          <AdEyebrow scheme={scheme} size={15}>
            Marks this semester
          </AdEyebrow>
          <Box sx={{ flex: 1 }} />
          <Typography sx={{ fontSize: 15, color: s.muted, whiteSpace: "nowrap" }}>
            every mark logged
          </Typography>
        </Stack>

        {/* The legend the real chart shows as soon as there is more than one
            series. It is not decoration here either: three lines carrying
            three identities cannot leave that identity to colour alone, and
            at this size there is no room to label each line at its end. */}
        <Stack
          direction="row"
          spacing="18px"
          alignItems="center"
          flexWrap="wrap"
          useFlexGap
          sx={{ mb: "12px" }}
        >
          {series.map((k) => (
            <Stack key={k.name} direction="row" spacing="8px" alignItems="center">
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  bgcolor: k.colour,
                  flexShrink: 0,
                }}
              />
              <Typography
                sx={{ fontSize: 16, fontWeight: 600, color: s.ink, whiteSpace: "nowrap" }}
              >
                {k.name}
              </Typography>
            </Stack>
          ))}
        </Stack>

        {/* The plot. A flex row rather than a grid, so both columns inherit
            the row height by stretching: a grid track sized to its content
            collapses to nothing here, because everything inside the plot is
            positioned rather than flowed. */}
        <Stack direction="row" spacing="10px" sx={{ flex: 1, minHeight: 0 }}>
          <Box sx={{ width: MARKS_Y_W, flexShrink: 0, position: "relative" }}>
            {MARKS_TICKS.map((t) => (
              <Typography
                key={t}
                sx={{
                  position: "absolute",
                  right: 0,
                  top: `${100 - t}%`,
                  transform: "translateY(-50%)",
                  fontSize: 15,
                  lineHeight: 1,
                  color: s.muted,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {t}
              </Typography>
            ))}
          </Box>

          <Box sx={{ flex: 1, minWidth: 0, position: "relative" }}>
            {MARKS_TICKS.map((t) => (
              <Box
                key={t}
                sx={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: `${100 - t}%`,
                  height: 2,
                  mt: "-1px",
                  bgcolor: grid,
                }}
              />
            ))}

            {/* One SVG for the lines, on a 0-100 coordinate space stretched to
                the box. non-scaling-stroke is what keeps the weight even after
                that stretch, and overflow visible is what keeps the caps on the
                first and last points from being sliced by the viewport edge. */}
            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                overflow: "visible",
              }}
            >
              {series.map((k) => (
                <polyline
                  key={k.name}
                  points={k.points.map((p) => `${p.x},${100 - p.y}`).join(" ")}
                  fill="none"
                  stroke={k.colour}
                  strokeWidth={MARKS_STROKE}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                />
              ))}
            </svg>

            {/* Every plotted point is a mark somebody actually got. Drawn as
                elements rather than in the SVG, because a circle inside a
                stretched viewBox comes out an ellipse. */}
            {series.map((k) =>
              k.points.map((p) => (
                <Box
                  key={`${k.name}-${p.x}`}
                  sx={{
                    position: "absolute",
                    left: `${p.x}%`,
                    top: `${100 - p.y}%`,
                    width: MARKS_DOT,
                    height: MARKS_DOT,
                    ml: `${-MARKS_DOT / 2}px`,
                    mt: `${-MARKS_DOT / 2}px`,
                    borderRadius: "50%",
                    bgcolor: k.colour,
                    boxShadow: `0 0 0 2.5px ${ring}`,
                  }}
                />
              )),
            )}
          </Box>
        </Stack>

        {/* The date axis, on the same two columns as the plot so the labels
            land under the points they belong to. */}
        <Stack direction="row" spacing="10px" sx={{ mt: "8px" }}>
          <Box sx={{ width: MARKS_Y_W, flexShrink: 0 }} />
          <Box sx={{ flex: 1, minWidth: 0, position: "relative", height: 17 }}>
            {dates.map((d, i) => {
              const last = i === dates.length - 1;
              if (i % MARKS_LABEL_EVERY !== 0 && !last) return null;
              return (
                <Typography
                  key={d}
                  sx={{
                    position: "absolute",
                    left: `${xAt(i)}%`,
                    transform: i === 0 ? "none" : last ? "translateX(-100%)" : "translateX(-50%)",
                    fontSize: 15,
                    lineHeight: 1,
                    color: s.muted,
                    whiteSpace: "nowrap",
                  }}
                >
                  {markAxisLabel(d)}
                </Typography>
              );
            })}
          </Box>
        </Stack>
      </Stack>
    </AdPanel>
  );
}

// ---------------------------------------------------------------------
// Screen 3. A practice test, mid attempt.
//
// WHAT IS DEPICTED, and how the framing was settled. This row has been three
// things: a five-question quiz, then an exam paper with a written answer and
// a memo, and now a timed multiple-choice practice test. The last move was
// forced by an honest conflict rather than by taste.
//
// The exam format really does open with multiple choice. GenerateExamAsync
// sets the paper out for the model as "Section A: multiple-choice, 1 mark
// each, roughly 30% of the total", "Section B: short answers", "Section C:
// one or two extended questions", and "mc questions: exactly four options,
// exactly one correct". So a four-option question inside an exam paper is
// real. But PracticeRunner draws an exam question with a SECTION chip and a
// MARKS chip and deliberately no topic, and draws a drill question with a
// TOPIC chip and neither of the others:
//
//   q.section != null  ->  <Chip "Section A"> <Chip "1 mark">
//   otherwise          ->  q.topic && <Chip "Stoichiometry">
//
// with a comment explaining why: a topic printed over an exam question is
// the answer to half of it. The screen therefore cannot show a topic and a
// section at once, and the question that had to go on this row is a seeded
// Chemistry I item whose topic is Stoichiometry. A generated multiple-choice
// test is what that question actually belongs to, so that is what is drawn,
// and the copy column says practice test rather than exam paper.
//
// WHAT IS STILL TRUE OF IT, checked rather than assumed:
//   Timed. PracticeRunner takes `timed = durationMin > 0`, and
//   PracticeTestGenerator sets DurationMinutes on every format, an exam off
//   its marks and everything else off EstimateDuration. A twelve-question
//   multiple-choice test is a quarter of an hour, which is what the
//   countdown shows.
//   One attempt. PracticeService.StartAttemptAsync looks for any submitted
//   attempt on the test and hands that one back instead of opening a second,
//   with no branch on format. The rail pill is true for every generated
//   test, not only for a paper.
//   Generated for a course the student takes, at their year.
//   PracticeTestGenerator resolves the course off the practice key, reads
//   the student's own StudentCourse.Level and passes it as `levelHint`.
//   Never adaptive: `ai_practice.adaptive` is a seeder string with nothing
//   behind it, and the copy does not go near it.
//
// THE PROGRESS FIGURES ARE ARITHMETIC THAT HOLDS. The row used to read "Q3
// of 12 · 18/100 marks", which cannot be right in any paper: eighteen marks
// banked on question three means six marks a question, and a six-mark
// multiple choice does not exist. Twelve questions at one mark each is a
// twelve-mark test, and the readout is the runner's own pair, the question
// position and the answered count.
//
// THE COUNTDOWN IS THE LOUDEST THING IN THE WINDOW, at roughly twice the
// question size, in its own tinted panel with a stopwatch icon. That is not
// decoration: a countdown is the one element on this screen that is urgent,
// and it is the only thing on the artboard that carries the warm colour,
// which is a theme token rather than a hex.
// ---------------------------------------------------------------------

/**
 * Seeded content, not written for the advert: this is one of the
 * stoichiometry multiple-choice items on the Chemistry I practice test in
 * the database, topic "Stoichiometry", four options with exactly one
 * correct. The equation is set as LaTeX so the subscripts and the reaction
 * arrow render the way the runner renders them, rather than as flat ASCII.
 *
 * Chemistry is the course the chart row above shows falling, 65 in March to
 * 48 in April to 51 in June. Drilling the module that is dropping is the
 * whole point of the order these rows are in.
 */
const PRACTICE_TOPIC = "Stoichiometry";
const PRACTICE_QUESTION =
  "In $2\\mathrm{H}_2 + \\mathrm{O}_2 \\rightarrow 2\\mathrm{H}_2\\mathrm{O}$, how many moles of " +
  "$\\mathrm{O}_2$ are needed for 4 mol of $\\mathrm{H}_2$?";
const PRACTICE_OPTIONS = ["1 mol", "2 mol", "4 mol", "8 mol"];
/**
 * Which option is showing as chosen. Nothing on this screen says whether a
 * chosen answer is right: the paper has not been submitted, so the product
 * does not know either.
 */
const PRACTICE_PICKED = 1;

function PracticeScreen({ scheme }: { scheme: AdScheme }) {
  const t = useTheme();
  const s = adSurfaces(scheme);
  // The one warm colour on the artboard, and it is a theme token rather than
  // a hex: a countdown is the only thing on this screen that is urgent, and
  // it is the only thing tinted.
  const alarm = t.palette.error.main;

  return (
    <AdPanel
      scheme={scheme}
      url={`${SITE}/dashboard/practice`}
      traffic
      dotSize={16}
      urlSize={RAIL_URL}
      railPad={RAIL_PAD}
      pad={PANEL_PAD}
      flex={1}
      badge={
        // The negative inset pulls the kit's standard pill padding in by
        // three each side. This is the one rail in the set carrying a pill
        // and a full path, and six pixels is the difference between the
        // path fitting and ellipsising.
        <Stack
          direction="row"
          spacing="8px"
          alignItems="center"
          sx={{ fontSize: 13, mx: "-3px" }}
        >
          <Box sx={{ width: 9, height: 9, borderRadius: "50%", bgcolor: alarm, flexShrink: 0 }} />
          <span>LIVE · One attempt</span>
        </Stack>
      }
    >
      <ScreenBody gap={12}>
        {/* The clock. Its own panel, because on a real test the clock is not
            a chip in a corner, it is the thing you keep looking back at, and
            it is the loudest object in this window on purpose: the countdown
            sets at roughly twice the question. Left is the time, right is the
            runner's own progress pair, the question position and the answered
            count. Both are strings the screen prints; neither is a marks
            total, because the runner does not show one mid-attempt. */}
        <Stack
          direction="row"
          alignItems="flex-end"
          spacing="16px"
          sx={{
            px: "16px",
            py: "11px",
            borderRadius: "14px",
            border: `2px solid ${alpha(alarm, 0.5)}`,
            bgcolor: alpha(alarm, 0.09),
          }}
        >
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" spacing="9px" alignItems="center">
              <Box sx={{ display: "flex", color: alarm, flexShrink: 0 }}>
                <Clock size={17} />
              </Box>
              <Typography
                sx={{
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  lineHeight: 1,
                  color: s.muted,
                }}
              >
                Time remaining
              </Typography>
            </Stack>
            <Typography
              sx={{
                mt: "7px",
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
                fontSize: 38,
                fontWeight: 700,
                lineHeight: 1,
                letterSpacing: "-0.02em",
                color: s.ink,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              00:14:26
            </Typography>
          </Box>
          <Box sx={{ textAlign: "right", flexShrink: 0 }}>
            <Typography
              sx={{
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                lineHeight: 1,
                color: s.muted,
              }}
            >
              Progress
            </Typography>
            <Typography
              sx={{
                mt: "7px",
                fontSize: 17,
                fontWeight: 700,
                lineHeight: 1,
                color: s.ink,
                fontVariantNumeric: "tabular-nums",
                whiteSpace: "nowrap",
              }}
            >
              Q3 of 12 · 2/12 answered
            </Typography>
          </Box>
        </Stack>

        {/* The question. A left rule rather than a box: a second set of
            paddings inside a panel that already has some is weight without
            information, and the rule still binds the topic chip, the mark
            value and the question into one object.

            THE ONE LIBERTY ON THIS SCREEN. The runner shows the topic chip on
            a drill and the section-and-marks chips on an exam paper, and
            never both at once, because a topic printed over an exam question
            gives away half of it. They are drawn together here because both
            values are real on this question, the seeded Chemistry I
            stoichiometry item carries Marks 1, and because a mark value is
            the detail that stops the picture reading as invented: an
            eight-mark multiple choice does not exist on any real paper, and a
            question that says nothing at all invites the reader to assume
            one. Twelve one-mark questions is a paper whose arithmetic
            holds. */}
        <Box sx={{ borderLeft: `3px solid ${s.hair}`, pl: "16px" }}>
          <Stack direction="row" alignItems="center" spacing="12px" sx={{ mb: "10px" }}>
            <AdChip scheme={scheme} size={15}>
              {PRACTICE_TOPIC}
            </AdChip>
            <Box sx={{ flex: 1 }} />
            <Box
              sx={{
                px: "12px",
                py: "5px",
                borderRadius: 999,
                border: `2px solid ${s.hair}`,
                fontSize: 15,
                fontWeight: 700,
                lineHeight: 1,
                color: s.ink,
                whiteSpace: "nowrap",
              }}
            >
              1 mark
            </Box>
          </Stack>
          <Typography component="div" sx={{ fontSize: 17, lineHeight: 1.3, color: s.ink }}>
            <MathText text={PRACTICE_QUESTION} />
          </Typography>
        </Box>

        {/* The four options, one picked, drawn the way PracticeRunner draws
            them: a bordered row per option with a radio in front of the
            label, the chosen one carrying a heavier border and a wash.

            The runner tints the chosen row with the theme's secondary, which
            in this theme is citron. Here it is ink instead. Citron on this
            artboard is spent once, on row one, and a selected answer three
            rows down is not the thing an ad should be pointing at. Weight and
            a wash say "chosen" perfectly well without it. */}
        <Stack spacing="9px">
          {PRACTICE_OPTIONS.map((opt, i) => {
            const picked = i === PRACTICE_PICKED;
            return (
              <Stack
                key={opt}
                direction="row"
                spacing="11px"
                alignItems="center"
                sx={{
                  px: "16px",
                  py: "9px",
                  borderRadius: "13px",
                  border: `${picked ? 3 : 2}px solid ${picked ? s.ink : s.hair}`,
                  bgcolor: picked ? alpha(s.ink, 0.1) : "transparent",
                }}
              >
                <Box
                  sx={{
                    width: 21,
                    height: 21,
                    borderRadius: "50%",
                    border: `${picked ? 3 : 2}px solid ${picked ? s.ink : s.muted}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {picked && (
                    <Box sx={{ width: 9, height: 9, borderRadius: "50%", bgcolor: s.ink }} />
                  )}
                </Box>
                <Typography
                  component="div"
                  sx={{
                    fontSize: 18,
                    lineHeight: 1.2,
                    fontWeight: picked ? 700 : 500,
                    color: s.ink,
                  }}
                >
                  <MathText text={opt} />
                </Typography>
              </Stack>
            );
          })}
        </Stack>
      </ScreenBody>
    </AdPanel>
  );
}

// ---------------------------------------------------------------------
// Copy. Written once and shared by every cut, and named for the screen it
// belongs to rather than for a row number, because the running order has
// changed once already and row numbers do not survive that.
// ---------------------------------------------------------------------

/** The hook. Leads on every cut. */
const MARKS_COPY = {
  eyebrow: "Your marks, over time",
  heading: "Every mark, per course, across the semester.",
  body: "Each course keeps its own line on the same 0 to 100 scale, so the shape of a semester shows up in the marks already logged.",
};

const PRACTICE_COPY = {
  eyebrow: "Practice test",
  heading: "One test. One attempt. The clock running.",
  body: "Questions written for a course you are taking and pitched at your year, with the correct answer and the working once you submit.",
};

/**
 * The closer, and the row that carries the citron.
 *
 * The two bullets this copy used to run under it are folded into the body.
 * They were affordable when this was the opening row and the tallest one;
 * as the closer it is the shortest row on the artboard, and a bulleted list
 * at the bottom of a page reads as a specification sheet rather than as the
 * warm note the order is trying to end on. Nothing true was dropped: that
 * the tutor explains and then sets one to try is still stated.
 */
const TUTOR_COPY = {
  eyebrow: "Study assistant",
  body: "Your level, your courses and what is due next go into every reply. It explains it, then sets you one to try.",
};

/** The tutor heading, and the only citron on the artboard. */
function TutorHeading({ size }: { size: number }) {
  return (
    <>
      Ask it anything.{" "}
      <CitronBlock size={size} px={14} py={2}>
        It knows the course.
      </CitronBlock>
    </>
  );
}

/**
 * Footer. Wordmark and domain, and nothing else.
 *
 * The "Start free" pill was removed on the same reasoning showcase.tsx was:
 * an image travels further than the campaign that placed it, and a button
 * painted into a PNG is a control nobody can press. What has to survive the
 * screenshot and the repost is attribution, so the wordmark and the domain
 * stay and the ask moves to the placement, where it is a real link.
 */
function CardFooter({ scheme, size = 28 }: { scheme: AdScheme; size?: number }) {
  const s = adSurfaces(scheme);
  return (
    <Stack direction="row" alignItems="baseline" spacing="14px">
      <Wordmark scheme={scheme} size={size} />
      <Typography sx={{ fontSize: size * 0.76, color: s.muted }}>{SITE}</Typography>
    </Stack>
  );
}

// ---------------------------------------------------------------------
// UNIT 1. Portrait feed, 1080x1350, dark. The primary.
//
// Three rows want the vertical room, which is why portrait is the cut this
// composition is authored at and the other two are adaptations of it.
// ---------------------------------------------------------------------

function CardsPortrait() {
  const scheme: AdScheme = "dark";
  return (
    <Artboard width={1080} height={1350} scheme={scheme} pad={32}>
      <AdEyebrow scheme={scheme} size={20}>
        For students
      </AdEyebrow>
      <Box sx={{ height: 10 }} />
      {/* 376 + 512 + 294 with 16px gutters is the 1194 the three rows have
          between the eyebrow and the footer. This is the tightest cut in the
          set and every number in it is one row asking for height and the
          other two answering.

          Where the height came from. The chart leads now, so it takes the
          most: 424 gives its plot about 300px of panel and roughly 210 of
          actual 0-100 domain, against the 138 it had as the middle row, and
          that is the difference between three lines you can follow and three
          lines you can see. The exam paper is second at 404 because four
          option rows, a section label, a mark badge and a countdown do not
          fit in the 342 a single written-answer field needed. The tutor pays
          for both: it is the closer, its bullets are folded into its body,
          and 330 is what the two chat bubbles actually occupy. The two
          spacers around the rows also came down from 26 to 18 and the
          gutters from 24 to 18.

          The pad stays at 40. It came down from 48 once already, and the
          16px that freed went to the screens rather than the copy. */}
      <Stack spacing="16px" sx={{ flex: 1, minHeight: 0, justifyContent: "center" }}>
        <Row
          scheme={scheme}
          copySide="right"
          height={376}
          copyWidth={362}
          screenWidth={610}
          eyebrow={MARKS_COPY.eyebrow}
          heading={MARKS_COPY.heading}
          headingSize={44}
          body={MARKS_COPY.body}
          screen={() => <MarksScreen scheme={scheme} />}
        />
        <Row
          scheme={scheme}
          copySide="left"
          height={512}
          copyWidth={368}
          screenWidth={604}
          eyebrow={PRACTICE_COPY.eyebrow}
          heading={PRACTICE_COPY.heading}
          headingSize={36}
          body={PRACTICE_COPY.body}
          bodySize={21}
          screen={() => <PracticeScreen scheme={scheme} />}
        />
        <Row
          scheme={scheme}
          copySide="right"
          height={294}
          copyWidth={402}
          screenWidth={570}
          eyebrow={TUTOR_COPY.eyebrow}
          heading={<TutorHeading size={36} />}
          headingSize={36}
          body={TUTOR_COPY.body}
          bodySize={21}
          glow
          screen={() => <TutorScreen scheme={scheme} />}
        />
      </Stack>
      <Box sx={{ height: 10 }} />
      <CardFooter scheme={scheme} size={26} />
    </Artboard>
  );
}

// ---------------------------------------------------------------------
// UNIT 2. Square feed, 1080x1080, dark.
//
// TWO rows, not three. A square is 270px shorter than the portrait, which
// is most of a row, and three rows in it would mean 250px bands with the
// copy squeezed to a line each.
//
// What goes is the exam paper, and the reasoning changed with the running
// order. It used to be dropped because the alternating rhythm needs at least
// one swap and the first swap was the tutor into the chart. Now the two rows
// that have to survive are the first and the last: the chart because it is
// the hook the whole order is built around, and the tutor because it carries
// the only citron on the artboard, and a cut with no accent at all is not
// the same design. The paper keeps its own full-size row on the portrait,
// story and wide cuts, and it is the row that least tolerates being
// squeezed: four options and a countdown in 250px is four strips and a
// number.
// ---------------------------------------------------------------------

function CardsSquare() {
  const scheme: AdScheme = "dark";
  return (
    <Artboard width={1080} height={1080} scheme={scheme} pad={40}>
      <AdEyebrow scheme={scheme} size={20}>
        For students
      </AdEyebrow>
      <Box sx={{ height: 24 }} />
      <Stack spacing="70px" sx={{ flex: 1, minHeight: 0, justifyContent: "center" }}>
        <Row
          scheme={scheme}
          copySide="right"
          height={440}
          copyWidth={354}
          screenWidth={602}
          eyebrow={MARKS_COPY.eyebrow}
          heading={MARKS_COPY.heading}
          headingSize={46}
          body={MARKS_COPY.body}
          screen={() => <MarksScreen scheme={scheme} />}
        />
        <Row
          scheme={scheme}
          copySide="left"
          height={344}
          copyWidth={396}
          screenWidth={560}
          eyebrow={TUTOR_COPY.eyebrow}
          heading={<TutorHeading size={40} />}
          headingSize={40}
          body={TUTOR_COPY.body}
          glow
          screen={() => <TutorScreen scheme={scheme} />}
        />
      </Stack>
      <Box sx={{ height: 24 }} />
      <CardFooter scheme={scheme} size={26} />
    </Artboard>
  );
}

// ---------------------------------------------------------------------
// UNIT 3. Story and reel, 1080x1920, dark.
//
// The platform covers roughly the top 250 and the bottom 350 with its own
// furniture, so the rows sit in the middle band. The extra height goes into
// air: taller rows and bigger gaps, with the same copy and the same screens.
// A story that adds content is a story nobody finishes.
// ---------------------------------------------------------------------

function CardsStory() {
  const scheme: AdScheme = "dark";
  return (
    <Artboard width={1080} height={1920} scheme={scheme} pad={36}>
      <Box sx={{ height: 140 }} />
      <AdEyebrow scheme={scheme} size={24}>
        For students
      </AdEyebrow>
      <Box sx={{ height: 30 }} />
      {/* Pad 36 rather than 48. The story is the cut with the most vertical
          air and the least horizontal, so it is the one where the side
          margins were costing the most: the 24px freed goes straight into the
          screens, and the chart row gets almost all of it. The top and
          bottom edges are unaffected in practice because the platform-safe
          spacers above and below are absolute, not derived from the pad. */}
      <Stack spacing="77px" sx={{ flex: 1, minHeight: 0, justifyContent: "center" }}>
        <Row
          scheme={scheme}
          copySide="right"
          height={450}
          copyWidth={352}
          screenWidth={612}
          eyebrow={MARKS_COPY.eyebrow}
          heading={MARKS_COPY.heading}
          headingSize={46}
          body={MARKS_COPY.body}
          screen={() => <MarksScreen scheme={scheme} />}
        />
        <Row
          scheme={scheme}
          copySide="left"
          height={517}
          copyWidth={370}
          screenWidth={594}
          eyebrow={PRACTICE_COPY.eyebrow}
          heading={PRACTICE_COPY.heading}
          headingSize={38}
          body={PRACTICE_COPY.body}
          screen={() => <PracticeScreen scheme={scheme} />}
        />
        <Row
          scheme={scheme}
          copySide="right"
          height={320}
          copyWidth={404}
          screenWidth={560}
          eyebrow={TUTOR_COPY.eyebrow}
          heading={<TutorHeading size={38} />}
          headingSize={38}
          body={TUTOR_COPY.body}
          glow
          screen={() => <TutorScreen scheme={scheme} />}
        />
      </Stack>
      <Box sx={{ height: 34 }} />
      <CardFooter scheme={scheme} size={32} />
      <Box sx={{ height: 140 }} />
    </Artboard>
  );
}

// ---------------------------------------------------------------------
// UNIT 4. The wide cut, 1350x1920, dark.
//
// WHY 1350x1920 AND NOT SOMETHING ELSE. The brief was "the entire image a bit
// wider", and the constraint is that the composition is a copy column beside
// a screen column, three times over, in a portrait frame. 1350x1920 is 45:64,
// which is a hair wider than 3:4 and a long way off the 9:16 the story cut
// is: wide enough that both columns get a real increase, tall enough that
// three unequal rows still have somewhere to go. 1350 is also the width every
// other portrait unit in the registry already uses as a HEIGHT, so nothing
// new entered the set of numbers this campaign is authored on.
//
// The two rejected alternatives, briefly. 1080x1350 turned on its side gives
// a landscape frame, and three stacked rows in a landscape frame are three
// letterbox strips: the screens would have to shrink vertically, and the exam
// paper is the row that already cannot lose height. 1200x1920 is only 120px
// wider than the story and spends all of it on margins nobody notices.
//
// WHERE THE EXTRA WIDTH GOES. Not evenly. The copy column takes about a fifth
// of it, which is enough for the headings to break where they want to rather
// than where the measure forces them, and the screen column takes the rest.
// The projection row is the largest beneficiary and it is meant to be: its
// 0-100 domain gets roughly 450px here against roughly 260 on the 1080 cuts,
// which is the difference between a one-mark move being three pixels and
// being nearly five.
//
// No platform-safe spacers on this one. A 45:64 image is not a story, so
// nothing is covering the top and bottom of it.
// ---------------------------------------------------------------------

function CardsWide() {
  const scheme: AdScheme = "dark";
  return (
    <Artboard width={1350} height={1920} scheme={scheme} pad={44}>
      <AdEyebrow scheme={scheme} size={24}>
        For students
      </AdEyebrow>
      <Box sx={{ height: 34 }} />
      <Stack spacing="98px" sx={{ flex: 1, minHeight: 0, justifyContent: "center" }}>
        <Row
          scheme={scheme}
          copySide="right"
          height={610}
          copyWidth={442}
          screenWidth={776}
          eyebrow={MARKS_COPY.eyebrow}
          heading={MARKS_COPY.heading}
          headingSize={52}
          body={MARKS_COPY.body}
          bodySize={24}
          screen={() => <MarksScreen scheme={scheme} />}
        />
        <Row
          scheme={scheme}
          copySide="left"
          height={500}
          copyWidth={462}
          screenWidth={756}
          eyebrow={PRACTICE_COPY.eyebrow}
          heading={PRACTICE_COPY.heading}
          headingSize={42}
          body={PRACTICE_COPY.body}
          bodySize={23}
          screen={() => <PracticeScreen scheme={scheme} />}
        />
        <Row
          scheme={scheme}
          copySide="right"
          height={390}
          copyWidth={496}
          screenWidth={722}
          eyebrow={TUTOR_COPY.eyebrow}
          heading={<TutorHeading size={42} />}
          headingSize={42}
          body={TUTOR_COPY.body}
          bodySize={23}
          glow
          screen={() => <TutorScreen scheme={scheme} />}
        />
      </Stack>
      <Box sx={{ height: 38 }} />
      <CardFooter scheme={scheme} size={32} />
    </Artboard>
  );
}

export const CARD_UNITS = {
  CardsPortrait,
  CardsSquare,
  CardsStory,
  CardsWide,
};
