"use client";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { adSurfaces, type AdScheme } from "./adkit";

// =====================================================================
// Charts for organic posts.
//
// Separate from depictions.tsx on purpose. A depiction is a redraw of a
// screen that exists; a chart here is a plot of numbers the product
// actually computes, drawn at poster scale so it survives a phone
// thumbnail. Neither is allowed to invent anything.
//
// The one chart in this file plots the mastery projection: the current
// mark per course, and the projected mark MasteryController computes from the
// graded work already logged. This account has enough marks in every course,
// so all six project. The renderer still handles a missing projection and
// draws it plainly rather than hiding the row, because "no marks in, no
// projection" is a real state of the feature; it just is not this student's.
//
// DELIBERATELY ABSENT, and this is the whole point of the file:
//   - no outcome statistic, no "students improve by X"
//   - no user counts, no engagement numbers, no ratings
//   - no confidence band (ComputeTopicMasteryAsync returns a level, not
//     a band, so plotting one would be a fabrication)
//   - no final-result forecast; these are semester marks projected from
//     semester marks
//
// COLOUR, validated rather than eyeballed.
//
// The two data colours encode polarity (a projection above or below the
// current mark), so they are status colours, not categorical identity.
// They were still run through the dataviz palette validator against the
// #1B1D22 artboard, because a green/clay pair is exactly the pair that
// collapses under deuteranopia:
//
//   forest[400] #5BAD7E + terracotta[400] #D07A62  ->  FAIL, CVD dE 4.0
//   forest[500] #3D9762 + terracotta[500] #C25A44  ->  FAIL, CVD dE 4.3
//   #52A876      + #B85436                          ->  PASS
//       lightness band PASS, chroma floor PASS,
//       CVD separation dE 10.2 (deutan) against a target of 8,
//       normal-vision floor dE 23.7 against a floor of 15,
//       contrast vs surface 5.80:1 and 3.50:1, both over 3:1.
//
// Both steps are inside the existing brand ramps (between forest 400/500
// and terracotta 400/500), so nothing new entered the palette. On top of
// colour, direction is carried three more ways: which side the far dot
// sits on, an arrow glyph, and a signed number. A reader who sees no
// colour at all still gets the story.
// =====================================================================

/** Projection up. Validated step between brand.forest 400 and 500. */
export const CHART_UP = "#52A876";
/** Projection down. Validated step between brand.terracotta 400 and 500. */
export const CHART_DOWN = "#B85436";

export type CourseRow = {
  name: string;
  /** Current semester mark, from graded assessments already logged. */
  current: number;
  /** Projected mark, or null where there is not enough graded work yet. */
  predicted: number | null;
};

// The shape of one real seeded student: a first-year Aeronautical
// Engineering student at Wits with six courses. Ordered by current mark
// so the reader's eye falls down the list into the one that is dropping.
// Read back from GET /api/mastery/predictions for the seeded first-year
// Aeronautical Engineering account, not from memory. Every course has a
// projection: the three nulls that were here previously came from an
// incomplete brief rather than from the data, and printing "no projection"
// against a course the product does in fact project is exactly the kind of
// small untruth this whole marketing set exists to avoid.
//
// The real shape is a better argument anyway. Five courses flat or climbing
// and exactly one falling is a sharper picture than three shrugs, and it is
// what the account actually says.
export const AERO_COURSES: CourseRow[] = [
  { name: "Engineering Drawing", current: 78, predicted: 78 },
  { name: "Electrical Engineering", current: 70, predicted: 73 },
  { name: "Mathematics", current: 65, predicted: 65 },
  { name: "Physics", current: 61, predicted: 66 },
  { name: "Mechanics", current: 57, predicted: 58 },
  { name: "Chemistry", current: 51, predicted: 46 },
];

// ---------------------------------------------------------------------
// MARKS OVER THE SEMESTER, the other real series on this account.
//
// This is what /dashboard/analytics plots in MarksByCourse: every graded
// mark already logged, on a shared date axis, one line per course, y pinned
// to 0-100. It is not a projection and it is not adjacent to one. Nothing
// here is computed, smoothed or extended: each point is a mark with the due
// date of the assessment it came from, read off the seeded first-year
// Aeronautical Engineering account for the 2026 first semester.
//
// THREE COURSES, NOT SIX. The account carries six, and six lines on one
// date axis at social size is spaghetti: Electrical (75, 70, 68) tracks two
// or three marks under Engineering Drawing for the whole semester, Physics
// (74, 61, 70, 58) crosses Mathematics three times, and Mechanics (60, 58,
// 55) is a flat line in the gap between Mathematics and Chemistry. Any of
// those three makes the picture denser without making it say more.
//
// What is left is the set that separates: one course high and steady until
// it slips, one wandering in the middle, one low with a hard April drop and
// a partial recovery. The three occupy three distinct horizontal bands and
// never cross, which is what "individually followable" means on an image
// somebody sees for two seconds.
//
// Dates are ISO so the sort is a plain string sort, the same way the real
// screen sorts them before building the axis.
export type MarkPoint = {
  /** ISO date of the assessment the mark came from. */
  date: string;
  mark: number;
};

