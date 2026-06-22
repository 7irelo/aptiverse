"use client";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import CheckCircleIcon from "@mui/icons-material/CheckCircleOutline";

// Big text-on-one-side, demo-on-the-other block. Alternates left/right
// via the `reverse` prop. The demo slot is whatever React node makes
// sense for the feature — a chat UI, a chart, an annotated essay.
export type FeatureShowcaseProps = {
  eyebrow: string;
  title: string;
  body: string;
  bullets: string[];
  demo: React.ReactNode;
  reverse?: boolean;
};

export function FeatureShowcase({
  eyebrow,
  title,
  body,
  bullets,
  demo,
  reverse = false,
}: FeatureShowcaseProps) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "5fr 7fr" },
        gap: { xs: 4, md: 8 },
        alignItems: "center",
        py: { xs: 6, md: 8 },
      }}
    >
      <Box
        sx={{
          order: { xs: 1, md: reverse ? 2 : 1 },
        }}
      >
        <Stack spacing={2.5}>
          <Typography variant="overline" color="primary.main">
            {eyebrow}
          </Typography>
          <Typography variant="h3" component="h2" sx={{ fontWeight: 700, lineHeight: 1.15 }}>
            {title}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {body}
          </Typography>
          <Stack spacing={1.25}>
            {bullets.map((b) => (
              <Stack key={b} direction="row" spacing={1.25} alignItems="flex-start">
                <CheckCircleIcon sx={{ color: "primary.main", fontSize: 20, mt: 0.25, flexShrink: 0 }} />
                <Typography variant="body2">{b}</Typography>
              </Stack>
            ))}
          </Stack>
        </Stack>
      </Box>

      <Box
        sx={{
          order: { xs: 2, md: reverse ? 1 : 2 },
          minWidth: 0,
        }}
      >
        <Box
          sx={{
            position: "relative",
            "&::before": {
              content: '""',
              position: "absolute",
              inset: -24,
              borderRadius: 4,
              background: (t) =>
                t.palette.mode === "dark"
                  ? "radial-gradient(60% 60% at 50% 50%, rgba(63,157,149,0.22) 0%, rgba(63,157,149,0) 70%)"
                  : "radial-gradient(60% 60% at 50% 50%, rgba(15,105,99,0.12) 0%, rgba(15,105,99,0) 70%)",
              filter: "blur(20px)",
              pointerEvents: "none",
              zIndex: 0,
            },
          }}
        >
          <Box sx={{ position: "relative", zIndex: 1 }}>{demo}</Box>
        </Box>
      </Box>
    </Box>
  );
}

// Reusable mock-app frame used by the demos below. Adds the rounded
// border, soft shadow, and the three traffic-light dots that signal
// "this is a screenshot of the app".
export function MockAppFrame({
  title,
  badge,
  children,
}: {
  title: string;
  badge?: string;
  children: React.ReactNode;
}) {
  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 3,
        overflow: "hidden",
        boxShadow: (t) =>
          t.palette.mode === "dark"
            ? "0 20px 50px -20px rgba(0,0,0,0.5)"
            : "0 20px 50px -20px rgba(15,105,99,0.25)",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          px: 2,
          py: 1,
          borderBottom: 1,
          borderColor: "divider",
          bgcolor: "action.hover",
        }}
      >
        <Stack direction="row" spacing={0.75} alignItems="center" sx={{ flexShrink: 0 }}>
          <Dot color="#FF5F57" />
          <Dot color="#FEBC2E" />
          <Dot color="#28C840" />
        </Stack>
        <Typography
          variant="caption"
          sx={{
            ml: 0.5,
            fontFamily: "monospace",
            color: "text.secondary",
            flex: 1,
            minWidth: 0,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {title}
        </Typography>
        {badge && (
          <Chip
            label={badge}
            size="small"
            color="primary"
            variant="outlined"
            sx={{ height: 20, flexShrink: 0 }}
          />
        )}
      </Box>
      <Box sx={{ p: { xs: 2, sm: 2.5 } }}>{children}</Box>
    </Card>
  );
}

function Dot({ color }: { color: string }) {
  return <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: color }} />;
}
