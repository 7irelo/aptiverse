"use client";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { GradientBackdrop } from "@/components/common/GradientBackdrop";

export type LegalBlock =
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] }
  // A real control, inline in the prose. Added so the privacy policy can offer
  // the actual withdraw-consent button at the point where it describes what
  // consent was given for. A policy that says "you may withdraw at any time"
  // and then makes you go and find the button is technically true and
  // practically useless.
  | { type: "action"; label: string; onClick: () => void };
export type LegalSection = { heading: string; blocks: LegalBlock[] };

// Clean, readable legal prose. A single narrow column, numbered sections,
// generous line-height. Deliberately restrained, no cards or accents.
export function LegalDoc({
  title,
  intro,
  sections,
}: {
  title: string;
  intro?: string;
  sections: LegalSection[];
}) {
  return (
    <>
      <GradientBackdrop variant="soft">
        <Box sx={{ maxWidth: 1240, mx: "auto", px: { xs: 2.5, sm: 4, lg: 6 }, py: { xs: 6, md: 10 } }}>
          <Stack spacing={1.5} sx={{ maxWidth: 760 }}>
            <Typography variant="overline" color="primary.main">
              Legal
            </Typography>
            <Typography variant="h1" component="h1">
              {title}
            </Typography>
          </Stack>
        </Box>
      </GradientBackdrop>

      <Box component="section" sx={{ py: { xs: 5, md: 9 } }}>
        <Box sx={{ maxWidth: 760, mx: "auto", px: { xs: 2.5, sm: 4, lg: 6 } }}>
          {intro && (
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ mb: 5, fontSize: "1.0625rem", lineHeight: 1.75 }}
            >
              {intro}
            </Typography>
          )}
          <Stack spacing={{ xs: 4, md: 5 }}>
            {sections.map((s, i) => (
              <Box key={s.heading} component="section">
                <Typography variant="h5" component="h2" sx={{ fontWeight: 700, mb: 1.5 }}>
                  {i + 1}. {s.heading}
                </Typography>
                <Stack spacing={1.75}>
                  {s.blocks.map((b, j) =>
                    b.type === "p" ? (
                      <Typography key={j} variant="body1" color="text.secondary" sx={{ lineHeight: 1.75 }}>
                        {b.text}
                      </Typography>
                    ) : b.type === "action" ? (
                      <Box key={j}>
                        <Button variant="outlined" color="primary" onClick={b.onClick}>
                          {b.label}
                        </Button>
                      </Box>
                    ) : (
                      <Stack key={j} component="ul" spacing={1} sx={{ pl: 0, m: 0, listStyle: "none" }}>
                        {b.items.map((it) => (
                          <Stack key={it} component="li" direction="row" spacing={1.25} alignItems="flex-start">
                            {/* One-line-tall box centres the dot on the first text line,
                                so it stays aligned regardless of font metrics. */}
                            <Box
                              sx={{
                                height: "1.64rem",
                                display: "flex",
                                alignItems: "center",
                                flexShrink: 0,
                              }}
                            >
                              <Box sx={{ width: 5, height: 5, borderRadius: "50%", bgcolor: "primary.main" }} />
                            </Box>
                            <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.75 }}>
                              {it}
                            </Typography>
                          </Stack>
                        ))}
                      </Stack>
                    )
                  )}
                </Stack>
              </Box>
            ))}
          </Stack>

          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 6 }}>
            Questions about this document? Email support@aptiverse.co.za.
          </Typography>
        </Box>
      </Box>
    </>
  );
}
