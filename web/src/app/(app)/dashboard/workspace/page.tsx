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
import ArrowForwardIcon from "@mui/icons-material/ArrowForwardOutlined";
import { AtmosphericBackdrop } from "@/components/common/AtmosphericBackdrop";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { TasksEditor } from "@/components/workspace/TasksEditor";
import { PracticeRunner } from "@/components/practice/PracticeRunner";
import { Markdown } from "@/components/common/Markdown";
import { ChevronLeft } from "lucide-react";
import {
  useAssessments,
  useSubjects,
  useUpdateAssessment,
  usePracticeTests,
  useAiTutor,
  type AiChatMessage,
} from "@/lib/api/queries";
import type { Assessment, AssessmentType, Subject, PracticeTest } from "@/lib/mockData";
import { ASSESSMENT_TYPE_LABELS } from "@/lib/mockData";
import { useWorkspaceDraft, type AutosaveState } from "@/lib/hooks/useWorkspaceDraft";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import dayjs from "dayjs";

// ─── Tab model — adapts to assessment type ────────────────────────────
// The workspace's centre column is the student's primary surface; it has
// to fit what they're actually doing. Essay-style SBAs need a long-form
// draft + research notes. Test/exam SBAs need practice and rough work,
// not an essay editor that doesn't apply. Investigations and practicals
// fall in between — notes plus a working area for observations / data.

type TabKey = "notes" | "draft" | "practice";

const TAB_LABELS: Record<TabKey, string> = {
  notes:    "Notes",
  draft:    "Draft",
  practice: "Practice",
};

function tabsForType(type: AssessmentType): TabKey[] {
  switch (type) {
    case "essay":
    case "oral":
      return ["notes", "draft"];
    case "test":
    case "exam":
      return ["practice"];
    case "investigation":
    case "practical":
    case "project":
      return ["notes"];
    default:
      return ["notes"];
  }
}

type ViewMode = "tabbed" | "split";

const AI_TUTOR_INPUT_ID = "workspace-ai-tutor-input";

// ──────────────────────────────────────────────────────────────────────

