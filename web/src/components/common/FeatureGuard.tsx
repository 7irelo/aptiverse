"use client";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Skeleton from "@mui/material/Skeleton";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Link from "next/link";
import { useFeatures } from "@/lib/hooks/useFeature";
import { FEATURE_MIN_PLAN, PLAN_LABELS, type FeatureKey } from "@/lib/features";

export type FeatureGuardProps = {
  feature: FeatureKey | FeatureKey[];
  // any: pass if user has ANY of the listed features. Default is ALL.
  any?: boolean;
  children: React.ReactNode;
  // Override the default "upgrade" card.
  fallback?: React.ReactNode;
  // Compact variant for inline gating (e.g. a single locked button).
  variant?: "card" | "inline";
  // Where the upgrade CTA points. Defaults to the in-app billing page so a
  // signed-in user lands on their plan picker, not the signup funnel. Pass
  // the role's billing route on parent/tutor pages (e.g. "/parent/billing").
  upgradeHref?: string;
};

// Gates children on the user's feature entitlements. When the user
// doesn't have the feature, renders an Upgrade CTA pointing at the
// pricing page (or a custom fallback). The minimum plan needed is
// inferred from FEATURE_MIN_PLAN.
export function FeatureGuard({
  feature,
  any,
  children,
  fallback,
  variant = "card",
  upgradeHref = "/dashboard/billing",
}: FeatureGuardProps) {
  const { has, hasAny, hasAll, ready } = useFeatures();
  const features = Array.isArray(feature) ? feature : [feature];

  const allowed = features.length === 1
    ? has(features[0])
    : any
      ? hasAny(features)
      : hasAll(features);

  if (allowed) return <>{children}</>;

  // Entitlements still resolving: don't flash a denial while only the
  // (possibly stale) session is known. Wait for the real plan to load.
  if (!ready) {
    return variant === "inline" ? null : (
      <Skeleton variant="rounded" sx={{ maxWidth: 520, mx: "auto", my: 4, height: 220 }} />
    );
  }

  if (fallback !== undefined) return <>{fallback}</>;

  // Suggest the lowest plan that unlocks the (first listed) feature.
  const minPlan = FEATURE_MIN_PLAN[features[0]] ?? "student.pro";
  const planLabel = PLAN_LABELS[minPlan];

  if (variant === "inline") {
    return (
      <Stack direction="row" spacing={1} alignItems="center">
        <LockOutlinedIcon fontSize="small" sx={{ color: "text.disabled" }} />
        <Typography variant="body2" color="text.secondary">
          {planLabel} plan unlocks this.
        </Typography>
        <Button component={Link} href={upgradeHref} size="small" variant="text">
          Upgrade
        </Button>
      </Stack>
    );
  }

  return (
    <Card sx={{ maxWidth: 520, mx: "auto", my: 4 }}>
      <CardContent sx={{ p: 4 }}>
        <Stack spacing={2} alignItems="center" textAlign="center">
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              bgcolor: "action.hover",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <LockOutlinedIcon sx={{ color: "primary.main", fontSize: 28 }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Available on the {planLabel} plan
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This feature is part of Aptiverse {planLabel}. Upgrade to unlock — you can switch back any time.
          </Typography>
          <Stack direction="row" spacing={1.5}>
            <Button component={Link} href={upgradeHref} variant="contained">
              Upgrade
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
