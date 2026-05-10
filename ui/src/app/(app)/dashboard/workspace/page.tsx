"use client";

import { useEffect, useRef, useState } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import Chip from "@mui/material/Chip";
import LinearProgress from "@mui/material/LinearProgress";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Tooltip from "@mui/material/Tooltip";
import Avatar from "@mui/material/Avatar";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import UploadIcon from "@mui/icons-material/UploadFileOutlined";
import MicIcon from "@mui/icons-material/MicNoneOutlined";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import SendIcon from "@mui/icons-material/Send";
import CheckCircleIcon from "@mui/icons-material/CheckCircleOutline";
import CircleIcon from "@mui/icons-material/CircleOutlined";
import { PageHeader } from "@/components/common/PageHeader";
import { ASSESSMENTS, SAMPLE_CHAT, SUBJECTS } from "@/lib/mockData";

const TABS = ["Notes", "Essay", "Scratchpad", "Files", "Practice"] as const;
type TabKey = (typeof TABS)[number];

export default function WorkspacePage() {
  const [tab, setTab] = useState<TabKey>("Notes");
  const [activeAssessmentId, setActiveAssessmentId] = useState(ASSESSMENTS[1].id);
  const activeAssessment = ASSESSMENTS.find((a) => a.id === activeAssessmentId)!;
  const subject = SUBJECTS.find((s) => s.id === activeAssessment.subjectId)!;

  return (
    <>
      <PageHeader
        title="Workspace"
        description="Your unified space to write, plan, drill, and ask. Autosave on. Let's go."
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Workspace" }]}
        actions={
          <>
            <TextField
              select
              size="small"
              value={activeAssessmentId}
              onChange={(e) => setActiveAssessmentId(e.target.value)}
              sx={{ minWidth: 260 }}
            >
              {ASSESSMENTS.filter((a) => a.status !== "graded").map((a) => (
                <MenuItem key={a.id} value={a.id}>
                  {SUBJECTS.find((s) => s.id === a.subjectId)?.name} · {a.title}
                </MenuItem>
              ))}
            </TextField>
            <Tooltip title="Distraction-free">
              <IconButton>
                <FullscreenIcon />
              </IconButton>
            </Tooltip>
          </>
        }
      />

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "280px 1fr 340px" },
          gap: 3,
          alignItems: "start",
        }}
      >
        <LeftRail subject={subject.name} assessmentTitle={activeAssessment.title} />

        <Card sx={{ minHeight: 620 }}>
          <CardContent sx={{ p: 0, pb: "0 !important" }}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ px: 2, borderBottom: 1, borderColor: "divider" }}
            >
              <Tabs
                value={tab}
                onChange={(_, v) => setTab(v)}
                variant="scrollable"
                scrollButtons={false}
              >
                {TABS.map((t) => (
                  <Tab key={t} label={t} value={t} />
                ))}
              </Tabs>
              <Stack direction="row" spacing={0.5}>
                <Tooltip title="Upload file">
                  <IconButton size="small">
                    <UploadIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Voice note">
                  <IconButton size="small">
                    <MicIcon />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Stack>
            <Box sx={{ p: 3 }}>
              {tab === "Notes" && <NotesPanel />}
              {tab === "Essay" && <EssayPanel />}
              {tab === "Scratchpad" && <ScratchpadPanel />}
              {tab === "Files" && <FilesPanel />}
              {tab === "Practice" && <PracticePanel />}
            </Box>
          </CardContent>
        </Card>

        <RightRail />
      </Box>
    </>
  );
}

