"use client";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import { alpha, useTheme } from "@mui/material/styles";
import WorkOutlineIcon from "@mui/icons-material/WorkOutlineOutlined";
import { TrendingUp, ArrowRight, TrendingDown, Target } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { QueryStates } from "@/components/common/QueryStates";
import { ProgressRing } from "@/components/common/ProgressRing";
import { useCareers, useAcademicUnits } from "@/lib/api/queries";
import type { Career } from "@/lib/mockData";
import Link from "next/link";

const GROWTH: Record<
  Career["growth"],
  { label: string; color: "success" | "primary" | "warning"; Icon: typeof TrendingUp }
> = {
  high: { label: "High growth", color: "success", Icon: TrendingUp },
  medium: { label: "Steady growth", color: "primary", Icon: ArrowRight },
  low: { label: "Limited growth", color: "warning", Icon: TrendingDown },
};

function matchColor(score: number): "success" | "primary" | "warning" {
  if (score >= 80) return "success";
  if (score >= 60) return "primary";
  return "warning";
}

export default function CareerPage() {
  const query = useCareers();
  const academic = useAcademicUnits();

  return (
    <>
      <PageHeader
        title="Career navigator"
        description="Match your strengths to real careers, then plan backwards to the marks and skills that get you there."
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Career" }]}
        actions={
          <Button
            component={Link}
            href="/dashboard/goals"
            variant="contained"
            color="secondary"
            startIcon={<Target size={16} />}
          >
            Set a career goal
          </Button>
        }
      />

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <QueryStates
            query={query}
            empty={{
              icon: <WorkOutlineIcon />,
              title: "No career matches yet",
              description: `Add your ${academic.unitNounPlural} and a few interests, and we'll surface careers that fit your strengths.`,
              size: "compact",
              action: (
                <Button variant="contained" component={Link} href={academic.addHref}>
                  Add {academic.unitNounPlural}
                </Button>
              ),
            }}
          >
            {(careers) => <CareerMatches careers={careers} />}
          </QueryStates>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Stack spacing={3}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="overline" color="primary.main">
                  Plan backwards
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                  Turn a match into a plan
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1.75 }}>
                  Pick a career you're drawn to and set it as a goal. We'll track the {academic.unitNoun}s
                  and marks that matter most for it.
                </Typography>
                <Button
                  component={Link}
                  href="/dashboard/goals"
                  variant="outlined"
                  size="small"
                  fullWidth
                >
                  Set a career goal
                </Button>
              </CardContent>
            </Card>

            <InfoCard
              title="Financial literacy"
              body="Short reads on making smart money decisions as you start out. Coming soon."
            />
            <InfoCard
              title="Day in the life"
              body="Real stories from SA professionals across fields. Coming soon."
            />
          </Stack>
        </Grid>
      </Grid>
    </>
  );
}

function CareerMatches({ careers }: { careers: Career[] }) {
  const sorted = [...careers].sort((a, b) => b.matchScore - a.matchScore);
  const [top, ...rest] = sorted;

  return (
    <Stack spacing={3}>
      {top && <TopMatchCard c={top} />}
      {rest.length > 0 && (
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              More matches
            </Typography>
            <Stack spacing={1.5}>
              {rest.map((c) => (
                <CareerRow key={c.id} c={c} />
              ))}
            </Stack>
          </CardContent>
        </Card>
      )}
    </Stack>
  );
}

function TopMatchCard({ c }: { c: Career }) {
  const theme = useTheme();
  const tint = theme.palette[matchColor(c.matchScore)].main;

  return (
    <Card sx={{ border: 1, borderColor: alpha(tint, 0.4), bgcolor: alpha(tint, 0.04) }}>
      <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
        <Typography variant="overline" sx={{ color: tint, fontWeight: 700 }}>
          Your top match
        </Typography>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={{ xs: 2.5, sm: 4 }}
          alignItems={{ xs: "flex-start", sm: "center" }}
          sx={{ mt: 1 }}
        >
          <ProgressRing
            value={c.matchScore}
            size={128}
            thickness={11}
            color={matchColor(c.matchScore)}
            label={
              <Box sx={{ textAlign: "center" }}>
                <Typography sx={{ fontWeight: 800, fontSize: "1.6rem", lineHeight: 1 }}>
                  {c.matchScore}%
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  match
                </Typography>
              </Box>
            }
          />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              {c.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.25 }}>
              {c.field} · {c.averageSalary}
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 1.5 }}>
              <GrowthChip career={c} />
              {c.requirements.map((r) => (
                <Chip key={r} label={r} size="small" variant="outlined" />
              ))}
            </Stack>
            <Button
              component={Link}
              href="/dashboard/goals"
              variant="contained"
              size="small"
              startIcon={<Target size={16} />}
            >
              Work toward this
            </Button>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

function CareerRow({ c }: { c: Career }) {
  const theme = useTheme();
  const tint = theme.palette[matchColor(c.matchScore)].main;

  return (
    <Stack
      direction="row"
      spacing={2}
      alignItems="center"
      sx={{ p: 1.5, border: 1, borderColor: "divider", borderRadius: 2 }}
    >
      <Box
        sx={{
          width: 52,
          height: 52,
          flexShrink: 0,
          borderRadius: "50%",
          display: "grid",
          placeItems: "center",
          color: tint,
          bgcolor: alpha(tint, 0.14),
          fontWeight: 800,
          fontSize: "0.95rem",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {c.matchScore}%
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }} noWrap>
          {c.title}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {c.field} · {c.averageSalary}
        </Typography>
        <Box sx={{ mt: 0.75 }}>
          <GrowthChip career={c} />
        </Box>
      </Box>
    </Stack>
  );
}

function GrowthChip({ career }: { career: Career }) {
  const g = GROWTH[career.growth];
  return (
    <Chip
      icon={<g.Icon size={14} />}
      label={g.label}
      size="small"
      color={g.color}
      variant="outlined"
      sx={{ fontWeight: 600, "& .MuiChip-icon": { ml: 0.75 } }}
    />
  );
}

function InfoCard({ title, body }: { title: string; body: string }) {
  return (
    <Card>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {body}
        </Typography>
      </CardContent>
    </Card>
  );
}