export type CourseMarks = {
  name: string;
  marks: MarkPoint[];
};

export const AERO_MARKS: CourseMarks[] = [
  {
    name: "Engineering Drawing",
    marks: [
      { date: "2026-03-20", mark: 78 },
      { date: "2026-04-24", mark: 80 },
      { date: "2026-05-22", mark: 82 },
      { date: "2026-06-19", mark: 74 },
    ],
  },
  {
    name: "Mathematics",
    marks: [
      { date: "2026-03-06", mark: 72 },
      { date: "2026-04-02", mark: 68 },
      { date: "2026-05-14", mark: 61 },
      { date: "2026-06-08", mark: 65 },
    ],
  },
  {
    name: "Chemistry",
    marks: [
      { date: "2026-03-10", mark: 65 },
      { date: "2026-04-23", mark: 48 },
      { date: "2026-06-15", mark: 51 },
    ],
  },
];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/**
 * "DD MMM", which is what the real axis prints via dayjs. Done by hand off
 * the ISO string rather than through a date library, because parsing a bare
 * date into a Date object makes the label depend on the machine's timezone,
 * and an export that renders "19 Jun" here and "18 Jun" in CI is worse than
 * no label at all.
 */
export function markAxisLabel(date: string): string {
  const [, month, day] = date.split("-");
  return `${day} ${MONTHS[Number(month) - 1]}`;
}

type Scale = {
  /** Course name size. */
  name: number;
  /** Direct-label numeral size. */
  value: number;
  /** Vertical space one row occupies, track included. */
  row: number;
  /** Diameter of the "now" marker. */
  dot: number;
};

const DEFAULT_SCALE: Scale = { name: 31, value: 30, row: 104, dot: 22 };

/**
 * Dumbbell chart: current mark to projected mark, one row per course.
 *
 * A dumbbell rather than a grouped bar, because the job is before-to-after
 * per item and the reader has to see the DIRECTION of one gap, not compare
 * twelve bar lengths. A grouped bar would spend the categorical channel on
 * "current versus predicted", which is not identity, and would bury the one
 * row that matters under eleven others of similar height.
 *
 * The domain is a full 0 to 100. Cropping it to 40-85 would triple the
 * apparent size of every gap, which is the most common way a truthful
 * number becomes a dishonest picture.
 */
