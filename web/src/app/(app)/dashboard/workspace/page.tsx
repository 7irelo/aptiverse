"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
import Tooltip from "@mui/material/Tooltip";
import Avatar from "@mui/material/Avatar";
import Skeleton from "@mui/material/Skeleton";
import Drawer from "@mui/material/Drawer";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import useMediaQuery from "@mui/material/useMediaQuery";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import { alpha, useTheme } from "@mui/material/styles";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import PlayArrowIcon from "@mui/icons-material/PlayArrowOutlined";
import PauseIcon from "@mui/icons-material/PauseOutlined";
import RestartAltIcon from "@mui/icons-material/RestartAltOutlined";
import SmartToyIcon from "@mui/icons-material/SmartToyOutlined";
import SendIcon from "@mui/icons-material/SendOutlined";
import CloseIcon from "@mui/icons-material/CloseOutlined";
import ChecklistIcon from "@mui/icons-material/ChecklistOutlined";
import ViewColumnIcon from "@mui/icons-material/ViewColumnOutlined";
import ViewStreamIcon from "@mui/icons-material/ViewStreamOutlined";
import KeyboardIcon from "@mui/icons-material/KeyboardOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForwardOutlined";
import { AtmosphericBackdrop } from "@/components/common/AtmosphericBackdrop";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { TasksEditor } from "@/components/workspace/TasksEditor";
import { MathEditor } from "@/components/workspace/MathEditor";
import { UploadsStrip } from "@/components/workspace/UploadsStrip";
import {
  useAssessments,
  useSubjects,
  useUpdateAssessment,
  usePracticeTests,
} from "@/lib/api/queries";
import type { Assessment, AssessmentType, Subject, PracticeTest } from "@/lib/mockData";
import { useWorkspaceDraft, type AutosaveState } from "@/lib/hooks/useWorkspaceDraft";
import { useAiHelp, type AiHelpMessage } from "@/lib/hooks/useAiHelp";
import Link from "next/link";
import dayjs from "dayjs";

// ─── Tab model — adapts to assessment type ────────────────────────────
// The workspace's centre column is the student's primary surface; it has
// to fit what they're actually doing. Essay-style SBAs need a long-form
// draft + research notes. Test/exam SBAs need practice and rough work,
// not an essay editor that doesn't apply. Investigations and practicals
// fall in between — notes plus a working area for observations / data.

type TabKey = "notes" | "draft" | "working" | "practice";

const TAB_LABELS: Record<TabKey, string> = {
  notes:    "Notes",
  draft:    "Draft",
  working:  "Working",
  practice: "Practice",
};

function tabsForType(type: AssessmentType): TabKey[] {
  switch (type) {
    case "essay":
    case "oral":
      return ["notes", "draft"];
    case "test":
    case "exam":
      return ["practice", "working"];
    case "investigation":
    case "practical":
    case "project":
      return ["notes", "working"];
    default:
      return ["notes"];
  }
}

type ViewMode = "tabbed" | "split";

const AI_TUTOR_INPUT_ID = "workspace-ai-tutor-input";

function platformModifier(): { key: "metaKey" | "ctrlKey"; label: string } {
  if (typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform)) {
    return { key: "metaKey", label: "⌘" };
  }
  return { key: "ctrlKey", label: "Ctrl" };
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || target.isContentEditable;
}

// ──────────────────────────────────────────────────────────────────────

