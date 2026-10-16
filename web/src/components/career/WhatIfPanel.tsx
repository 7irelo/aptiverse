"use client";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Slider from "@mui/material/Slider";
import { alpha } from "@mui/material/styles";
import { FlaskConical, RotateCcw } from "lucide-react";

// What-if.
//
// "If I land 55 in Maths instead of 70, which of my plans still work?"
//
// Against the student's own entered plans that question is arithmetic, not
// prediction, and the distinction is the only reason this is allowed to exist.
// We are not forecasting their mark. They supply the hypothetical, we
// re-run the same comparison we always run and re-sort the same list. Nothing
// here is modelled and nothing is saved: the moment they reset, the real
// numbers are back.
//
// It drives the triage list directly rather than rendering a second list of
// its own. One sorted list that answers "where do I stand", now able to answer
// "where would I stand", is worth more than two lists that can disagree.

export type WhatIfUnit = {
  id: string;
  name: string;
  /** Their real standing, so the hypothetical can be shown against it. */
  actual: number | null;
};

export type WhatIfPanelProps = {
  units: WhatIfUnit[];
  overrides: Record<string, number>;
  onChange: (unitId: string, value: number) => void;
  onReset: () => void;
};

export function WhatIfPanel({ units, overrides, onChange, onReset }: WhatIfPanelProps) {
  const active = Object.keys(overrides).length > 0;

  return (
    <Card
      variant="outlined"
      sx={{
        borderColor: active ? "secondary.main" : undefined,
        bgcolor: (t) => (active ? alpha(t.palette.secondary.main, 0.06) : undefined),
      }}
    >
      <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
        <Stack
          direction="row"
          spacing={1.5}
          alignItems="flex-start"
          justifyContent="space-between"
          sx={{ mb: 2 }}
        >
          <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ minWidth: 0 }}>
            <Box sx={{ color: "text.secondary", flexShrink: 0, pt: 0.25 }}>
              <FlaskConical size={18} />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                What if
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Move a mark and the list above re-sorts. Nothing is saved.
              </Typography>
            </Box>
          </Stack>
          {active && (
            <Button size="small" startIcon={<RotateCcw size={14} />} onClick={onReset} sx={{ flexShrink: 0 }}>
              Reset
            </Button>
          )}
        </Stack>

        <Stack spacing={2.5}>
          {units.map((u) => {
            const value = overrides[u.id] ?? u.actual ?? 50;
            const changed = overrides[u.id] !== undefined;
            return (
              <Box key={u.id}>
                <Stack direction="row" spacing={1} alignItems="baseline" sx={{ mb: 0.25 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, flex: 1, minWidth: 0 }} noWrap>
                    {u.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 700,
                      fontVariantNumeric: "tabular-nums",
                      color: changed ? "secondary.dark" : "text.primary",
                    }}
                  >
                    {value}%
                  </Typography>
                </Stack>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
                  {u.actual === null
                    ? "No marks yet, so drag to try a number"
                    : changed
                      ? `Really at ${u.actual}%`
                      : `Currently at ${u.actual}%`}
                </Typography>
                <Slider
                  size="small"
                  value={value}
                  min={0}
                  max={100}
                  step={1}
                  color={changed ? "secondary" : "primary"}
                  valueLabelDisplay="auto"
                  aria-label={`Hypothetical mark for ${u.name}`}
                  onChange={(_e, v) => onChange(u.id, Array.isArray(v) ? v[0] : v)}
                />
              </Box>
            );
          })}
        </Stack>
      </CardContent>
    </Card>
  );
}
