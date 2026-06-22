"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { alpha } from "@mui/material/styles";
import CloudOffOutlinedIcon from "@mui/icons-material/CloudOffOutlined";

// Shared "failed to load" inner content for data-driven cards.
//
// Renders the icon tile + a short caption + a Retry button. The
// component intentionally does NOT include a Card / CardContent
// wrapper -- it slots into the conditional branch of whatever card
// already owns the surface. That way the surrounding card keeps its
// padding, header, and footer (e.g. LastSynced) consistent with the
// populated state.
//
// Replaces:
//   - dashboard/page.tsx -> local CardError()
//   - dashboard/wellbeing/page.tsx -> local WellbeingError()
//   - dashboard/journey/page.tsx -> local ErrorCard()
//
// Why the calm copy: PRODUCT.md "the senior friend at 8pm" beats
// alarm bells and error codes. The retry button is the only action;
// the caption explains why the retry exists.

export type CardErrorProps = {
  /** Short noun phrase. E.g. "your goals", "your mastery trend". */
  what: string;
  onRetry: () => void;
};

export function CardError({ what, onRetry }: CardErrorProps) {
  return (
    <Box
      sx={{
        py: 4,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 1.5,
        textAlign: "center",
      }}
    >
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: 1,
          display: "grid",
          placeItems: "center",
          color: "text.secondary",
          bgcolor: (t) => alpha(t.palette.text.primary, 0.05),
        }}
      >
        <CloudOffOutlinedIcon fontSize="small" />
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 360 }}>
        Couldn&apos;t load {what} right now. Check your connection?
      </Typography>
      <Button size="small" onClick={onRetry}>
        Try again
      </Button>
    </Box>
  );
}
