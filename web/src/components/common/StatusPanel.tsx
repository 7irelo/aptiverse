"use client";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";
import { DotMatrixCode } from "./DotMatrixCode";

export type StatusPanelProps = {
  /** "404" or "403". Drawn as the dot matrix. */
  code: string;
  /** One short sentence. It is the only body copy on the page. */
  title: string;
  /** Optional single muted line. The 403 uses it to say who you are. */
  note?: React.ReactNode;
  /** Primary action, and at most one quiet secondary next to it. */
  actions: React.ReactNode;
};

/**
 * The shared status composition for 404 and 403.
 *
 * Deliberately reduced to three things: the graphic, one sentence, one way
 * out. The graphite block is the artwork's surface rather than decoration,
 * and it is also what lets citron appear as a filled cell without ever
 * becoming low contrast type on a light ground. No border, no shadow, no
 * eyebrow, no link list, no background wash: anything else competes with the
 * one thing the eye should land on first.
 *
 * Mobile first. The measure stays narrow so the graphic keeps its air at
 * 390px, and the spacing scale opens up rather than filling out on desktop.
 */
export function StatusPanel({ code, title, note, actions }: StatusPanelProps) {
  const theme = useTheme();
  const surface = theme.palette.brandSurface;

  return (
    <Stack
      spacing={{ xs: 5, md: 7 }}
      alignItems="center"
      sx={{ width: "100%", maxWidth: 480, mx: "auto", textAlign: "center" }}
    >
      <Box
        sx={{
          width: "100%",
          borderRadius: 3,
          bgcolor: surface.main,
          overflow: "hidden",
        }}
      >
        <DotMatrixCode
          code={code}
          cellColor={surface.contrastText}
          sx={{ height: { xs: 176, sm: 208, md: 224 } }}
        />
      </Box>

      <Stack spacing={{ xs: 3, md: 4 }} alignItems="center" sx={{ width: "100%" }}>
        <Stack spacing={1} alignItems="center">
          <Typography
            variant="h5"
            component="h1"
            sx={{
              fontWeight: 600,
              letterSpacing: "-0.01em",
              fontSize: { xs: "1.25rem", sm: "1.4rem" },
            }}
          >
            {title}
          </Typography>
          {note && (
            <Typography variant="body2" color="text.secondary">
              {note}
            </Typography>
          )}
        </Stack>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
          alignItems="center"
          justifyContent="center"
          sx={{ width: "100%" }}
        >
          {actions}
        </Stack>
      </Stack>
    </Stack>
  );
}