export default function WorkspacePage() {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

  const assessmentsQuery = useAssessments();
  const subjectsQuery = useSubjects();

  const activeAssessments = useMemo<Assessment[]>(
    () =>
      (assessmentsQuery.data ?? [])
        .filter((a) => a.status !== "graded")
        .sort((a, b) => +new Date(a.dueDate) - +new Date(b.dueDate)),
    [assessmentsQuery.data],
  );

  const [activeId, setActiveId] = useState<string | null>(null);
  useEffect(() => {
    if (activeId && activeAssessments.some((a) => a.id === activeId)) return;
    setActiveId(activeAssessments[0]?.id ?? null);
  }, [activeAssessments, activeId]);

  const activeAssessment = activeAssessments.find((a) => a.id === activeId);
  // Match on the canonical subject slug — Subject.id is the enrolment
  // row id, Subject.subjectId is the slug that Assessment.subjectId
  // also stores. The old lookup compared the wrong fields and always
  // came back undefined.
  const subject: Subject | undefined = (subjectsQuery.data ?? []).find(
    (s) => s.subjectId === activeAssessment?.subjectId,
  );

  // Tabs for the active assessment's type. The user's tab choice is
  // persisted to localStorage keyed by assessment id, so:
  //   (a) coming back to the same SBA restores the tab they were on,
  //   (b) an HMR remount (e.g. impeccable live editing layout.tsx, or
  //       any other dev-time hot reload) doesn't snap "Working" back
  //       to "Practice" because the initial render briefly sees no
  //       assessment and defaults to tabs[0].
  // If the persisted value is no longer valid (assessment changed
  // type, e.g. test -> essay), fall back to the first tab.
  const tabs = activeAssessment ? tabsForType(activeAssessment.type) : ["notes" as TabKey];
  const [tab, setTab] = useState<TabKey>(tabs[0]);

  const tabStorageKey = activeAssessment
    ? `aptiverse.workspace.tab.${activeAssessment.id}`
    : null;

  // Restore on assessment change (or first availability after data
  // load). Only depends on the storage key; we intentionally don't
  // re-run on tab changes so the user's clicks aren't overwritten by
  // the persisted value.
  useEffect(() => {
    if (!tabStorageKey || typeof window === "undefined") return;
    const stored = window.localStorage.getItem(tabStorageKey) as TabKey | null;
    if (stored && tabs.includes(stored)) {
      setTab(stored);
    } else if (!tabs.includes(tab)) {
      setTab(tabs[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabStorageKey]);

  // Persist whenever tab changes and is valid for the current tabs.
  useEffect(() => {
    if (!tabStorageKey || typeof window === "undefined") return;
    if (!tabs.includes(tab)) return;
    window.localStorage.setItem(tabStorageKey, tab);
  }, [tab, tabStorageKey, tabs]);

  // Derived "safe" tab. After switching assessment types, `tab` lags
  // `tabs` by one render (the effect above fixes it on the next pass).
  // MUI Tabs warns when value doesn't match any child, so we render the
  // first valid tab in this transient state and stay quiet.
  const safeTab: TabKey = tabs.includes(tab) ? tab : tabs[0];

  const [viewMode, setViewMode] = useState<ViewMode>("tabbed");
  const [aiOpen, setAiOpen] = useState(false);
  const [contextOpen, setContextOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  // Focus mode: the workspace transforms when a Pomodoro session is
  // running. Context cards (SBA, Tasks) and the AI tutor rail fade
  // away; the math/writing surface takes the freed space. The student
  // explicitly committed to a focus session by pressing Start; the
  // page gets out of the way until they pause or finish.
  //
  // Mobile is unaffected: the rails are already drawer-only on xs/sm.
  const [pomodoroState, setPomodoroState] = useState<PomodoroState | null>(null);
  const focusMode = isDesktop && pomodoroState?.kind === "running";

  // Split view only makes sense with at least two tabs AND on desktop.
  const splitEligible = isDesktop && tabs.length >= 2;
  useEffect(() => {
    if (!splitEligible && viewMode === "split") setViewMode("tabbed");
  }, [splitEligible, viewMode]);

  // Keyboard shortcuts. The mapping adapts to the available tabs:
  // ⌘1 = first tab, ⌘2 = second tab (if present).
  useEffect(() => {
    const mod = platformModifier();
    const onKey = (e: KeyboardEvent) => {
      const editing = isEditableTarget(e.target);

      if (!editing && e.key === "?" && !e[mod.key] && !e.altKey) {
        e.preventDefault();
        setShortcutsOpen(true);
        return;
      }

      if (!e[mod.key]) return;

      if (e.key === "1" && tabs[0]) {
        e.preventDefault();
        setViewMode("tabbed");
        setTab(tabs[0]);
        return;
      }
      if (e.key === "2" && tabs[1]) {
        e.preventDefault();
        setViewMode("tabbed");
        setTab(tabs[1]);
        return;
      }
      if (e.key === "\\") {
        e.preventDefault();
        if (splitEligible) setViewMode((v) => (v === "split" ? "tabbed" : "split"));
        return;
      }
      if (e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (!isDesktop) setAiOpen(true);
        setTimeout(() => document.getElementById(AI_TUTOR_INPUT_ID)?.focus(), 0);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isDesktop, splitEligible, tabs]);

  if (assessmentsQuery.isLoading || subjectsQuery.isLoading) {
    return (
      <>
        <PageHeader title="Workspace" breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Workspace" }]} />
        <Skeleton variant="rounded" height={620} />
      </>
    );
  }

  if (!activeAssessment) {
    return (
      <>
        <PageHeader
          title="Workspace"
          description="Plan, practice, write. Autosave on."
          breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Workspace" }]}
        />
        <Card>
          <CardContent sx={{ p: { xs: 3, md: 5 } }}>
            <EmptyState
              icon={<ChecklistIcon />}
              title="Nothing to work on yet"
              description="Log an SBA — a test, essay, investigation, project — and the workspace will open with the right tools for it."
              action={
                <Button component={Link} href="/dashboard/assessments/new" variant="contained">
                  Add an assessment
                </Button>
              }
            />
          </CardContent>
        </Card>
      </>
    );
  }

  const editorSlots = (
    <>
      {safeTab === "notes"    && <NotesPanel    assessmentId={activeId} />}
      {safeTab === "draft"    && <DraftPanel    assessmentId={activeId} draftTitle={activeAssessment.title} />}
      {safeTab === "working"  && <WorkingPanel  assessmentId={activeId} subjectName={subject?.name} subjectCategory={subject?.category} />}
      {safeTab === "practice" && <PracticePanel assessment={activeAssessment} subject={subject} />}
    </>
  );

  const splitSlots = tabs.length >= 2 && (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        "& > :first-of-type": { borderRight: 1, borderColor: "divider" },
      }}
    >
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        <PaneHeader label={TAB_LABELS[tabs[0]]} />
        <PanelByKey
          tabKey={tabs[0]}
          activeId={activeId}
          assessment={activeAssessment}
          subject={subject}
        />
      </Box>
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        <PaneHeader label={TAB_LABELS[tabs[1]]} />
        <PanelByKey
          tabKey={tabs[1]}
          activeId={activeId}
          assessment={activeAssessment}
          subject={subject}
        />
      </Box>
    </Box>
  );

  // Hero-treatment chip for the active SBA's due date.
  const heroDaysOut = activeAssessment
    ? dayjs(activeAssessment.dueDate).diff(dayjs(), "day")
    : null;
  const heroDueChip =
    heroDaysOut == null
      ? null
      : heroDaysOut < 0
        ? { label: "Overdue", color: "error" as const }
        : heroDaysOut === 0
          ? { label: "Due today", color: "warning" as const }
          : heroDaysOut <= 3
            ? { label: `Due in ${heroDaysOut} days`, color: "warning" as const }
            : { label: `Due in ${heroDaysOut} days`, color: "default" as const };

  return (
    <AtmosphericBackdrop>
      {/* Breadcrumbs */}
      <Breadcrumbs
        separator={<NavigateNextIcon fontSize="small" />}
        sx={{ mb: 1.5, fontSize: "0.8125rem" }}
      >
        <Link href="/dashboard" style={{ color: "inherit", opacity: 0.7 }}>
          Dashboard
        </Link>
        <Typography variant="body2" color="text.primary">
          Workspace
        </Typography>
      </Breadcrumbs>

      {/* SBA-as-protagonist hero. Replaces the previous "Workspace"
          PageHeader title. The page now belongs to whichever SBA is
          active; "Workspace" is implicit (it's a breadcrumb and the
          sidebar nav state). */}
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={{ xs: 2, md: 3 }}
        alignItems={{ xs: "flex-start", md: "flex-end" }}
        justifyContent="space-between"
        sx={{
          mb: 4,
          pb: 3,
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="overline" color="text.secondary">
            Active SBA
          </Typography>
          {activeAssessment ? (
            <>
              <Typography
                variant="h2"
                component="h1"
                sx={{
                  fontWeight: 600,
                  mt: 0.5,
                  wordBreak: "break-word",
                }}
              >
                {activeAssessment.title}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 1 }}
              >
                {subject?.name ?? activeAssessment.subjectId} · {activeAssessment.type}
              </Typography>
              {heroDueChip && (
                <Stack
                  direction="row"
                  spacing={0.75}
                  sx={{ mt: 1.75 }}
                  flexWrap="wrap"
                  useFlexGap
                >
                  <Chip
                    label={heroDueChip.label}
                    size="small"
                    color={heroDueChip.color}
                    variant="outlined"
                  />
                  <Chip
                    label={`Weight ${activeAssessment.weight}%`}
                    size="small"
                    variant="outlined"
                  />
                </Stack>
              )}
            </>
          ) : (
            <Typography variant="h4" component="h1" sx={{ fontWeight: 600, mt: 0.5 }}>
              Workspace
            </Typography>
          )}
        </Box>
        <TextField
          select
          size="small"
          value={activeId ?? ""}
          onChange={(e) => setActiveId(e.target.value)}
          sx={{ minWidth: { xs: "100%", sm: 280 }, flexShrink: 0 }}
        >
          {activeAssessments.map((a) => {
            const subj = (subjectsQuery.data ?? []).find((s) => s.id === a.subjectId);
            return (
              <MenuItem key={a.id} value={a.id}>
                {subj?.name ?? a.subjectId} · {a.title}
              </MenuItem>
            );
          })}
        </TextField>
      </Stack>

      {!isDesktop && (
        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          <Button
            fullWidth
            variant="outlined"
            size="small"
            onClick={() => setContextOpen(true)}
            startIcon={<ChecklistIcon fontSize="small" />}
          >
            Plan
          </Button>
          <Button
            fullWidth
            variant="outlined"
            size="small"
            onClick={() => setAiOpen(true)}
            startIcon={<SmartToyIcon fontSize="small" />}
          >
            AI tutor
          </Button>
        </Stack>
      )}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            // Focus mode: drop the right rail, narrow the left.
            md: focusMode ? "220px 1fr" : "300px 1fr 340px",
          },
          gap: { xs: 2, md: 3 },
          alignItems: "start",
          transition:
            "grid-template-columns 220ms cubic-bezier(0.25, 1, 0.5, 1)",
        }}
      >
        <Box sx={{ display: { xs: "none", md: "block" } }}>
          <LeftRail
            assessment={activeAssessment}
            focusMode={focusMode}
            onPomodoroStateChange={setPomodoroState}
          />
        </Box>

        <Card sx={{ minHeight: { xs: 420, md: 620 } }}>
          <CardContent sx={{ p: 0, pb: "0 !important" }}>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ borderBottom: 1, borderColor: "divider", px: { xs: 1, sm: 2 }, pr: { xs: 0.5, sm: 1.5 } }}
            >
              {viewMode === "tabbed" ? (
                <Tabs
                  value={safeTab}
                  onChange={(_, v: TabKey) => setTab(v)}
                  variant="scrollable"
                  scrollButtons={false}
                  sx={{ minHeight: 44 }}
                >
                  {tabs.map((t) => (
                    <Tab key={t} label={TAB_LABELS[t]} value={t} sx={{ minHeight: 44 }} />
                  ))}
                </Tabs>
              ) : (
                <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: "0.08em", py: 1.5 }}>
                  {TAB_LABELS[tabs[0]]} + {TAB_LABELS[tabs[1]]}
                </Typography>
              )}

              <Stack direction="row" spacing={0.5} alignItems="center">
                {splitEligible && (
                  <ToggleButtonGroup
                    value={viewMode}
                    exclusive
                    size="small"
                    onChange={(_, v: ViewMode | null) => v && setViewMode(v)}
                    sx={{ "& .MuiToggleButton-root": { px: 1, border: 0 } }}
                  >
                    <ToggleButton value="tabbed" aria-label="Tabbed view">
                      <Tooltip title="Tabbed view"><ViewStreamIcon fontSize="small" /></Tooltip>
                    </ToggleButton>
                    <ToggleButton value="split" aria-label="Split view">
                      <Tooltip title="Split view"><ViewColumnIcon fontSize="small" /></Tooltip>
                    </ToggleButton>
                  </ToggleButtonGroup>
                )}
                {focusMode && (
                  <>
                    <Chip
                      label="Focus mode"
                      size="small"
                      color="primary"
                      variant="outlined"
                      sx={{ fontWeight: 600 }}
                    />
                    <Tooltip title="AI tutor">
                      <IconButton
                        size="small"
                        onClick={() => setAiOpen(true)}
                        aria-label="Open AI tutor"
                      >
                        <SmartToyIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </>
                )}
                <Tooltip title="Keyboard shortcuts (?)">
                  <IconButton size="small" onClick={() => setShortcutsOpen(true)} aria-label="Keyboard shortcuts">
                    <KeyboardIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Stack>

            {viewMode === "split" && splitSlots ? (
              splitSlots
            ) : (
              <Box sx={{ p: { xs: 2, sm: 3 } }}>{editorSlots}</Box>
            )}
          </CardContent>
        </Card>

        {!focusMode && (
          <Box sx={{ display: { xs: "none", md: "block" } }}>
            <RightRail assessment={activeAssessment} subject={subject} />
          </Box>
        )}
      </Box>

      <ShortcutsDialog open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />

      <Drawer
        anchor="left"
        open={!isDesktop && contextOpen}
        onClose={() => setContextOpen(false)}
        PaperProps={{ sx: { width: { xs: "92vw", sm: 340 } } }}
      >
        <DrawerHeader title="Plan" onClose={() => setContextOpen(false)} />
        <Box sx={{ p: 2 }}>
          <LeftRail assessment={activeAssessment} />
        </Box>
      </Drawer>
      <Drawer
        anchor="right"
        // Drawer works for two cases now: mobile (rails always
        // drawer-only) and desktop-in-focus-mode (right rail hidden
        // but student still needs AI tutor access).
        open={(focusMode || !isDesktop) && aiOpen}
        onClose={() => setAiOpen(false)}
        PaperProps={{ sx: { width: { xs: "100vw", sm: 380 } } }}
      >
        <DrawerHeader title="AI tutor" onClose={() => setAiOpen(false)} />
        <Box sx={{ p: 2 }}>
          <RightRail assessment={activeAssessment} subject={subject} />
        </Box>
      </Drawer>
    </AtmosphericBackdrop>
  );
}