export default function WorkspacePage() {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const router = useRouter();
  const searchParams = useSearchParams();

  // A standalone practice test opened from the Practice tab (`?test=<id>`).
  // Practice tests aren't SBAs, so they bypass the assessment workspace
  // entirely: the runner gates itself (fresh test -> instructions, an
  // already-taken one -> its results), and Back returns to the catalogue.
  const directTestId = searchParams.get("test");

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
  // Desktop AI-tutor panel is open by default: the tutor is a first-class
  // part of the workspace, always present as a full-height right panel. The
  // toolbar toggle hides it when the student wants the room. Mobile and focus
  // mode reach the same panel via the drawer (`aiOpen`).
  const [aiRailOpen, setAiRailOpen] = useState(true);
  const [contextOpen, setContextOpen] = useState(false);
  // True while the student is inside a practice attempt. The tutor is turned
  // off and the rails clear so the only thing on screen is the timed test.
  const [testInProgress, setTestInProgress] = useState(false);

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

  if (directTestId) {
    return (
      <AtmosphericBackdrop>
        <PageHeader
          title="Workspace"
          description="Your timed run and results, in the workspace."
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Workspace" },
          ]}
        />
        <PracticeRunner testId={directTestId} onExit={() => router.push("/dashboard/practice")} />
      </AtmosphericBackdrop>
    );
  }

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
      {safeTab === "draft"    && <DraftPanel    assessmentId={activeId} draftTitle={activeAssessment.title} type={activeAssessment.type} />}
      {safeTab === "practice" && <PracticePanel assessment={activeAssessment} subject={subject} onRunningChange={setTestInProgress} />}
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
                {subject?.name ?? activeAssessment.subjectId} · {ASSESSMENT_TYPE_LABELS[activeAssessment.type]}
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
        {activeAssessments.length > 1 && (
          <TextField
            select
            size="small"
            label="Switch SBA"
            value={activeId ?? ""}
            onChange={(e) => setActiveId(e.target.value)}
            sx={{ minWidth: { xs: "100%", sm: 300 }, flexShrink: 0 }}
            SelectProps={{
              // The trigger shows just the active SBA's title — the subject
              // and type already sit in the hero to its left, so repeating
              // them (or worse, the raw subject key) is noise.
              renderValue: (val) => {
                const a = activeAssessments.find((x) => x.id === val);
                return (
                  <Typography variant="body2" noWrap sx={{ fontWeight: 600 }}>
                    {a?.title ?? "Select an SBA"}
                  </Typography>
                );
              },
              MenuProps: { PaperProps: { sx: { maxWidth: 360 } } },
            }}
          >
            {activeAssessments.map((a) => {
              // Match on the canonical slug — Assessment.subjectId stores the
              // slug, which lives on Subject.subjectId, not Subject.id.
              const subj = (subjectsQuery.data ?? []).find((s) => s.subjectId === a.subjectId);
              const days = dayjs(a.dueDate).diff(dayjs(), "day");
              return (
                <MenuItem key={a.id} value={a.id} sx={{ py: 1 }}>
                  <Stack sx={{ minWidth: 0, width: "100%" }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                      {a.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap>
                      {subj?.name ?? a.subjectId} · {ASSESSMENT_TYPE_LABELS[a.type]}
                      {days < 0 ? " · overdue" : days === 0 ? " · due today" : ` · due in ${days}d`}
                    </Typography>
                  </Stack>
                </MenuItem>
              );
            })}
          </TextField>
        )}
      </Stack>

      {!isDesktop && !testInProgress && (
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
            // A running test collapses to a single full-width column so
            // nothing distracts from it — this must win over focus mode, else
            // the lone centre column lands in focus mode's narrow 220px track.
            // Focus mode otherwise narrows the left and drops the right rail.
            md: testInProgress
              ? "1fr"
              : focusMode
                ? "220px 1fr"
                : aiRailOpen
                  ? "300px 1fr 360px"
                  : "300px 1fr",
          },
          gap: { xs: 2, md: 3 },
          alignItems: "start",
          transition:
            "grid-template-columns 220ms cubic-bezier(0.25, 1, 0.5, 1)",
        }}
      >
        {!testInProgress && (
          <Box sx={{ display: { xs: "none", md: "block" } }}>
            <LeftRail
              assessment={activeAssessment}
              focusMode={focusMode}
              onPomodoroStateChange={setPomodoroState}
            />
          </Box>
        )}

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
                {isDesktop && !focusMode && !testInProgress && (
                  <Tooltip title={aiRailOpen ? "Hide AI tutor" : "Show AI tutor"}>
                    <IconButton
                      size="small"
                      onClick={() => setAiRailOpen((v) => !v)}
                      aria-label={aiRailOpen ? "Hide AI tutor" : "Show AI tutor"}
                      color={aiRailOpen ? "primary" : "default"}
                    >
                      <SmartToyIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
              </Stack>
            </Stack>

            {viewMode === "split" && splitSlots ? (
              splitSlots
            ) : (
              <Box sx={{ p: { xs: 2, sm: 3 } }}>{editorSlots}</Box>
            )}
          </CardContent>
        </Card>

        {!focusMode && aiRailOpen && !testInProgress && (
          <Box sx={{ display: { xs: "none", md: "block" } }}>
            <RightRail assessment={activeAssessment} subject={subject} />
          </Box>
        )}
      </Box>

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
        open={(focusMode || !isDesktop) && aiOpen && !testInProgress}
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
    case "draft":    return <DraftPanel    assessmentId={activeId} draftTitle={assessment.title} type={assessment.type} />;
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
  // Test/exam SBAs carry their own countdown inside the runner, so a generic
  // 25-minute Pomodoro here would be a second, contradictory clock. Drop it
  // for those types; keep it for essays, projects, and the like where a focus
  // timer genuinely helps.
  const hasOwnTimer = assessment.type === "test" || assessment.type === "exam";

  return (
    <Stack spacing={2.5} sx={{ position: { md: "sticky" }, top: { md: 88 } }}>
      {!hasOwnTimer && (
        <FocusTimer
          assessmentId={assessment.id}
          onStateChange={onPomodoroStateChange}
        />
      )}

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

// Long-form draft — shown for essay and oral assessments. Oral reframes it
// as a speech script (you're writing to be spoken, not read).
function DraftPanel({
  assessmentId,
  draftTitle,
  type,
}: {
  assessmentId: string | null;
  draftTitle: string;
  type: AssessmentType;
}) {
  const isOral = type === "oral";
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
  // Reading pace ~200 wpm; spoken delivery is slower (~130 wpm), so an oral
  // of the same length runs longer out loud.
  const paceWpm = isOral ? 130 : 200;
  const readMinutes = wordCount === 0 ? 0 : Math.max(1, Math.round(wordCount / paceWpm));

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
        placeholder={
          isOral
            ? "Write your speech the way you'll say it — open strong, mark your pauses…"
            : "Open with a hook your reader can't ignore…"
        }
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
              <Typography variant="caption" color="text.secondary">~{readMinutes} min {isOral ? "spoken" : "read"}</Typography>
            </>
          )}
          <AutosaveBadge state={draft.state} />
        </Stack>
        <Button variant="contained" onClick={submit} disabled={!assessmentId || updateAssessment.isPending || !trimmed}>
          {updateAssessment.isPending ? "Submitting…" : isOral ? "Submit script" : "Submit draft"}
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

// Practice tab — shown for tests/exams. Lists real practice tests filtered
// to the SBA's subject; "Start" runs the test inline via <PracticeRunner>
// so the student stays in the workspace instead of routing to a separate
// page. Results and review render in place; "Back to tests" returns here.
function PracticePanel({
  assessment,
  subject,
  onRunningChange,
}: {
  assessment: Assessment;
  subject?: Subject;
  // Fired when a test starts / stops running, so the page can shut off the
  // AI tutor and clear the rails for the duration of an attempt.
  onRunningChange?: (running: boolean) => void;
}) {
  const query = usePracticeTests();
  const all = query.data ?? [];
  const forSubject = useMemo(
    () => all.filter((t) => t.subjectId === assessment.subjectId),
    [all, assessment.subjectId],
  );

  const [runningTestId, setRunningTestId] = useState<string | null>(null);

  useEffect(() => {
    onRunningChange?.(runningTestId != null);
  }, [runningTestId, onRunningChange]);

  // Leaving the workspace / switching assessment must not strand the page in
  // test mode.
  useEffect(() => {
    return () => onRunningChange?.(false);
  }, [onRunningChange]);

  // Taking a test: render the runner inline, with a back control so the
  // student can bail out to the list at any point.
  if (runningTestId) {
    return (
      <Stack spacing={2}>
        <Button
          onClick={() => setRunningTestId(null)}
          startIcon={<ChevronLeft size={16} />}
          color="inherit"
          size="small"
          sx={{ alignSelf: "flex-start" }}
        >
          Back to tests
        </Button>
        <PracticeRunner testId={runningTestId} onExit={() => setRunningTestId(null)} />
      </Stack>
    );
  }

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
          Generate a test for {subject?.name ?? "your subject"} from the Practice page, then start it right here.
        </Typography>
        <Button component={Link} href="/dashboard/practice" variant="outlined" endIcon={<ArrowForwardIcon />}>
          Go to Practice
        </Button>
      </Box>
    );
  }

  return (
    <Stack spacing={1.5}>
      <Typography variant="body2" color="text.secondary">
        Practice for {subject?.name ?? "this subject"} — pick one to start a timed run here.
      </Typography>
      {forSubject.map((p) => (
        <PracticeRow key={p.id} test={p} onStart={() => setRunningTestId(p.id)} />
      ))}
    </Stack>
  );
}

function PracticeRow({ test, onStart }: { test: PracticeTest; onStart: () => void }) {
  const completed = test.attempts > 0;
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
        onClick={onStart}
        variant={completed ? "outlined" : "contained"}
        size="small"
        sx={{ flexShrink: 0 }}
      >
        {completed ? "View results" : "Start"}
      </Button>
    </Box>
  );
}

