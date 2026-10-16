"use client";

import { useEffect, useRef } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import MuiLink from "@mui/material/Link";
import Link from "next/link";
import { alpha } from "@mui/material/styles";
import { Cookie } from "lucide-react";
import { CONSENT_SUMMARY, setConsent } from "@/lib/analytics/consent";

// The consent gate, at the moment of first arrival.
//
// Design rules this has to satisfy, all of them non-negotiable:
//
//   Reject is exactly as easy as Accept. Two buttons, same variant, same size,
//   same weight, side by side, both reachable with one thumb. No "Accept all"
//   in citron against a grey text link, no hidden "manage preferences" maze,
//   no pre-ticked categories, and no cookie wall: closing nothing and simply
//   reading the site keeps the pixel off, because it has not loaded.
//
//   It must not swallow a 390px screen. It is a slim bottom sheet, roughly a
//   fifth of a phone viewport, and it sits below the fold of the hero so the
//   primary call to action stays clickable behind it.
//
//   Keyboard first. The banner is a non-modal dialog: it takes focus when it
//   appears so a keyboard user is not left hunting for it, but it does not
//   trap focus, because trapping someone inside a consent prompt is a cookie
//   wall built out of tab stops.

export function ConsentBanner({ onDismiss }: { onDismiss?: () => void }) {
  const panelRef = useRef<HTMLDivElement>(null);
  const headingId = "consent-banner-heading";

  useEffect(() => {
    // Focus the CONTAINER, not a button. Two reasons, and both matter.
    //
    // Accessibility: focusing the panel makes a screen reader announce the
    // question before it announces one of the answers, so the person is not
    // told "Accept, button" before being told what they would be accepting.
    //
    // Fairness: programmatically focusing Accept paints MUI's focus ripple on
    // it, which visually distinguishes it from Reject. Two buttons that are
    // identical in the markup but not on the screen are not equal weight, and
    // pre-highlighting the answer we happen to prefer is exactly the nudge
    // this banner is supposed to avoid.
    panelRef.current?.focus({ preventScroll: true });
  }, []);

  function decide(marketing: boolean) {
    setConsent(marketing, "banner");
    onDismiss?.();
  }

  return (
    <Box
      ref={panelRef}
      role="dialog"
      aria-modal="false"
      aria-labelledby={headingId}
      // Focusable as a target, but not a tab stop on the way back through the
      // page. Nothing is trapped here: Tab leaves the banner normally, because
      // a consent prompt you cannot tab out of is a cookie wall.
      tabIndex={-1}
      sx={{
        outline: "none",
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: (t) => t.zIndex.snackbar,
        // Sit above the home indicator on a notched phone. viewportFit=cover
        // in the root layout is what makes this resolve to anything.
        pb: "calc(env(safe-area-inset-bottom, 0px))",
      }}
    >
      <Box
        sx={{
          maxWidth: 1240,
          mx: "auto",
          m: { xs: 0, sm: 2 },
          p: { xs: 2, sm: 2.5 },
          borderTop: 1,
          borderColor: "divider",
          borderRadius: { xs: 0, sm: 3 },
          border: { sm: 1 },
          bgcolor: "background.paper",
          boxShadow: (t) => `0 -8px 32px ${alpha(t.palette.common.black, 0.14)}`,
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={{ xs: 1.75, md: 3 }}
          alignItems={{ md: "center" }}
        >
          <Stack direction="row" spacing={1.5} sx={{ flex: 1, minWidth: 0 }}>
            <Box
              aria-hidden
              sx={{
                display: { xs: "none", sm: "grid" },
                placeItems: "center",
                width: 36,
                height: 36,
                flexShrink: 0,
                borderRadius: 1.5,
                bgcolor: (t) => alpha(t.palette.secondary.main, 0.22),
                color: "text.primary",
              }}
            >
              <Cookie size={18} />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography id={headingId} variant="subtitle2" sx={{ fontWeight: 700 }}>
                Can we measure our adverts?
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, lineHeight: 1.55 }}>
                {CONSENT_SUMMARY} Say no and nothing loads. Either way we count page views with a
                cookieless counter that stores nothing on your device.{" "}
                <MuiLink
                  component={Link}
                  href="/privacy"
                  color="text.primary"
                  underline="always"
                  sx={{ fontWeight: 600 }}
                >
                  Privacy Policy
                </MuiLink>
              </Typography>
            </Box>
          </Stack>

          {/* Equal weight, equal width, identical variant. This is the part a
              regulator actually looks at. */}
          <Stack
            direction="row"
            spacing={1.25}
            sx={{ flexShrink: 0, width: { xs: "100%", md: "auto" } }}
          >
            <Button
              onClick={() => decide(true)}
              variant="contained"
              color="primary"
              sx={{ flex: { xs: 1, md: "0 0 auto" }, minWidth: { md: 128 } }}
            >
              Accept
            </Button>
            <Button
              onClick={() => decide(false)}
              variant="contained"
              color="primary"
              sx={{ flex: { xs: 1, md: "0 0 auto" }, minWidth: { md: 128 } }}
            >
              Reject
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
}