function PanelByKey({
  tabKey,
  activeId,
  assessment,
  subject,
}: {
  tabKey: TabKey;
  activeId: string | null;
  assessment: Assessment;
  subject?: Subject;
}) {
  switch (tabKey) {
    case "notes":    return <NotesPanel    assessmentId={activeId} />;
    case "draft":    return <DraftPanel    assessmentId={activeId} draftTitle={assessment.title} />;
    case "working":  return <WorkingPanel  assessmentId={activeId} subjectName={subject?.name} subjectCategory={subject?.category} />;
    case "practice": return <PracticePanel assessment={assessment} subject={subject} />;
  }
}

function PaneHeader({ label }: { label: string }) {
  return (
    <Typography
      variant="overline"
      color="text.secondary"
      sx={{ letterSpacing: "0.08em", display: "block", mb: 1.5 }}
    >
      {label}
    </Typography>
  );
}

function ShortcutsDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const mod = platformModifier();
  const rows: { keys: string[]; label: string }[] = [
    { keys: [mod.label, "1"],  label: "Open first tab" },
    { keys: [mod.label, "2"],  label: "Open second tab" },
    { keys: [mod.label, "\\"], label: "Toggle split view (desktop)" },
    { keys: [mod.label, "K"],  label: "Focus AI tutor input" },
    { keys: ["?"],             label: "Show this cheatsheet" },
  ];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        <Typography
          component="div"
          variant="overline"
          color="text.secondary"
          sx={{ letterSpacing: "0.08em", lineHeight: 1.2 }}
        >
          Keyboard
        </Typography>
        <Typography component="span" variant="h6" sx={{ fontWeight: 600 }}>
          Shortcuts
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={1.5}>
          {rows.map((r) => (
            <Stack key={r.label} direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="body2">{r.label}</Typography>
              <Stack direction="row" spacing={0.5}>
                {r.keys.map((k) => (
                  <Box
                    key={k}
                    component="kbd"
                    sx={{
                      px: 0.75,
                      py: 0.25,
                      borderRadius: 1,
                      border: 1,
                      borderColor: "divider",
                      fontFamily: "ui-monospace, 'SF Mono', Menlo, monospace",
                      fontSize: "0.7rem",
                      fontWeight: 600,
                      minWidth: 22,
                      textAlign: "center",
                      lineHeight: "20px",
                      color: "text.secondary",
                    }}
                  >
                    {k}
                  </Box>
                ))}
              </Stack>
            </Stack>
          ))}
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

