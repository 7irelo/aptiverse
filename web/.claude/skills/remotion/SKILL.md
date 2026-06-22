---
name: remotion
description: Build Remotion compositions for Aptiverse marketing videos and product demos. Use when authoring or editing video in `web/marketing/remotion/` — animated explainers, ad cuts, social clips. Captions follow the existing SRT timing in `web/marketing/captions/`.
---

# Remotion authoring for Aptiverse

Remotion (`https://remotion.dev`) renders React components into MP4. We use
it for marketing video — product demos, ads, social cuts. Anything that
plays as a video on the site or on Meta/LinkedIn/YouTube.

## Where things live

```
web/marketing/
  remotion/
    package.json          # remotion + remotion-cli
    src/
      Root.tsx            # registers compositions
      compositions/
        AptiverseAd30.tsx
        AptiverseAd60.tsx
        AptiverseAd90.tsx
        ProductDemo.tsx
      scenes/
        TutorChatScene.tsx
        MasteryForecastScene.tsx
        ...
      lib/
        timing.ts         # SRT-aligned cue points
        theme.ts          # colour palette matching the web app
    captions/             # symlink to ../captions
  captions/
    aptiverse-30s.srt
    aptiverse-60s.srt
    aptiverse-90s.srt
```

The existing SRT files in `web/marketing/captions/` are the **source of
truth for timing**. Scenes must match the VO cue points. Don't redesign
the script — match the words.

## Setup (do once)

```bash
cd web/marketing/remotion
npm install
```

`package.json` minimal:
```json
{
  "scripts": {
    "dev": "remotion studio",
    "build:30": "remotion render AptiverseAd30 out/aptiverse-30.mp4",
    "build:60": "remotion render AptiverseAd60 out/aptiverse-60.mp4",
    "build:90": "remotion render AptiverseAd90 out/aptiverse-90.mp4",
    "build:demo": "remotion render ProductDemo out/product-demo.mp4"
  },
  "dependencies": {
    "@remotion/cli": "^4.0.0",
    "@remotion/captions": "^4.0.0",
    "@remotion/google-fonts": "^4.0.0",
    "remotion": "^4.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  }
}
```

## Composition pattern

```tsx
// src/Root.tsx
import { Composition } from "remotion";
import { AptiverseAd30 } from "./compositions/AptiverseAd30";

export const RemotionRoot = () => (
  <>
    <Composition
      id="AptiverseAd30"
      component={AptiverseAd30}
      durationInFrames={30 * 30}   // 30 fps × 30 seconds
      fps={30}
      width={1080}
      height={1920}                 // 9:16 vertical for Meta / TikTok
    />
  </>
);
```

Render at the **target platform's** aspect ratio:
- `1080 × 1920` for Meta Reels / TikTok / Stories
- `1080 × 1080` for Instagram feed
- `1920 × 1080` for YouTube + web embeds

## Scene composition

One scene per beat of the SRT. Stagger them with `<Sequence>`:

```tsx
import { AbsoluteFill, Sequence, useCurrentFrame, interpolate } from "remotion";

export const AptiverseAd30: React.FC = () => (
  <AbsoluteFill style={{ background: "#0A0A0A" }}>
    <Sequence durationInFrames={90}>           {/* 0–3s */}
      <TutorChatScene />
    </Sequence>
    <Sequence from={90} durationInFrames={90}> {/* 3–6s */}
      <MasteryForecastScene />
    </Sequence>
    {/* ... */}
    <Sequence from={870} durationInFrames={30}> {/* 29–30s end card */}
      <EndCardScene />
    </Sequence>
  </AbsoluteFill>
);
```

## Animation primitives

```tsx
const frame = useCurrentFrame();

// Fade in over 12 frames
const opacity = interpolate(frame, [0, 12], [0, 1], {
  extrapolateRight: "clamp",
});

// Spring entry — feels softer than linear interpolate
const scale = spring({
  frame,
  fps: 30,
  config: { damping: 18, mass: 0.5, stiffness: 120 },
});

return (
  <div style={{ opacity, transform: `scale(${scale})` }}>...</div>
);
```

## Style rules (matches the Emil Kowalski rubric)

- **Background**: solid `#0A0A0A` (dark) or `#FAFAFA` (light). Never
  gradient backdrops; gradients are reserved for one hero shot.
- **Type**: load via `@remotion/google-fonts` — Inter for UI text,
  Source Serif for headlines (matches the web app).
- **Motion**: spring, not linear. Entries 350–450ms, exits 250–300ms.
- **Captions**: render burned-in via `<Captions>` from `@remotion/captions`
  reading the SRT file. Bottom-third placement, white text + black
  stroke, sentence case.
- **No stock footage.** Every shot is either a real screenshot of the
  product or a designed scene.

## Captions

```tsx
import { Captions, parseSrt } from "@remotion/captions";
import srtRaw from "../../captions/aptiverse-30s.srt";

const captions = parseSrt(srtRaw);

<Captions
  captions={captions}
  style={{
    fontFamily: "Inter",
    fontWeight: 600,
    fontSize: 56,
    color: "white",
    textStroke: "2px black",
  }}
  position={{ bottom: 120 }}
/>
```

Always burn captions in — many Meta / LinkedIn users autoplay videos
muted. The SRT files in `web/marketing/captions/` are written for this.

## Rendering

Local preview:
```bash
cd web/marketing/remotion
npm run dev    # opens Remotion Studio at http://localhost:3000
```

Final render:
```bash
npm run build:30    # writes out/aptiverse-30.mp4
```

For CI / batch:
```bash
npx remotion render AptiverseAd30 out/aptiverse-30.mp4 --codec h264 --crf 18
```

## Quality bar

A composition isn't ready until:

- [ ] Plays through end-to-end without dropped frames in the Studio.
- [ ] Every VO line in the matching SRT has a matching visual beat.
- [ ] No element runs past its scene boundary (a `<Sequence durationInFrames>`
      crop on every scene; nothing leaks into the next).
- [ ] Burned-in captions are legible against every background — test by
      scrubbing through.
- [ ] Renders cleanly at 30 fps with no warnings.
- [ ] Final MP4 plays correctly in:
  - Chrome (web preview)
  - QuickTime / Windows Media Player
  - Meta / LinkedIn upload previews
- [ ] File size is reasonable — 30s at 1080×1920 should land 5–10 MB.

## When to use this skill

- Building a new marketing video (ad cut, demo, social clip).
- Editing an existing composition (timing tweaks, restyling, new scene).
- Producing platform-specific cuts of the same script (9:16 + 16:9 + 1:1).
- Wiring SRT captions for an ad.

Don't use this skill for:
- Animated UI inside the product itself — that's framer-motion in
  `web/src/`, not Remotion.
- Static marketing imagery — that's plain Next.js pages or designed
  PNGs in `web/marketing/`.
