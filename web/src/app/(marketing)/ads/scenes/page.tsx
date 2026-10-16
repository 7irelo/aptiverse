"use client";

import { useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import Chip from "@mui/material/Chip";
import {
  TutorChatScene,
  MasteryForecastScene,
  PracticeScene,
  GoalsVerifiedScene,
  EndCardScene,
} from "./scenes";

// =====================================================================
// /ads/scenes: Editor-facing scene player. Not for public consumption.
//
// Each scene re-mounts via a `playKey` bump so animations play from
// frame 0 on demand. Wraps the active scene in a fixed-aspect container
// (16:9 / 1:1 / 9:16) the editor switches between with the ratio chips.
// Capture them via OBS / Loom / browser screen-record at the matching
// resolution and you have the in-product b-roll for the production
// brief without recreating any UI in After Effects.
//
// Defaults sized for a 1080p capture: 1920×1080 on 16:9, 1080×1080 on
// 1:1, 1080×1920 on 9:16. Adjust ?w=… in the URL if your tooling
// prefers a different render size.
// =====================================================================

type Ratio = "16:9" | "1:1" | "9:16";

const SCENES = [
  {
    slug: "tutor-chat",
    name: "A tutor that knows your courses",
    durationMs: 8000,
    Component: TutorChatScene,
    description: "Student asks, tutor answers, then the chips show what it knows about them.",
  },
  {
    slug: "mastery",
    name: "Mastery, and where each course is heading",
    durationMs: 6000,
    Component: MasteryForecastScene,
    description: "Ring draws to 68%, strongest and focus rows land, projection slopes fan out.",
  },
  {
    slug: "practice",
    name: "Practice written for your weakest topics",
    durationMs: 7000,
    Component: PracticeScene,
    description: "Generator fields fill, weakest-topics toggle flips, a fresh 12-question test lands.",
  },
  {
    slug: "goals",
    name: "Goals that get checked",
    durationMs: 6000,
    Component: GoalsVerifiedScene,
    description: "Goal card fills to 100%, then the auto-checked and points chips pop in.",
  },
  {
    slug: "end-card",
    name: "End card",
    durationMs: 3000,
    Component: EndCardScene,
    description: "Logo + URL + CTA. Soft fade-in, holds for capture.",
  },
];

export default function AdsScenesPage() {
  const [ratio, setRatio] = useState<Ratio>("16:9");
  const [activeSlug, setActiveSlug] = useState<string>(SCENES[0].slug);
  const [playKey, setPlayKey] = useState(0);

  const active = useMemo(
    () => SCENES.find((s) => s.slug === activeSlug) ?? SCENES[0],
    [activeSlug],
  );

  // Hard-noindex these: the URL is shared with editors only.
  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex,nofollow";
    document.head.appendChild(meta);
    return () => {
      document.head.removeChild(meta);
    };
  }, []);

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: "background.default", minHeight: "100vh" }}>
      <Stack spacing={3} sx={{ maxWidth: 1400, mx: "auto" }}>
        <Box>
          <Chip label="Internal · editor capture" size="small" sx={{ mb: 1.5 }} />
          <Typography variant="h3" sx={{ fontWeight: 700 }}>
            Ad scene player
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, maxWidth: 760 }}>
            Pick a scene + aspect ratio, click <strong>Play</strong>, and capture with OBS /
            Loom / your browser&apos;s screen-record. The viewport below is the exact crop
            your video editor receives. Anything outside it gets cut.
          </Typography>
        </Box>

        {/* Ratio selector */}
        <Stack direction="row" spacing={1}>
          {(["16:9", "1:1", "9:16"] as Ratio[]).map((r) => (
            <Chip
              key={r}
              label={r}
              color={ratio === r ? "primary" : "default"}
              onClick={() => setRatio(r)}
              clickable
              sx={{ fontWeight: 600 }}
            />
          ))}
        </Stack>

        {/* Scene + capture viewport */}
        <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
          <Stack spacing={1} sx={{ width: { xs: "100%", md: 280 } }}>
            <Typography variant="overline" color="text.secondary">
              Scenes
            </Typography>
            {SCENES.map((s) => (
              <Card
                key={s.slug}
                variant={s.slug === activeSlug ? "elevation" : "outlined"}
                sx={{
                  cursor: "pointer",
                  borderColor: s.slug === activeSlug ? "primary.main" : "divider",
                  borderWidth: s.slug === activeSlug ? 2 : 1,
                  borderStyle: "solid",
                }}
                onClick={() => {
                  setActiveSlug(s.slug);
                  setPlayKey((k) => k + 1);
                }}
              >
                <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {s.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
                    {s.description}
                  </Typography>
                  <Typography variant="caption" sx={{ display: "block", mt: 0.5, fontFamily: "monospace" }}>
                    ~{(s.durationMs / 1000).toFixed(1)}s · {s.slug}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Stack>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }} flexWrap="wrap" useFlexGap>
              <ButtonGroup variant="contained">
                <Button onClick={() => setPlayKey((k) => k + 1)}>▶ Play from start</Button>
              </ButtonGroup>
              <Typography variant="caption" color="text.secondary">
                Active: <strong>{active.name}</strong> · ~{(active.durationMs / 1000).toFixed(1)}s ·{" "}
                <span style={{ fontFamily: "monospace" }}>{ratio}</span>
              </Typography>
            </Stack>

            <CaptureViewport ratio={ratio}>
              <active.Component key={playKey} />
            </CaptureViewport>
          </Box>
        </Stack>

        <Card variant="outlined">
          <CardContent sx={{ p: 2.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
              Recording tips
            </Typography>
            <Stack spacing={0.75} component="ul" sx={{ pl: 3, m: 0 }}>
              <Typography component="li" variant="body2">
                Use OBS or Loom. Browser-built-in (Chrome → DevTools → Record) works in a pinch but compresses
                hard.
              </Typography>
              <Typography component="li" variant="body2">
                Set the source crop to the dashed-border viewport. That&apos;s the exact area your editor
                expects.
              </Typography>
              <Typography component="li" variant="body2">
                Click <strong>Play from start</strong>, count one mississippi, start recording, count two,
                end at the duration shown.
              </Typography>
              <Typography component="li" variant="body2">
                Export as MP4 (H.264) at the resolution implied by the ratio: 1920×1080 (16:9), 1080×1080
                (1:1), 1080×1920 (9:16).
              </Typography>
              <Typography component="li" variant="body2">
                These pages are <code>noindex,nofollow</code>, so it is safe to share the URL with freelancers,
                won&apos;t leak to Google.
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
}

// Fixed-aspect crop. Width capped by the viewport; height computed from
// ratio. Dashed inner border shows the editor exactly what they get.
function CaptureViewport({ ratio, children }: { ratio: Ratio; children: React.ReactNode }) {
  const [num, den] = ratio.split(":").map(Number);
  const aspectPad = `${(den / num) * 100}%`;

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        maxWidth: ratio === "9:16" ? 540 : ratio === "1:1" ? 720 : 1280,
        mx: "auto",
        bgcolor: (t) => (t.palette.mode === "dark" ? "#0F0E0C" : "#F7F6F3"),
        borderRadius: 1,
        border: 2,
        borderStyle: "dashed",
        borderColor: "primary.main",
        overflow: "hidden",
      }}
    >
      <Box sx={{ width: "100%", pb: aspectPad }} />
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: { xs: 2, md: 4 },
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