function DrawerHeader({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 1.5, borderBottom: 1, borderColor: "divider" }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
        {title}
      </Typography>
      <IconButton onClick={onClose} size="small" aria-label="Close">
        <CloseIcon />
      </IconButton>
    </Stack>
  );
}

// ============================================================
// LEFT RAIL — active SBA · pomodoro · tasks (real)
// ============================================================

function LeftRail({
  assessment,
  focusMode = false,
  onPomodoroStateChange,
}: {
  assessment: Assessment;
  /** When true, the Tasks card is hidden so the rail collapses to
   *  just the Focus timer. The student is in a focus session;
   *  reference context can wait. */
  focusMode?: boolean;
  onPomodoroStateChange?: (state: PomodoroState) => void;
}) {
  return (
    <Stack spacing={2.5} sx={{ position: { md: "sticky" }, top: { md: 88 } }}>
      <FocusTimer
        assessmentId={assessment.id}
        onStateChange={onPomodoroStateChange}
      />

      {!focusMode && (
        <Card>
          <CardContent sx={{ p: 2.5 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-end" sx={{ mb: 2 }}>
              <Box>
                <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: "0.08em" }}>
                  Plan
                </Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  Tasks
                </Typography>
              </Box>
            </Stack>
            <TasksEditor assessmentId={assessment.id} tasks={assessment.tasks ?? []} compact />
          </CardContent>
        </Card>
      )}
    </Stack>
  );
}

