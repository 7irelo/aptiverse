"use client";

import { useState } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import Chip from "@mui/material/Chip";
import { PageHeader } from "@/components/common/PageHeader";
import { DIARY_ENTRIES } from "@/lib/mockData";
import { formatDate, formatRelative } from "@/lib/format";

const MOOD_EMOJI: Record<number, { emoji: string; label: string; color: string }> = {
  1: { emoji: "😞", label: "Really tough", color: "#D14B4B" },
  2: { emoji: "😕", label: "Down", color: "#E89D14" },
  3: { emoji: "😐", label: "Okay", color: "#9FB1C2" },
  4: { emoji: "🙂", label: "Good", color: "#3D9762" },
  5: { emoji: "😊", label: "Great", color: "#1F8079" },
};

export default function DiaryPage() {
  const [entry, setEntry] = useState("");
  const [mood, setMood] = useState<1 | 2 | 3 | 4 | 5 | null>(null);

  return (
    <>
      <PageHeader
        title="Diary"
        description="Private space to think out loud — wins, gripes, gratitude. AI nudges you with prompts; nothing leaves your device unless you say so."
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Diary" }]}
      />

      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Today's check-in
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            How are you feeling — really?
          </Typography>
          <Stack direction="row" spacing={1.5} sx={{ mb: 3 }}>
            {([1, 2, 3, 4, 5] as const).map((n) => {
              const selected = mood === n;
              return (
                <Box
                  key={n}
                  onClick={() => setMood(n)}
                  sx={{
                    flex: 1,
                    py: 2,
                    borderRadius: 2,
                    border: 2,
                    borderColor: selected ? MOOD_EMOJI[n].color : "divider",
                    cursor: "pointer",
                    textAlign: "center",
                    transition: "all 150ms",
                    bgcolor: selected ? `${MOOD_EMOJI[n].color}10` : "transparent",
                    "&:hover": { borderColor: MOOD_EMOJI[n].color },
                  }}
                >
                  <Typography sx={{ fontSize: "1.75rem" }}>{MOOD_EMOJI[n].emoji}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {MOOD_EMOJI[n].label}
                  </Typography>
                </Box>
              );
            })}
          </Stack>
          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder="What's on your mind today? It's just for you."
            value={entry}
            onChange={(e) => setEntry(e.target.value)}
          />
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Try a prompt:
            </Typography>
            {["What went well?", "What's stressing me?", "What am I grateful for?", "What's one small win?"].map((p) => (
              <Chip key={p} label={p} size="small" variant="outlined" onClick={() => setEntry((e) => (e ? `${e}\n\n${p}\n` : `${p}\n`))} clickable />
            ))}
          </Stack>
          <Stack direction="row" justifyContent="flex-end" sx={{ mt: 2 }}>
            <Button variant="contained">Save entry</Button>
          </Stack>
        </CardContent>
      </Card>

      <Typography variant="h6" sx={{ mb: 2 }}>
        Recent entries
      </Typography>
      <Stack spacing={2}>
        {DIARY_ENTRIES.map((e) => {
          const m = MOOD_EMOJI[e.mood];
          return (
            <Card key={e.id}>
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Typography sx={{ fontSize: "1.75rem" }}>{m.emoji}</Typography>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {formatDate(e.date)} · {formatRelative(e.date)}
                      </Typography>
                      <Typography variant="caption" sx={{ color: m.color, fontWeight: 600 }}>
                        {m.label}
                      </Typography>
                    </Box>
                  </Stack>
                  <Stack direction="row" spacing={0.75}>
                    {e.tags.map((t) => (
                      <Chip key={t} label={t} size="small" variant="outlined" />
                    ))}
                  </Stack>
                </Stack>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
                  {e.content}
                </Typography>
              </CardContent>
            </Card>
          );
        })}
      </Stack>
    </>
  );
}
