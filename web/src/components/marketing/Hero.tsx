"use client";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { alpha, useTheme } from "@mui/material/styles";
import { GradientBackdrop } from "@/components/common/GradientBackdrop";
import Link from "next/link";
import { ArrowRight, Check, TrendingUp, Flame } from "lucide-react";
import { motion } from "framer-motion";

export function Hero() {
  return (
    <GradientBackdrop variant="hero">
      <Box
        sx={{
          maxWidth: 1240,
          mx: "auto",
          px: { xs: 2.5, sm: 4, lg: 6 },
          py: { xs: 6, md: 16 },
          position: "relative",
          zIndex: 1,
        }}
      >
        <Stack
          direction={{ xs: "column", lg: "row" }}
          spacing={{ xs: 5, lg: 10 }}
          alignItems="center"
        >
          <Stack spacing={{ xs: 2.5, md: 3.5 }} sx={{ flex: 1 }}>
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.05 }}
            >
              <Typography
                variant="h1"
                component="h1"
                sx={{
                  fontSize: { xs: "2.15rem", md: "3.75rem" },
                  letterSpacing: "-0.03em",
                  lineHeight: 1.05,
                }}
              >
                Get ahead without burning out.
              </Typography>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.1 }}
            >
              <Typography
                color="text.secondary"
                sx={{
                  maxWidth: 560,
                  fontSize: "1.0625rem",
                  lineHeight: 1.55,
                }}
              >
                Aptiverse helps you learn well and stay well, from your first
                term to your last exam.
              </Typography>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.15 }}
            >
              <Stack direction="row" spacing={1.25} flexWrap="wrap" useFlexGap>
                <Button
                  component={Link}
                  href="/register"
                  size="large"
                  variant="contained"
                  color="secondary"
                  endIcon={<ArrowRight size={18} />}
                >
                  Start free
                </Button>
                <Button
                  component={Link}
                  href="/features"
                  size="large"
                  variant="outlined"
                >
                  See how it works
                </Button>
              </Stack>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.25 }}
            >
              <Stack
                direction="row"
                spacing={3}
                flexWrap="wrap"
                useFlexGap
                sx={{ pt: 1 }}
              >
                {/* "Works offline" was here and was simply untrue: there is no
                    service worker, no local store, nothing. The other three
                    hold up. Curriculum-aware and wellbeing-first are real
                    surfaces, and MasteryController genuinely projects a term
                    mark from graded work, trend and mastery gap. */}
                {[
                  "Curriculum-aware",
                  "Wellbeing-first",
                  "Predicts your results",
                  "Free to start",
                ].map((t) => (
                  <Stack
                    key={t}
                    direction="row"
                    spacing={0.75}
                    alignItems="center"
                  >
                    <Box sx={{ color: "primary.main", display: "flex" }}>
                      <Check size={14} />
                    </Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontSize: "0.8125rem" }}
                    >
                      {t}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </motion.div>
          </Stack>

          <Box sx={{ flex: 1, width: "100%" }}>
            <HeroPreview />
          </Box>
        </Stack>
      </Box>
    </GradientBackdrop>
  );
}

function HeroPreview() {
  const theme = useTheme();
  const dark = theme.palette.mode === "dark";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: 0.2 }}
    >
      <Box
        sx={{
          position: "relative",
          width: "100%",
          maxWidth: 540,
          mx: "auto",
          borderRadius: 2,
          overflow: "hidden",
          border: 1,
          borderColor: "divider",
          bgcolor: "background.paper",
          boxShadow: dark
            ? "0 1px 0 rgba(255,255,255,0.04), 0 24px 48px -16px rgba(0,0,0,0.5)"
            : "0 1px 0 rgba(15,23,42,0.04), 0 24px 48px -20px rgba(15,23,42,0.18)",
        }}
      >
        {/* Header bar, restrained */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{
            px: 2.5,
            py: 1.25,
            borderBottom: 1,
            borderColor: "divider",
            bgcolor: alpha(theme.palette.text.primary, 0.015),
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: "text.secondary",
              fontWeight: 500,
              letterSpacing: "0.02em",
            }}
          >
            Dashboard
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Semester 2 · Week 6
          </Typography>
        </Stack>

        <Box sx={{ p: 2.5 }}>
          <Stack spacing={0.5} sx={{ mb: 2.5 }}>
            <Typography variant="caption" color="text.secondary">
              Statistics · Assignment
            </Typography>
            <Typography
              variant="h5"
              sx={{ fontWeight: 600, letterSpacing: "-0.015em" }}
            >
              On track, predicted{" "}
              <Box component="span" sx={{ color: "primary.main" }}>
                74%
              </Box>
            </Typography>
          </Stack>

          {/* Metric row */}
          <Stack direction="row" spacing={1.5} sx={{ mb: 2.5 }}>
            <MetricTile
              label="Mastery"
              value="71%"
              hint="+4 this semester"
              icon={<TrendingUp size={14} />}
              positive
            />
            <MetricTile
              label="Streak"
              value="12d"
              hint="Personal best"
              icon={<Flame size={14} />}
            />
            <MetricTile label="Average" value="74%" hint="+3" positive />
          </Stack>

          {/* Mini bar / progress strip */}
          <Box sx={{ mb: 2 }}>
            <Stack
              direction="row"
              justifyContent="space-between"
              sx={{ mb: 0.75 }}
            >
              <Typography variant="caption" color="text.secondary">
                Rubric coverage
              </Typography>
              <Typography
                variant="caption"
                sx={{ fontWeight: 600, color: "text.primary" }}
              >
                3 / 4
              </Typography>
            </Stack>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 0.75,
              }}
            >
              {[true, true, true, false].map((on, i) => (
                <Box
                  key={i}
                  sx={{
                    height: 6,
                    borderRadius: 999,
                    bgcolor: on
                      ? "primary.main"
                      : alpha(theme.palette.text.primary, 0.08),
                  }}
                />
              ))}
            </Box>
          </Box>

          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{
              p: 1.25,
              borderRadius: 1.25,
              border: 1,
              borderColor: "divider",
              bgcolor: alpha(theme.palette.primary.main, 0.04),
            }}
          >
            <Box
              sx={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                bgcolor: "primary.main",
              }}
            />
            <Typography
              variant="caption"
              sx={{ color: "text.primary", fontWeight: 500 }}
            >
              Next: 25 minute drill on hypothesis testing
            </Typography>
          </Stack>
        </Box>
      </Box>
    </motion.div>
  );
}

function MetricTile({
  label,
  value,
  hint,
  icon,
  positive,
}: {
  label: string;
  value: string;
  hint?: string;
  icon?: React.ReactNode;
  positive?: boolean;
}) {
  return (
    <Box
      sx={{
        flex: 1,
        p: 1.25,
        borderRadius: 1.25,
        border: 1,
        borderColor: "divider",
      }}
    >
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: "block", lineHeight: 1.2 }}
      >
        {label}
      </Typography>
      <Typography
        sx={{
          fontWeight: 600,
          fontSize: "1.125rem",
          letterSpacing: "-0.01em",
          mt: 0.25,
        }}
      >
        {value}
      </Typography>
      {hint && (
        <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.5 }}>
          {icon && (
            <Box
              sx={{
                color: positive ? "success.main" : "text.secondary",
                display: "flex",
              }}
            >
              {icon}
            </Box>
          )}
          <Typography
            variant="caption"
            sx={{
              color: positive ? "success.main" : "text.secondary",
              fontWeight: 500,
              fontSize: "0.6875rem",
            }}
          >
            {hint}
          </Typography>
        </Stack>
      )}
    </Box>
  );
}