// ─── Focus timer — Pomodoro that survives a refresh ───────────────────
//
// State is persisted to localStorage keyed by the active SBA id. We store
// "what was the target end time when the timer was started" rather than
// the elapsed seconds, so the displayed countdown stays in sync after a
// page reload regardless of how long the user was away.

const POMODORO_SECONDS = 25 * 60;
const POMODORO_STORAGE_PREFIX = "aptiverse.pomodoro.";

type PomodoroState =
  | { kind: "idle";    remaining: number }
  | { kind: "running"; endsAt: number }
  | { kind: "paused";  remaining: number };

function FocusTimer({
  assessmentId,
  onStateChange,
}: {
  assessmentId: string;
  /** Fires whenever the local Pomodoro state changes. Used by the
   *  workspace page to detect entering / exiting focus mode. */
  onStateChange?: (state: PomodoroState) => void;
}) {
  const storageKey = `${POMODORO_STORAGE_PREFIX}${assessmentId}`;
  const [state, setState] = useState<PomodoroState>({ kind: "idle", remaining: POMODORO_SECONDS });
  const [now, setNow] = useState(() => Date.now());

  // Report state changes upward. Use a ref to avoid spurious re-fires
  // when the parent passes a new callback identity each render.
  const onStateChangeRef = useRef(onStateChange);
  useEffect(() => {
    onStateChangeRef.current = onStateChange;
  });
  useEffect(() => {
    onStateChangeRef.current?.(state);
  }, [state]);

  // Restore from localStorage on mount + on assessment switch.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (!raw) {
        setState({ kind: "idle", remaining: POMODORO_SECONDS });
        return;
      }
      const parsed = JSON.parse(raw) as PomodoroState;
      if (parsed.kind === "running") {
        const left = Math.max(0, Math.ceil((parsed.endsAt - Date.now()) / 1000));
        setState(left > 0 ? parsed : { kind: "idle", remaining: POMODORO_SECONDS });
      } else {
        setState(parsed);
      }
    } catch {
      setState({ kind: "idle", remaining: POMODORO_SECONDS });
    }
  }, [storageKey]);

  // Persist on every state change.
  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(state));
    } catch {
      // localStorage can be disabled (private mode); refresh resets timer.
    }
  }, [state, storageKey]);

  // Tick once a second only while running.
  useEffect(() => {
    if (state.kind !== "running") return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [state.kind]);

  const secs = state.kind === "running"
    ? Math.max(0, Math.ceil((state.endsAt - now) / 1000))
    : state.remaining;
  const done = secs === 0;
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  const pct = ((POMODORO_SECONDS - secs) / POMODORO_SECONDS) * 100;

  // Auto-flip running → idle at zero so the label changes naturally.
  useEffect(() => {
    if (state.kind === "running" && done) {
      setState({ kind: "idle", remaining: POMODORO_SECONDS });
    }
  }, [done, state.kind]);

  const start = () => {
    const remaining = state.kind === "paused" ? state.remaining : POMODORO_SECONDS;
    setState({ kind: "running", endsAt: Date.now() + remaining * 1000 });
  };
  const pause = () => {
    if (state.kind === "running") {
      setState({ kind: "paused", remaining: secs });
    }
  };
  const reset = () => setState({ kind: "idle", remaining: POMODORO_SECONDS });

  return (
    <Card>
      <CardContent sx={{ p: 2.5 }}>
        <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: "0.08em" }}>
          Focus
        </Typography>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          25 minute Pomodoro
        </Typography>
        <Typography
          variant="h2"
          sx={{
            fontWeight: 600,
            fontVariantNumeric: "tabular-nums",
            my: 1,
            lineHeight: 1.05,
          }}
        >
          {String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}
        </Typography>
        <LinearProgress
          variant="determinate"
          value={pct}
          sx={{ mb: 2, height: 4, borderRadius: 999 }}
          color={done ? "success" : "primary"}
        />
        <Stack direction="row" spacing={1}>
          <Button
            startIcon={state.kind === "running" ? <PauseIcon /> : <PlayArrowIcon />}
            variant="contained"
            color="secondary"
            fullWidth
            onClick={state.kind === "running" ? pause : start}
            disabled={done && state.kind !== "running"}
          >
            {state.kind === "running" ? "Pause" : state.kind === "paused" ? "Resume" : "Start"}
          </Button>
          <Tooltip title="Reset">
            <IconButton onClick={reset} aria-label="Reset timer">
              <RestartAltIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </CardContent>
    </Card>
  );
}

