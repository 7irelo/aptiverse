"use client";

// Shared visual language for the study-groups surface. The rest of the app
// leans flat; these groups are a social space, so they carry a graphite-to-pine
// gradient, a citron signature accent, and a little motion. Kept in one file so
// the list and the group workspace read as one product.

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { keyframes } from "@mui/system";
import type { Theme } from "@mui/material/styles";
import { alpha } from "@mui/material/styles";
import { Crown, Shield, Lock, Globe } from "lucide-react";

// A graphite slab warmed with a faint citron glow in the corner. Used behind
// the page hero and the group header so those bands feel lit rather than flat.
export function heroGradient(theme: Theme) {
  const dark = theme.palette.mode === "dark";
  const base = dark ? "#141519" : "#1B1D22";
  const mid = dark ? "#1E2024" : "#26282E";
  const citron = theme.palette.secondary.main;
  return {
    background: `radial-gradient(120% 140% at 100% 0%, ${alpha(citron, 0.22)} 0%, transparent 45%), linear-gradient(135deg, ${base} 0%, ${mid} 100%)`,
    color: "#F6F7F5",
  };
}

// A slim membership gauge. Citron while there is room; terracotta once full so a
// closed door reads instantly.
export function CapacityMeter({
  members,
  capacity,
  light = false,
}: {
  members: number;
  capacity: number;
  light?: boolean;
}) {
  const pct = capacity > 0 ? Math.min(100, Math.round((members / capacity) * 100)) : 0;
  const full = members >= capacity;
  return (
    <Box sx={{ minWidth: 0, width: "100%" }}>
      <Stack direction="row" justifyContent="space-between" alignItems="baseline" sx={{ mb: 0.5 }}>
        <Typography
          variant="caption"
          sx={{
            fontWeight: 600,
            color: light ? alpha("#F6F7F5", 0.9) : "text.secondary",
          }}
        >
          {members} of {capacity} {members === 1 ? "seat" : "seats"} taken
        </Typography>
        {full && (
          <Typography variant="caption" sx={{ fontWeight: 700, color: "warning.main" }}>
            Full
          </Typography>
        )}
      </Stack>
      <Box
        sx={{
          height: 6,
          borderRadius: 999,
          overflow: "hidden",
          bgcolor: light ? alpha("#F6F7F5", 0.18) : "action.hover",
        }}
      >
        <Box
          sx={(t) => ({
            height: "100%",
            width: `${pct}%`,
            borderRadius: 999,
            transition: "width .5s cubic-bezier(0.16,1,0.3,1)",
            background: full
              ? `linear-gradient(90deg, ${t.palette.warning.light}, ${t.palette.warning.main})`
              : `linear-gradient(90deg, ${t.palette.secondary.main}, ${t.palette.secondary.dark})`,
          })}
        />
      </Box>
    </Box>
  );
}

// Roles read as small badges rather than plain chips: the owner wears citron,
// admins a quieter outline, plain members nothing at all (the absence is the
// signal, keeping the roster calm).
export function RoleBadge({ role, light = false }: { role: string; light?: boolean }) {
  if (role === "owner") {
    return (
      <Badge tone="citron" icon={<Crown size={12} strokeWidth={2.5} />} label="Owner" light={light} />
    );
  }
  if (role === "admin") {
    return (
      <Badge tone="outline" icon={<Shield size={12} strokeWidth={2.5} />} label="Admin" light={light} />
    );
  }
  return null;
}

export function PrivacyBadge({ privacy, light = false }: { privacy: string; light?: boolean }) {
  return privacy === "invite" ? (
    <Badge tone="muted" icon={<Lock size={12} strokeWidth={2.5} />} label="Invite only" light={light} />
  ) : (
    <Badge tone="muted" icon={<Globe size={12} strokeWidth={2.5} />} label="Open" light={light} />
  );
}

function Badge({
  tone,
  icon,
  label,
  light,
}: {
  tone: "citron" | "outline" | "muted";
  icon: React.ReactNode;
  label: string;
  light: boolean;
}) {
  return (
    <Stack
      direction="row"
      spacing={0.5}
      alignItems="center"
      sx={(t) => {
        const styles = {
          citron: {
            bgcolor: t.palette.secondary.main,
            color: t.palette.secondary.contrastText,
            border: "none",
          },
          outline: {
            bgcolor: "transparent",
            color: light ? "#F6F7F5" : t.palette.text.primary,
            border: `1px solid ${light ? alpha("#F6F7F5", 0.4) : t.palette.divider}`,
          },
          muted: {
            bgcolor: light ? alpha("#F6F7F5", 0.14) : t.palette.action.hover,
            color: light ? alpha("#F6F7F5", 0.9) : t.palette.text.secondary,
            border: "none",
          },
        }[tone];
        return {
          px: 0.9,
          py: 0.35,
          borderRadius: 999,
          fontSize: "0.68rem",
          fontWeight: 700,
          letterSpacing: "0.02em",
          lineHeight: 1,
          whiteSpace: "nowrap",
          ...styles,
        };
      }}
    >
      {icon}
      <span>{label}</span>
    </Stack>
  );
}

// A gentle rise-in, used to stagger list rows. Honours reduced-motion by
// resolving to no transform when the user asks for less.
export const riseIn = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
`;

export function riseSx(index: number) {
  return {
    "@media (prefers-reduced-motion: no-preference)": {
      opacity: 0,
      animation: `${riseIn} .45s cubic-bezier(0.16,1,0.3,1) forwards`,
      animationDelay: `${Math.min(index, 8) * 45}ms`,
    },
  };
}