export function ProjectionDumbbell({
  scheme,
  rows = AERO_COURSES,
  scale = DEFAULT_SCALE,
}: {
  scheme: AdScheme;
  rows?: CourseRow[];
  scale?: Scale;
}) {
  const s = adSurfaces(scheme);
  // The "now" marker is deliberately ink, not a hue. It is the anchor the
  // eye starts from, and giving it a colour would imply it means something.
  const nowInk = s.ink;
  const trackH = 6;

  return (
    <Box sx={{ width: "100%" }}>
      {/* One continuous 50 rule behind all six rows rather than a tick per
          row. Drawn once, at the container level, so it reads as a single
          reference line instead of six unexplained dashes. */}
      <Box sx={{ position: "relative", width: "100%" }}>
        <Box
          sx={{
            position: "absolute",
            left: "50%",
            top: 0,
            bottom: 0,
            width: 2,
            bgcolor: s.hair,
          }}
        />
        {rows.map((r) => {
        // Three-way, not two. Treating "no change" as up painted a green
        // rising arrow next to a delta of zero, which claims improvement the
        // arithmetic does not support. A flat projection is its own state and
        // gets the neutral ink and a flat glyph.
        const delta = r.predicted === null ? 0 : r.predicted - r.current;
        const direction: "up" | "flat" | "down" =
          r.predicted === null || delta === 0 ? "flat" : delta > 0 ? "up" : "down";
        const tone =
          r.predicted === null || direction === "flat"
            ? s.muted
            : direction === "up"
              ? CHART_UP
              : CHART_DOWN;
        const lo = Math.min(r.current, r.predicted ?? r.current);
        const hi = Math.max(r.current, r.predicted ?? r.current);

        return (
          // The name binds to the track UNDER it, so the gap inside a row has
          // to be visibly smaller than the gap between rows. flex-end plus a
          // tight label margin puts the slack above each row, not inside it.
          <Box
            key={r.name}
            sx={{
              height: scale.row,
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
            }}
          >
            <Stack direction="row" alignItems="baseline" spacing="16px" sx={{ mb: `${scale.dot * 0.2}px` }}>
              <Typography
                sx={{ fontSize: scale.name, fontWeight: 600, color: s.ink, flex: 1, minWidth: 0 }}
                noWrap
              >
                {r.name}
              </Typography>
              <Typography
                sx={{
                  fontSize: scale.value,
                  fontWeight: 700,
                  color: s.ink,
                  fontVariantNumeric: "tabular-nums",
                  flexShrink: 0,
                }}
              >
                {r.current}
              </Typography>
              {r.predicted === null ? (
                <Stack
                  direction="row"
                  spacing="6px"
                  alignItems="center"
                  sx={{ width: scale.value * 4.4, justifyContent: "flex-end", flexShrink: 0, color: s.muted }}
                >
                  <Minus size={scale.value * 0.7} />
                  <Typography sx={{ fontSize: scale.value * 0.72, color: s.muted, whiteSpace: "nowrap" }}>
                    no projection
                  </Typography>
                </Stack>
              ) : (
                <Stack
                  direction="row"
                  spacing="8px"
                  alignItems="center"
                  sx={{ width: scale.value * 4.4, justifyContent: "flex-end", flexShrink: 0, color: tone }}
                >
                  {direction === "up" ? (
                    <ArrowUpRight size={scale.value * 0.8} />
                  ) : direction === "down" ? (
                    <ArrowDownRight size={scale.value * 0.8} />
                  ) : (
                    <Minus size={scale.value * 0.8} />
                  )}
                  <Typography
                    sx={{
                      fontSize: scale.value,
                      fontWeight: 700,
                      color: tone,
                      fontVariantNumeric: "tabular-nums",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {r.predicted} ({delta > 0 ? "+" : ""}
                    {delta})
                  </Typography>
                </Stack>
              )}
            </Stack>

            {/* The plot. Percentages are the scale: left is 0, right is 100. */}
            <Box sx={{ position: "relative", height: scale.dot + 8 }}>
              <Box
                sx={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: "50%",
                  height: trackH,
                  mt: `${-trackH / 2}px`,
                  borderRadius: 999,
                  bgcolor: s.hair,
                }}
              />
              {r.predicted !== null && (
                <Box
                  sx={{
                    position: "absolute",
                    left: `${lo}%`,
                    width: `${hi - lo}%`,
                    top: "50%",
                    height: trackH + 4,
                    mt: `${-(trackH + 4) / 2}px`,
                    borderRadius: 999,
                    bgcolor: tone,
                  }}
                />
              )}
              <Marker left={r.current} size={scale.dot} fill={nowInk} ring={s.bg} />
              {r.predicted !== null && (
                <Marker left={r.predicted} size={scale.dot * 1.32} fill={tone} ring={s.bg} />
              )}
            </Box>
          </Box>
        );
        })}
      </Box>

      {/* Axis. Three labels only: the ends and the 50 the gridline marks. */}
      <Box sx={{ position: "relative", height: scale.value * 0.95, mt: "6px" }}>
        {[0, 50, 100].map((t) => (
          <Typography
            key={t}
            sx={{
              position: "absolute",
              left: `${t}%`,
              transform: t === 0 ? "none" : t === 100 ? "translateX(-100%)" : "translateX(-50%)",
              fontSize: scale.value * 0.72,
              color: s.muted,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {t}
          </Typography>
        ))}
      </Box>
    </Box>
  );
}

function Marker({
  left,
  size,
  fill,
  ring,
}: {
  left: number;
  size: number;
  fill: string;
  ring: string;
}) {
  return (
    <Box
      sx={{
        position: "absolute",
        left: `${left}%`,
        top: "50%",
        width: size,
        height: size,
        mt: `${-size / 2}px`,
        ml: `${-size / 2}px`,
        borderRadius: "50%",
        bgcolor: fill,
        // A surface-coloured ring so the two markers stay separate objects
        // where they nearly touch, which is the 3-point gap on Electrical.
        boxShadow: `0 0 0 4px ${ring}`,
      }}
    />
  );
}

/**
 * Legend. Present because two data colours are in play, and identity is
 * never left to colour alone: each key carries its own glyph too.
 */
export function ProjectionLegend({ scheme, size = 24 }: { scheme: AdScheme; size?: number }) {
  const s = adSurfaces(scheme);
  const keys = [
    { label: "Mark now", swatch: s.ink, glyph: null as React.ReactNode },
    { label: "Projected up", swatch: CHART_UP, glyph: <ArrowUpRight size={size * 0.9} /> },
    { label: "Projected down", swatch: CHART_DOWN, glyph: <ArrowDownRight size={size * 0.9} /> },
  ];
  return (
    <Stack direction="row" spacing={`${size * 1.5}px`} alignItems="center" flexWrap="wrap" useFlexGap>
      {keys.map((k) => (
        <Stack key={k.label} direction="row" spacing={`${size * 0.4}px`} alignItems="center">
          <Box sx={{ width: size * 0.72, height: size * 0.72, borderRadius: "50%", bgcolor: k.swatch }} />
          {k.glyph && <Box sx={{ display: "flex", color: k.swatch }}>{k.glyph}</Box>}
          <Typography sx={{ fontSize: size, color: s.muted, whiteSpace: "nowrap" }}>{k.label}</Typography>
        </Stack>
      ))}
    </Stack>
  );
}