// ============================================================
// EDITOR PANELS
// ============================================================

// Autosave indicator. Only renders when there's something the student
// needs to know about — a failed save. Saving / Saved / Idle states
// stay silent; the student trusts that autosave works because their
// previous keystrokes haven't disappeared. Showing a constant green
// "Saved" badge is noise (the user flagged it).
function AutosaveBadge({ state }: { state: AutosaveState }) {
  if (state.status !== "error") return null;
  return (
    <Chip
      label="Save failed — check your connection"
      size="small"
      color="error"
      variant="outlined"
    />
  );
}

// Plain-text notes — works for any subject.
function NotesPanel({ assessmentId }: { assessmentId: string | null }) {
  const draft = useWorkspaceDraft(assessmentId, "notes");
  const [value, setValue] = useState(draft.initialContent);
  useEffect(() => { setValue(draft.initialContent); }, [draft.initialContent]);

  return (
    <Stack spacing={1.5}>
      <TextField
        fullWidth
        multiline
        minRows={14}
        placeholder="Start typing your notes… autosave is on."
        value={value}
        onChange={(e) => { setValue(e.target.value); draft.queueSave(e.target.value); }}
        sx={{
          "& .MuiOutlinedInput-root": { bgcolor: "transparent", border: 0 },
          "& fieldset": { border: 0 },
        }}
      />
      <Stack direction="row" justifyContent="flex-end">
        <AutosaveBadge state={draft.state} />
      </Stack>
    </Stack>
  );
}

// Long-form draft — only shown for essay/oral assessments.
function DraftPanel({ assessmentId, draftTitle }: { assessmentId: string | null; draftTitle: string }) {
  const draft = useWorkspaceDraft(assessmentId, "essay");
  const [value, setValue] = useState(draft.initialContent);
  const [snackbar, setSnackbar] = useState<{ open: boolean; msg: string; severity: "success" | "error" }>({
    open: false, msg: "", severity: "success",
  });
  const updateAssessment = useUpdateAssessment();

  useEffect(() => { setValue(draft.initialContent); }, [draft.initialContent]);

  const trimmed = value.trim();
  const wordCount = trimmed ? trimmed.split(/\s+/).length : 0;
  const sentenceCount = trimmed ? (trimmed.match(/[.!?]+(\s|$)/g) ?? []).length || 1 : 0;
  const readMinutes = wordCount === 0 ? 0 : Math.max(1, Math.round(wordCount / 200));

  const submit = async () => {
    if (!assessmentId) return;
    try {
      draft.queueSave(value);
      await updateAssessment.mutateAsync({ id: assessmentId, status: "submitted" });
      setSnackbar({ open: true, msg: "Draft submitted.", severity: "success" });
    } catch (err) {
      setSnackbar({ open: true, msg: err instanceof Error ? err.message : "Couldn't submit.", severity: "error" });
    }
  };

  return (
    <Stack spacing={2}>
      <TextField fullWidth label="Title" value={draftTitle} disabled />
      <TextField
        fullWidth
        multiline
        minRows={14}
        placeholder="Open with a hook your reader can't ignore…"
        value={value}
        onChange={(e) => { setValue(e.target.value); draft.queueSave(e.target.value); }}
        sx={{ "& textarea": { fontSize: "1rem", lineHeight: 1.7 } }}
      />
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1.5}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", sm: "center" }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap>
          <Typography variant="caption" color="text.secondary">{wordCount} {wordCount === 1 ? "word" : "words"}</Typography>
          {sentenceCount > 0 && (
            <>
              <Box sx={{ width: 3, height: 3, borderRadius: "50%", bgcolor: "text.disabled" }} />
              <Typography variant="caption" color="text.secondary">{sentenceCount} {sentenceCount === 1 ? "sentence" : "sentences"}</Typography>
              <Box sx={{ width: 3, height: 3, borderRadius: "50%", bgcolor: "text.disabled" }} />
              <Typography variant="caption" color="text.secondary">~{readMinutes} min read</Typography>
            </>
          )}
          <AutosaveBadge state={draft.state} />
        </Stack>
        <Button variant="contained" onClick={submit} disabled={!assessmentId || updateAssessment.isPending || !trimmed}>
          {updateAssessment.isPending ? "Submitting…" : "Submit draft"}
        </Button>
      </Stack>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snackbar.severity} variant="filled" onClose={() => setSnackbar((s) => ({ ...s, open: false }))}>
          {snackbar.msg}
        </Alert>
      </Snackbar>
    </Stack>
  );
}

