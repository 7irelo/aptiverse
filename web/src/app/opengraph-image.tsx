import { ImageResponse } from "next/og";

// =====================================================================
// The site's Open Graph card. There was none at all before this file, so
// every share, WhatsApp forward and Slack unfurl of aptiverse.co.za
// rendered as a grey rectangle with a URL under it.
//
// This is generated at request time by next/og rather than served from a
// committed PNG, for one reason: a PNG in public/ is a file somebody has to
// remember to regenerate and re-upload, and the failure mode when they do
// not is a meta tag pointing at a 404. Rendering it from code means the tag
// can never go stale.
//
// The design mirrors the og-default-1200x630 unit in
// (marketing)/ads/units/units.tsx, which is the capturable version for
// anywhere that needs an actual file (paid placements, press kits). Keep the
// two in step if either changes.
//
// Written with plain flex divs and literal hex values on purpose: this is
// rendered by Satori, not by a browser, so there is no MUI theme, no
// cascade, and no shorthand CSS. The hexes are the graphite and citron
// tokens from theme/palette.ts.
// =====================================================================

export const alt = "Aptiverse: study with a plan, not panic";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const GRAPHITE = "#1B1D22";
const CITRON = "#C3E84F";
const INK = "#F2F3F1";
const MUTED = "#9EA29C";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: GRAPHITE,
          padding: 64,
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <div style={{ width: 16, height: 44, backgroundColor: CITRON, borderRadius: 3 }} />
          <div
            style={{
              marginLeft: 20,
              fontSize: 44,
              fontWeight: 600,
              color: INK,
              letterSpacing: "-0.03em",
            }}
          >
            aptiverse
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 82,
              fontWeight: 600,
              color: INK,
              letterSpacing: "-0.032em",
              lineHeight: 1.02,
              maxWidth: 980,
            }}
          >
            Study with a plan, not panic.
          </div>
          <div
            style={{
              marginTop: 24,
              fontSize: 30,
              color: MUTED,
              lineHeight: 1.35,
              maxWidth: 900,
            }}
          >
            Practice, mastery, wellbeing and goals in one calm place. High school and university, in
            South Africa.
          </div>
        </div>

        <div style={{ display: "flex", fontSize: 28, color: MUTED }}>aptiverse.co.za</div>
      </div>
    ),
    size,
  );
}
