"use client";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";

export type LogoProps = {
  size?: number;
  showWordmark?: boolean;
  variant?: "default" | "compact";
};

/**
 * Brand mark — five-node learning-journey graph. Two endpoints,
 * two intermediates, one apex. The apex node is amber
 * (`palette.achievement.main`); every other element uses `currentColor`
 * so the mark inherits the surrounding text colour and works on light,
 * dark, and inverted surfaces without per-context variants.
 *
 * Amber appearing in the logo is deliberate: amber is reserved across
 * the product for earned milestones. The apex is the symbolic
 * achievement, so the logo carries the rule wherever it goes.
 */
export function LogoMark({ size = 28 }: { size?: number }) {
  const theme = useTheme();
  const apex = theme.palette.achievement.main;
  const surface = theme.palette.background.paper;

  return (
    <Box
      component="svg"
      width={size}
      height={size}
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Aptiverse"
      sx={{ flexShrink: 0, color: "text.primary" }}
    >
      <g fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round">
        <line x1={30} y1={130} x2={80} y2={30} />
        <line x1={80} y1={30} x2={130} y2={130} />
      </g>
      <circle cx={30} cy={130} r={8} fill={surface} stroke="currentColor" strokeWidth={3} />
      <circle cx={130} cy={130} r={8} fill={surface} stroke="currentColor" strokeWidth={3} />
      <circle cx={55} cy={80} r={9} fill={surface} stroke="currentColor" strokeWidth={3} />
      <circle cx={105} cy={80} r={9} fill={surface} stroke="currentColor" strokeWidth={3} />
      <circle cx={80} cy={30} r={12} fill={apex} />
    </Box>
  );
}

export function Logo({ size = 28, showWordmark = true }: LogoProps) {
  return (
    <Stack direction="row" spacing={1.25} alignItems="center" sx={{ color: "text.primary" }}>
      <LogoMark size={size} />
      {showWordmark && (
        <Typography
          component="span"
          sx={{
            fontFamily: 'Inter, "Helvetica Neue", Arial, sans-serif',
            fontWeight: 500,
            letterSpacing: "-0.02em",
            fontSize: size > 28 ? "1.4rem" : "1.1rem",
            lineHeight: 1,
            color: "text.primary",
          }}
        >
          aptiverse
        </Typography>
      )}
    </Stack>
  );
}