// ============================================================
// RIGHT RAIL — AI tutor only
// ============================================================

function RightRail({ assessment, subject }: { assessment: Assessment; subject: Subject | undefined }) {
  return (
    <Stack spacing={2.5} sx={{ position: { md: "sticky" }, top: { md: 88 } }}>
      <AiTutorChat assessment={assessment} subject={subject} />
    </Stack>
  );
}

// Bound the tutor history. The tail is all that matters for context, so we
// never let a long session grow localStorage or the tokens re-sent each turn
// without limit. Storage keeps a little more than we send.
const MAX_STORED_MESSAGES = 50;
const MAX_SENT_MESSAGES = 24;

function AiTutorChat({ assessment, subject }: { assessment: Assessment; subject: Subject | undefined }) {
  const storageKey = `aptiverse.workspace.chat.${assessment.id}`;
  const greeting = useMemo<AiChatMessage>(
    () => ({
      role: "assistant",
      content: `Ask me anything about ${assessment.title}${subject ? ` (${subject.name})` : ""}. I can explain the concepts, work through problems step by step, and check your reasoning.`,
    }),
    [assessment.title, subject?.name],
  );
  const [messages, setMessages] = useState<AiChatMessage[]>([greeting]);
  const [input, setInput] = useState("");
  // The reply currently being revealed on screen, character by character, so
  // it reads as though the tutor is typing rather than pasting a wall of text
  // at once. Null when nothing is streaming; the finished reply is committed
  // to `messages` when the reveal completes.
  const [streaming, setStreaming] = useState<string | null>(null);
  const ask = useAiTutor();
  const scrollRef = useRef<HTMLDivElement>(null);
  const revealRef = useRef<number | null>(null);
  const busy = ask.isPending || streaming !== null;

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, ask.isPending, streaming]);

  // Stop the reveal loop if the panel unmounts mid-type.
  useEffect(
    () => () => {
      if (revealRef.current) cancelAnimationFrame(revealRef.current);
    },
    [],
  );

  // Persist the conversation per assessment (device-local) so a reload, or
  // switching assessment and back, restores what was said. A lone greeting
  // is not stored: an untouched tutor should leave no trace.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem(storageKey);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as AiChatMessage[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
          return;
        }
      } catch {
        /* fall through to a fresh greeting */
      }
    }
    setMessages([greeting]);
    // Reload only when the assessment (storage key) changes, not whenever the
    // greeting identity churns.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (messages.length <= 1) {
      window.localStorage.removeItem(storageKey);
      return;
    }
    // Keep the greeting plus the most recent turns, not the whole transcript,
    // so one assessment's chat stays a few KB no matter how long it runs.
    const capped =
      messages.length > MAX_STORED_MESSAGES
        ? [messages[0], ...messages.slice(-(MAX_STORED_MESSAGES - 1))]
        : messages;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(capped));
    } catch {
      // Quota exceeded or storage disabled: drop this conversation rather
      // than throwing. The live session keeps working from memory.
      try {
        window.localStorage.removeItem(storageKey);
      } catch {
        /* storage unavailable entirely — nothing more to do */
      }
    }
  }, [messages, storageKey]);

  // Reveal a finished reply word by word, then commit it. Driven by
  // requestAnimationFrame (so it's paced to the display and never fights the
  // browser's paint) and stepped in whole words: text never reflows in the
  // middle of a word, which is what made the character version stutter.
  const revealReply = (full: string) => {
    if (revealRef.current) cancelAnimationFrame(revealRef.current);
    // Keep whitespace as its own tokens so joining a prefix preserves spacing.
    const tokens = full.split(/(\s+)/);
    const total = tokens.length;
    const perFrame = Math.max(1, Math.ceil(total / 90)); // ~1.5s for long replies
    let shown = 0;
    setStreaming("");
    const tick = () => {
      shown = Math.min(total, shown + perFrame);
      setStreaming(tokens.slice(0, shown).join(""));
      if (shown < total) {
        revealRef.current = requestAnimationFrame(tick);
      } else {
        revealRef.current = null;
        setStreaming(null);
        setMessages((m) => [...m, { role: "assistant", content: full }]);
      }
    };
    revealRef.current = requestAnimationFrame(tick);
  };

  const send = () => {
    const text = input.trim();
    if (!text || busy) return;
    const isFirstUserTurn = messages.length <= 1;
    // The chat bubble shows only what the student typed. The working
    // context is injected into the first user turn for the API alone, so
    // the tutor is oriented without the "[Context: …]" line leaking on screen.
    const userMessage: AiChatMessage = { role: "user", content: text };
    const next = [...messages, userMessage];
    setMessages(next);
    setInput("");
    const contextLine = `[Context: working on "${assessment.title}"${subject ? ` for ${subject.name}` : ""}, due ${dayjs(assessment.dueDate).format("DD MMM")}.]`;
    const withContext = isFirstUserTurn
      ? next.map((m, i) =>
          i === next.length - 1 ? { ...m, content: `${contextLine}\n\n${m.content}` } : m,
        )
      : next;
    // Send only the recent tail so the request (and its token cost) stays
    // bounded as the conversation grows.
    const payload =
      withContext.length > MAX_SENT_MESSAGES ? withContext.slice(-MAX_SENT_MESSAGES) : withContext;
    ask.mutate({ messages: payload }, {
      onSuccess: (data) => revealReply(data.reply),
      onError: (err) =>
        setMessages((m) => [
          ...m,
          {
            role: "assistant",
            content:
              err.status === 503
                ? "The AI is unavailable right now. Try again in a moment."
                : err.status === 402
                  ? "You've used this month's AI replies. Upgrade your plan or wait for next month."
                  : "Something went wrong on my side. Try again in a moment.",
          },
        ]),
    });
  };

  return (
    <Card sx={{ height: { xs: "calc(100dvh - 150px)", md: "calc(100dvh - 132px)" }, minHeight: 420, maxHeight: { md: 820 }, display: "flex", flexDirection: "column" }}>
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
        <Avatar sx={{ bgcolor: "primary.main", width: 32, height: 32 }}>
          <SmartToyIcon fontSize="small" sx={{ color: "primary.contrastText" }} />
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>AI tutor</Typography>
          <Typography
            variant="caption"
            color={ask.isPending ? "warning.main" : streaming !== null ? "secondary.main" : "success.main"}
          >
            {ask.isPending ? "Thinking…" : streaming !== null ? "Typing…" : "Online"}
          </Typography>
        </Box>
      </Stack>
      <Box ref={scrollRef} sx={{ flex: 1, overflowY: "auto", p: 2 }}>
        <Stack spacing={1.25}>
          {messages.map((m, i) =>
            m.role === "assistant" ? (
              <ChatBubble key={i} role="assistant" markdown={m.content} />
            ) : (
              <ChatBubble key={i} role="user">
                {m.content}
              </ChatBubble>
            ),
          )}
          {streaming !== null && (
            <ChatBubble role="assistant">
              {streaming}
              <Box
                component="span"
                sx={{
                  display: "inline-block",
                  width: "2px",
                  height: "1.05em",
                  ml: "1px",
                  verticalAlign: "text-bottom",
                  bgcolor: "text.secondary",
                  animation: "caret 1s steps(1) infinite",
                  "@keyframes caret": { "50%": { opacity: 0 } },
                }}
              />
            </ChatBubble>
          )}
          {ask.isPending && (
            <Box sx={{ alignSelf: "flex-start", px: 1.75, py: 1.25, borderRadius: "14px 14px 14px 4px", bgcolor: "action.hover", border: 1, borderColor: "divider", display: "flex", gap: 0.5 }}>
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
            disabled={busy}
            inputProps={{ id: AI_TUTOR_INPUT_ID }}
          />
          <IconButton color="primary" onClick={send} disabled={!input.trim() || busy} aria-label="Send">
            <SendIcon />
          </IconButton>
        </Stack>
      </Box>
    </Card>
  );
}

// A single chat bubble. Assistant bubbles are a bordered surface tail-left,
// the student's are the primary fill tail-right, so the two speakers read at
// a glance in the narrow rail. `markdown` renders a finished reply as rich
// text (headings, lists, code, math); plain children (the student's message,
// or a reply mid-reveal) stay pre-wrap so nothing reflows while it types.
function ChatBubble({
  role,
  markdown,
  children,
}: {
  role: "user" | "assistant";
  markdown?: string;
  children?: React.ReactNode;
}) {
  const isUser = role === "user";
  return (
    <Box
      sx={{
        alignSelf: isUser ? "flex-end" : "flex-start",
        maxWidth: "88%",
        px: 1.75,
        py: 1.25,
        borderRadius: isUser ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
        bgcolor: isUser ? "primary.main" : "action.hover",
        color: isUser ? "primary.contrastText" : "text.primary",
        border: isUser ? "none" : 1,
        borderColor: "divider",
      }}
    >
      {markdown != null ? (
        <Markdown>{markdown}</Markdown>
      ) : (
        <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word", lineHeight: 1.55 }}>
          {children}
        </Typography>
      )}
    </Box>
  );
}
