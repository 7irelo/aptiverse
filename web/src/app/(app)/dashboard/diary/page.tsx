"use client";

import { useState } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Chip from "@mui/material/Chip";
import Alert from "@mui/material/Alert";
import EditNoteIcon from "@mui/icons-material/EditNoteOutlined";
import SentimentVeryDissatisfiedIcon from "@mui/icons-material/SentimentVeryDissatisfiedOutlined";
import SentimentDissatisfiedIcon from "@mui/icons-material/SentimentDissatisfiedOutlined";
import SentimentNeutralIcon from "@mui/icons-material/SentimentNeutralOutlined";
import SentimentSatisfiedIcon from "@mui/icons-material/SentimentSatisfiedOutlined";
import SentimentVerySatisfiedIcon from "@mui/icons-material/SentimentVerySatisfiedOutlined";
import type { SvgIconComponent } from "@mui/icons-material";
import { alpha, type Theme } from "@mui/material/styles";
import { PageHeader } from "@/components/common/PageHeader";
import { QueryStates } from "@/components/common/QueryStates";
import { useDiaryEntries, useLogDiary } from "@/lib/api/queries";
import type { DiaryEntry } from "@/lib/mockData";
import { formatDate, formatRelative } from "@/lib/format";
import { RelativeTime } from "@/components/common/RelativeTime";
import { AtmosphericBackdrop } from "@/components/common/AtmosphericBackdrop";

// Mood scale as face icons (not emojis), on a supportive valence gradient in
// brand tokens: clay/terracotta for the low end (never a punitive red), forest
// green for the good end, neutral in the middle.
const MOOD: Record<number, { Icon: SvgIconComponent; label: string; color: string }> = {
  1: { Icon: SentimentVeryDissatisfiedIcon, label: "Really tough", color: "warning.dark" },
  2: { Icon: SentimentDissatisfiedIcon, label: "Down", color: "warning.main" },
  3: { Icon: SentimentNeutralIcon, label: "Okay", color: "text.secondary" },
  4: { Icon: SentimentSatisfiedIcon, label: "Good", color: "success.light" },
  5: { Icon: SentimentVerySatisfiedIcon, label: "Great", color: "success.main" },
};

// Resolve a "family.shade" token to its hex so it can be alpha-tinted.
const moodColor = (t: Theme, path: string): string => {
  const [fam, shade = "main"] = path.split(".");
  const family = (t.palette as unknown as Record<string, Record<string, string>>)[fam];
  return family?.[shade] ?? path;
};

export default function DiaryPage() {
  const query = useDiaryEntries();

  return (
    <AtmosphericBackdrop>
      <PageHeader
        title="Diary"
        description="Private space to think out loud — wins, gripes, gratitude. AI nudges you with prompts; nothing leaves your device unless you say so."
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Diary" }]}
      />

      <CheckIn />

      <Typography variant="h6" sx={{ mb: 2 }}>
        Recent entries
      </Typography>

      <QueryStates
        query={query}
        empty={{
          icon: <EditNoteIcon />,
          title: "No diary entries yet",
          description: "Your first check-in above will appear here. Daily entries help us spot stress trends early.",
        }}
      >
        {(entries) => <EntriesList entries={entries} />}
      </QueryStates>
    </AtmosphericBackdrop>
  );
}

function CheckIn() {
  const [entry, setEntry] = useState("");
  const [mood, setMood] = useState<1 | 2 | 3 | 4 | 5 | null>(null);
  const log = useLogDiary();

  const save = () => {
    if (!mood || !entry.trim() || log.isPending) return;
    log.mutate(
      { mood, content: entry.trim() },
      {
        onSuccess: () => {
          setEntry("");
          setMood(null);
        },
      },
    );
  };

  return (
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
            const m = MOOD[n];
            return (
              <Box
                key={n}
                onClick={() => setMood(n)}
                role="button"
                aria-pressed={selected}
                aria-label={m.label}
                sx={{
                  flex: 1,
                  py: 2,
                  borderRadius: 2,
                  border: 2,
                  borderColor: selected ? m.color : "divider",
                  color: selected ? m.color : "text.secondary",
                  cursor: "pointer",
                  textAlign: "center",
                  transition: "all 150ms",
                  bgcolor: selected ? (t) => alpha(moodColor(t, m.color), 0.1) : "transparent",
                  "&:hover": { borderColor: m.color },
                }}
              >
                <m.Icon sx={{ fontSize: 28 }} />
                <Typography
                  variant="caption"
                  sx={{ display: "block", color: "inherit", fontWeight: selected ? 600 : 400 }}
                >
                  {m.label}
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
            <Chip
              key={p}
              label={p}
              size="small"
              variant="outlined"
              onClick={() => setEntry((e) => (e ? `${e}\n\n${p}\n` : `${p}\n`))}
              clickable
            />
          ))}
        </Stack>
        {log.isError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            Could not save your entry. Please try again.
          </Alert>
        )}
        <Stack direction="row" justifyContent="flex-end" sx={{ mt: 2 }}>
          <Button
            variant="contained"
            onClick={save}
            disabled={!mood || !entry.trim() || log.isPending}
          >
            {log.isPending ? "Saving..." : "Save entry"}
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}

function EntriesList({ entries }: { entries: DiaryEntry[] }) {
  return (
    <Stack spacing={2}>
      {entries.map((e) => {
        const m = MOOD[e.mood];
        return (
          <Card key={e.id}>
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Box sx={{ color: m.color, display: "grid", placeItems: "center" }}>
                    <m.Icon sx={{ fontSize: 28 }} />
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {formatDate(e.date)} · <RelativeTime iso={e.date} />
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
  );
}