// Working surface.
//
// Maths + natural-science subjects get MathEditor — a single MathLive
// math-field rendered WYSIWYG (fractions stack, roots cover, integrals
// show bounds) with our own toolbar inserting structure templates.
// MathLive's virtual keyboard is off; students use their device's
// keyboard for letters/numbers and the toolbar for math structures.
//
// Other subjects get a plain mono textarea — no maths rendering, no
// bundle weight for content they don't need.
//
// Both modes share the `scratchpad` draft channel and pair with the
// UploadsStrip below so students can attach a photo of handwritten
// working alongside whatever they type.
function WorkingPanel({
  assessmentId,
  subjectName,
  subjectCategory,
}: {
  assessmentId: string | null;
  subjectName?: string;
  subjectCategory?: string;
}) {
  const draft = useWorkspaceDraft(assessmentId, "scratchpad");
  const [value, setValue] = useState(draft.initialContent);
  useEffect(() => { setValue(draft.initialContent); }, [draft.initialContent]);

  const showMathEditor =
    subjectCategory === "mathematics" || subjectCategory === "natural_science";

  return (
    <Stack spacing={3}>
      {showMathEditor ? (
        <Stack spacing={1.5}>
          <MathEditor
            value={value}
            onChange={(v) => {
              setValue(v);
              draft.queueSave(v);
            }}
          />
          <Stack direction="row" justifyContent="flex-end">
            <AutosaveBadge state={draft.state} />
          </Stack>
        </Stack>
      ) : (
        <Stack spacing={1.5}>
          <TextField
            fullWidth
            multiline
            minRows={12}
            placeholder={
              subjectName
                ? `${subjectName} — type out your reasoning, observations, or what you tried on paper.`
                : "Type out your reasoning, observations, or what you tried on paper."
            }
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              draft.queueSave(e.target.value);
            }}
            sx={{
              "& .MuiOutlinedInput-root": { bgcolor: "transparent", border: 0 },
              "& fieldset": { border: 0 },
              "& textarea": {
                fontFamily: "ui-monospace, 'SF Mono', Menlo, monospace",
                fontSize: "0.95rem",
                lineHeight: 1.6,
              },
            }}
          />
          <Stack direction="row" justifyContent="flex-end">
            <AutosaveBadge state={draft.state} />
          </Stack>
        </Stack>
      )}
      {/* Attachments — photograph paper working, drop in a PDF brief,
          screenshot reference material. */}
      {assessmentId && <UploadsStrip assessmentId={assessmentId} />}
    </Stack>
  );
}

// Practice tab — shown for tests/exams. Lists real practice tests
// filtered to the SBA's subject, with one-click "Start" jumping to the
// existing /dashboard/practice/[id] route.
function PracticePanel({
  assessment,
  subject,
}: {
  assessment: Assessment;
  subject?: Subject;
}) {
  const query = usePracticeTests();
  const all = query.data ?? [];
  const forSubject = useMemo(
    () => all.filter((t) => t.subjectId === assessment.subjectId),
    [all, assessment.subjectId],
  );

  if (query.isLoading) {
    return (
      <Stack spacing={1.5}>
        <Skeleton variant="rounded" height={88} />
        <Skeleton variant="rounded" height={88} />
        <Skeleton variant="rounded" height={88} />
      </Stack>
    );
  }

  if (forSubject.length === 0) {
    return (
      <Box sx={{ py: 5, textAlign: "center" }}>
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: 1.5,
            mx: "auto",
            mb: 1.5,
            display: "grid",
            placeItems: "center",
            color: "primary.main",
            bgcolor: (t) =>
              t.palette.mode === "dark"
                ? "rgba(116,181,174,0.12)"
                : "rgba(15,105,99,0.08)",
          }}
        >
          <ChecklistIcon fontSize="small" />
        </Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
          No practice yet for {subject?.name ?? "this subject"}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 380, mx: "auto", mb: 2 }}>
          Once we have aligned practice for {subject?.name ?? "your subject"}, you'll be able to start a timed run from here.
        </Typography>
        <Button component={Link} href="/dashboard/practice" variant="outlined" endIcon={<ArrowForwardIcon />}>
          Browse all practice
        </Button>
      </Box>
    );
  }

  return (
    <Stack spacing={1.5}>
      <Typography variant="body2" color="text.secondary">
        Practice for {subject?.name ?? "this subject"} — pick one to start a timed run.
      </Typography>
      {forSubject.map((p) => <PracticeRow key={p.id} test={p} />)}
    </Stack>
  );
}