function LeftRail({ subject, assessmentTitle }: { subject: string; assessmentTitle: string }) {
  return (
    <Stack spacing={2.5} sx={{ position: "sticky", top: 88 }}>
      <Card>
        <CardContent sx={{ p: 2.5 }}>
          <Typography variant="overline" color="text.secondary">
            Active SBA
          </Typography>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 0.5 }}>
            {assessmentTitle}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {subject}
          </Typography>
          <Stack direction="row" spacing={0.75} sx={{ mt: 1.5 }}>
            <Chip label="Due in 3 days" size="small" color="warning" variant="outlined" />
            <Chip label="Weight 10%" size="small" variant="outlined" />
          </Stack>
        </CardContent>
      </Card>

      <FocusTimer />

      <Card>
        <CardContent sx={{ p: 2.5 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
            Today's checklist
          </Typography>
          <List disablePadding>
            {[
              { done: true, label: "Outline structure" },
              { done: true, label: "Write intro paragraph" },
              { done: false, label: "Add 3 evidence points" },
              { done: false, label: "Conclusion + CTA" },
              { done: false, label: "Self-check against rubric" },
            ].map((item) => (
              <ListItem key={item.label} disableGutters disablePadding>
                <ListItemIcon sx={{ minWidth: 28 }}>
                  {item.done ? (
                    <CheckCircleIcon sx={{ color: "primary.main", fontSize: 20 }} />
                  ) : (
                    <CircleIcon sx={{ color: "text.disabled", fontSize: 20 }} />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    variant: "body2",
                    sx: {
                      textDecoration: item.done ? "line-through" : "none",
                      color: item.done ? "text.disabled" : "text.primary",
                    },
                  }}
                />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
    </Stack>
  );
}

function FocusTimer() {
  const [secs, setSecs] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const ref = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (running) {
      ref.current = setInterval(() => setSecs((s) => Math.max(0, s - 1)), 1000);
    } else if (ref.current) {
      clearInterval(ref.current);
    }
    return () => {
      if (ref.current) clearInterval(ref.current);
    };
  }, [running]);

  const m = Math.floor(secs / 60);
  const s = secs % 60;
  const pct = ((25 * 60 - secs) / (25 * 60)) * 100;

  return (
    <Card>
      <CardContent sx={{ p: 2.5 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          Pomodoro · 25 min
        </Typography>
        <Typography variant="h3" sx={{ fontWeight: 700, fontVariantNumeric: "tabular-nums", my: 1 }}>
          {String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}
        </Typography>
        <LinearProgress variant="determinate" value={pct} sx={{ mb: 2 }} />
        <Stack direction="row" spacing={1}>
          <Button
            startIcon={running ? <PauseIcon /> : <PlayArrowIcon />}
            variant="contained"
            fullWidth
            onClick={() => setRunning((r) => !r)}
          >
            {running ? "Pause" : "Start"}
          </Button>
          <IconButton onClick={() => { setRunning(false); setSecs(25 * 60); }}>
            <RestartAltIcon />
          </IconButton>
        </Stack>
      </CardContent>
    </Card>
  );
}

function NotesPanel() {
  return (
    <TextField
      fullWidth
      multiline
      minRows={20}
      placeholder="Start typing your notes… autosave is on."
      defaultValue={`# Argumentative Essay — Social Media\n\n## Outline\n- Introduction: Hook + claim\n- Body 1: Mental health impact (cite source)\n- Body 2: Connection vs isolation paradox\n- Body 3: Counterargument (productivity, voice)\n- Conclusion: A balanced call to action\n\n## Notes from Mr. Dlamini\n- Make sure to engage with at least one counter-argument.\n- Quote at least 2 sources.`}
      sx={{
        "& .MuiOutlinedInput-root": { bgcolor: "transparent", border: 0 },
        "& fieldset": { border: 0 },
        "& textarea": { fontFamily: "ui-monospace, 'SF Mono', Menlo, monospace", fontSize: "0.95rem" },
      }}
    />
  );
}

function EssayPanel() {
  return (
    <Stack spacing={2}>
      <TextField fullWidth label="Title" defaultValue="The Thin Line: Connection and Isolation in the Age of Social Media" />
      <TextField
        fullWidth
        multiline
        minRows={18}
        placeholder="Open with a hook your reader can't ignore…"
        defaultValue={`We post to be seen. We scroll to escape being unseen. The paradox of social media is that the more connected we appear, the lonelier the average teenager becomes — and yet the same platforms power movements, surface unheard voices and bring families across continents into the same living room.\n\nThis essay argues that…`}
        sx={{
          "& textarea": { fontSize: "1rem", lineHeight: 1.7 },
        }}
      />
      <Stack direction="row" spacing={1.5} justifyContent="space-between" alignItems="center">
        <Typography variant="caption" color="text.secondary">
          312 / ~800 words · readability: Grade 11
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined">Self-check rubric</Button>
          <Button variant="contained">Submit draft</Button>
        </Stack>
      </Stack>
    </Stack>
  );
}

function ScratchpadPanel() {
  return (
    <Box
      sx={{
        height: 480,
        borderRadius: 2,
        border: 1,
        borderColor: "divider",
        bgcolor: (t) => (t.palette.mode === "dark" ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)"),
        display: "grid",
        placeItems: "center",
        position: "relative",
        overflow: "hidden",
        backgroundImage: (t) =>
          `linear-gradient(${t.palette.divider} 1px, transparent 1px),
           linear-gradient(90deg, ${t.palette.divider} 1px, transparent 1px)`,
        backgroundSize: "32px 32px",
      }}
    >
      <Typography color="text.secondary" sx={{ p: 2, textAlign: "center" }}>
        Math scratchpad — scribble derivatives, sketch graphs, type LaTeX. <br />
        Press the pen icon to start drawing.
      </Typography>
    </Box>
  );
}

function FilesPanel() {
  const files = [
    { name: "Equilibrium SBA Brief.pdf", size: "248 KB", date: "Today" },
    { name: "Calculus past paper 2024.pdf", size: "1.4 MB", date: "Yesterday" },
    { name: "Essay outline.docx", size: "21 KB", date: "Yesterday" },
  ];
  return (
    <Stack spacing={2}>
      <Box
        sx={{
          border: 2,
          borderStyle: "dashed",
          borderColor: "divider",
          borderRadius: 2,
          p: 5,
          textAlign: "center",
          color: "text.secondary",
        }}
      >
        <UploadIcon sx={{ fontSize: 36, mb: 1, color: "primary.main" }} />
        <Typography>Drag files here or click to upload</Typography>
        <Typography variant="caption">PDF, DOCX, JPG, PNG · up to 25MB</Typography>
      </Box>
      <Stack spacing={1}>
        {files.map((f) => (
          <Card key={f.name} variant="outlined">
            <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar variant="rounded" sx={{ bgcolor: "action.hover", color: "primary.main" }}>📄</Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {f.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {f.size} · {f.date}
                  </Typography>
                </Box>
                <Button size="small" variant="outlined">
                  Open
                </Button>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Stack>
  );
}

function PracticePanel() {
  return (
    <Box
      sx={{
        py: 6,
        textAlign: "center",
      }}
    >
      <Typography variant="h6" gutterBottom>
        Embed an active practice attempt
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, maxWidth: 480, mx: "auto" }}>
        Continue a paused practice test, or start a new one aligned to this SBA.
      </Typography>
      <Button variant="contained" size="large">
        Start chain rule sprint (12 min)
      </Button>
    </Box>
  );
}

function RightRail() {
  const [messages, setMessages] = useState(SAMPLE_CHAT);
  const [input, setInput] = useState("");

  return (
    <Stack spacing={2.5} sx={{ position: "sticky", top: 88 }}>
      <Card sx={{ height: 540, display: "flex", flexDirection: "column" }}>
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
          <Avatar sx={{ bgcolor: "primary.main", width: 32, height: 32 }}>
            <SmartToyIcon fontSize="small" />
          </Avatar>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              AI Tutor
            </Typography>
            <Typography variant="caption" color="success.main">
              ● Online
            </Typography>
          </Box>
        </Stack>
        <Box sx={{ flex: 1, overflowY: "auto", p: 2 }}>
          <Stack spacing={1.5}>
            {messages.map((m) => (
              <Box
                key={m.id}
                sx={{
                  alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                  maxWidth: "85%",
                  px: 1.5,
                  py: 1,
                  borderRadius: 2,
                  bgcolor: m.role === "user" ? "primary.main" : "action.hover",
                  color: m.role === "user" ? "primary.contrastText" : "text.primary",
                }}
              >
                <Typography variant="body2">{m.content}</Typography>
              </Box>
            ))}
          </Stack>
        </Box>
        <Divider />
        <Box sx={{ p: 1.5 }}>
          <Stack direction="row" spacing={1}>
            <TextField
              fullWidth
              size="small"
              placeholder="Ask the AI tutor…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && input.trim()) {
                  setMessages((m) => [
                    ...m,
                    { id: String(Date.now()), role: "user", content: input.trim(), ts: new Date().toISOString() },
                  ]);
                  setInput("");
                }
              }}
            />
            <IconButton color="primary">
              <SendIcon />
            </IconButton>
          </Stack>
        </Box>
      </Card>

      <Card>
        <CardContent sx={{ p: 2.5 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
            Rubric checklist
          </Typography>
          <Stack spacing={1.25}>
            {[
              { label: "Content & ideas", done: true, weight: 30 },
              { label: "Structure", done: true, weight: 25 },
              { label: "Style & tone", done: false, weight: 25 },
              { label: "Language & conventions", done: false, weight: 20 },
            ].map((r) => (
              <Stack key={r.label} direction="row" justifyContent="space-between" alignItems="center">
                <Stack direction="row" spacing={1} alignItems="center">
                  {r.done ? (
                    <CheckCircleIcon sx={{ color: "primary.main", fontSize: 18 }} />
                  ) : (
                    <CircleIcon sx={{ color: "text.disabled", fontSize: 18 }} />
                  )}
                  <Typography variant="body2">{r.label}</Typography>
                </Stack>
                <Typography variant="caption" color="text.secondary">
                  {r.weight}%
                </Typography>
              </Stack>
            ))}
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}