function PracticeRow({ test }: { test: PracticeTest }) {
  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 1.5,
        border: 1,
        borderColor: "divider",
        display: "flex",
        gap: 2,
        alignItems: "center",
        transition: "border-color 150ms ease",
        "&:hover": { borderColor: "text.secondary" },
      }}
    >
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }} noWrap>
          {test.title}
        </Typography>
        <Stack direction="row" spacing={1.25} alignItems="center" sx={{ mt: 0.5, flexWrap: "wrap" }} useFlexGap>
          <Typography variant="caption" color="text.secondary">
            {test.questionCount} questions
          </Typography>
          <Box sx={{ width: 3, height: 3, borderRadius: "50%", bgcolor: "text.disabled" }} />
          <Typography variant="caption" color="text.secondary">
            {test.durationMinutes} min
          </Typography>
          <Box sx={{ width: 3, height: 3, borderRadius: "50%", bgcolor: "text.disabled" }} />
          <Chip
            label={test.difficulty}
            size="small"
            variant="outlined"
            sx={{ textTransform: "capitalize" }}
          />
          {test.bestScore != null && (
            <>
              <Box sx={{ width: 3, height: 3, borderRadius: "50%", bgcolor: "text.disabled" }} />
              <Typography variant="caption" color="primary.main" sx={{ fontWeight: 600 }}>
                Best {test.bestScore}%
              </Typography>
            </>
          )}
        </Stack>
      </Box>
      <Button
        component={Link}
        href={`/dashboard/practice/${test.id}`}
        variant="contained"
        size="small"
        sx={{ flexShrink: 0 }}
      >
        Start
      </Button>
    </Box>
  );
}

// ============================================================
// RIGHT RAIL — AI tutor only (rubric moved to the assessment page —
// it's a marking surface, not a "while working" surface)
// ============================================================

function RightRail({ assessment, subject }: { assessment: Assessment; subject: Subject | undefined }) {
  return (
    <Stack spacing={2.5} sx={{ position: { md: "sticky" }, top: { md: 88 } }}>
      <AiTutorChat assessment={assessment} subject={subject} />
    </Stack>
  );
}

function AiTutorChat({ assessment, subject }: { assessment: Assessment; subject: Subject | undefined }) {
  const [messages, setMessages] = useState<AiHelpMessage[]>([
    {
      role: "assistant",
      content: `Ask me anything about ${assessment.title}${subject ? ` (${subject.name})` : ""}.`,
    },
  ]);
  const [input, setInput] = useState("");
  const ask = useAiHelp();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, ask.isPending]);

  const send = () => {
    const text = input.trim();
    if (!text) return;
    const contextLine = `[Context: working on "${assessment.title}"${subject ? ` for ${subject.name}` : ""}, due ${dayjs(assessment.dueDate).format("DD MMM")}.]`;
    const userMessage: AiHelpMessage = {
      role: "user",
      content: messages.length <= 1 ? `${contextLine}\n\n${text}` : text,
    };
    const next = [...messages, userMessage];
    setMessages(next);
    setInput("");
    ask.mutate(
      { messages: next },
      {
        onSuccess: (data) => setMessages((m) => [...m, { role: "assistant", content: data.reply }]),
        onError: (err) =>
          setMessages((m) => [
            ...m,
            {
              role: "assistant",
              content:
                err.status === 503
                  ? "The AI is unavailable right now. Try again in a moment."
                  : err.status === 402
                    ? "You've used this month's quick AI replies. Upgrade your plan or wait for next month."
                    : "Something went wrong on my side. Try again in a moment.",
            },
          ]),
      },
    );
  };

  return (
    <Card sx={{ height: { xs: 420, md: 540 }, display: "flex", flexDirection: "column" }}>
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
        <Avatar sx={{ bgcolor: "primary.main", width: 32, height: 32 }}>
          <SmartToyIcon fontSize="small" sx={{ color: "primary.contrastText" }} />
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>AI tutor</Typography>
          <Typography variant="caption" color={ask.isPending ? "warning.main" : "success.main"}>
            {ask.isPending ? "Thinking…" : "Online"}
          </Typography>
        </Box>
      </Stack>
      <Box ref={scrollRef} sx={{ flex: 1, overflowY: "auto", p: 2 }}>
        <Stack spacing={1.5}>
          {messages.map((m, i) => (
            <Box
              key={i}
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
              <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>{m.content}</Typography>
            </Box>
          ))}
          {ask.isPending && (
            <Box sx={{ alignSelf: "flex-start", px: 1.5, py: 1, borderRadius: 2, bgcolor: "action.hover", display: "flex", gap: 0.5 }}>
              {[0, 1, 2].map((i) => (
                <Box key={i} sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "primary.main", animation: "blink 1.4s ease-in-out infinite", animationDelay: `${i * 0.15}s`, "@keyframes blink": { "0%, 80%, 100%": { opacity: 0.25 }, "40%": { opacity: 1 } } }} />
              ))}
            </Box>
          )}
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
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            disabled={ask.isPending}
            inputProps={{ id: AI_TUTOR_INPUT_ID }}
          />
          <IconButton color="primary" onClick={send} disabled={!input.trim() || ask.isPending} aria-label="Send">
            <SendIcon />
          </IconButton>
        </Stack>
      </Box>
    </Card>
  );
}
