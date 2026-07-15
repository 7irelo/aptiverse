"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Tooltip from "@mui/material/Tooltip";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import CircularProgress from "@mui/material/CircularProgress";
import ListItemIcon from "@mui/material/ListItemIcon";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import useMediaQuery from "@mui/material/useMediaQuery";
import { alpha, useTheme } from "@mui/material/styles";
import SendIcon from "@mui/icons-material/SendRounded";
import SmartToyIcon from "@mui/icons-material/SmartToyOutlined";
import AddCommentIcon from "@mui/icons-material/AddCommentOutlined";
import HistoryIcon from "@mui/icons-material/HistoryOutlined";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweepOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesomeOutlined";
import BoltIcon from "@mui/icons-material/BoltOutlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";
import CheckIcon from "@mui/icons-material/Check";
import { Markdown } from "@/components/common/Markdown";
import {
  useAiTutor,
  useAcademicProfile,
  useAcademicUnits,
  useAcademicSignals,
  useTopicMastery,
  useAssessments,
  useTutorConversations,
  useTutorConversation,
  useCreateTutorConversation,
  useSaveTutorConversation,
  useDeleteTutorConversation,
  useClearTutorConversations,
  type AiChatMessage,
  type TutorConversationSummary,
  type AcademicUnit,
  type UnitSignal,
  type TopicMastery,
} from "@/lib/api/queries";
import type { Assessment, AcademicProfile } from "@/lib/mockData";
import { ApiError } from "@/lib/api/fetcher";

type ChatMessage = { role: "user" | "assistant"; content: string; error?: boolean };

const QUICK_PROMPTS = [
  "Explain a concept I'm stuck on, simply",
  "Generate 5 practice problems with solutions",
  "Help me outline an essay",
  "Quiz me on a topic",
];

const DEEP_KEY = "aptiverse.chatbot.deep";
const HISTORY_KEY = "aptiverse.chatbot.historyOpen";
const MAX_SENT_MESSAGES = 24;

// Mirrors MaxConversationsPerStudent on the server. Only used to tell the
// student what the cap is; the server is the one that enforces it.
const MAX_CONVERSATIONS = 20;

function errorText(e: unknown): string {
  if (e instanceof ApiError) {
    if (e.status === 402)
      return "You've used this month's AI replies. You can switch off Deep mode, upgrade from Billing, or wait for next month's reset.";
    if (e.status === 503) return "The AI tutor isn't switched on in this environment yet.";
    return e.message || "Something went wrong. Please try again.";
  }
  return "Something went wrong. Please try again.";
}

const toApi = (messages: ChatMessage[]): AiChatMessage[] =>
  messages.filter((m) => !m.error).map((m) => ({ role: m.role, content: m.content }));

// Builds the plain-text student profile handed to the tutor's system prompt:
// identity, per-unit marks + topic strengths/weak areas, and upcoming
// assessments. Returns null when there's nothing to say yet.
function buildStudentContext(args: {
  firstName: string;
  profile: AcademicProfile | null;
  units: AcademicUnit[];
  unitNounPlural: string;
  nameFor: (id: string | null | undefined) => string | undefined;
  signalsFor: (unitId: string) => UnitSignal;
  mastery: TopicMastery[];
  assessments: Assessment[];
}): string | null {
  const { firstName, profile, units, unitNounPlural, nameFor, signalsFor, mastery, assessments } =
    args;
  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-ZA", { day: "numeric", month: "short" });

  const head: string[] = [];
  if (firstName) head.push(`Name: ${firstName}`);
  if (profile?.educationLevel === "tertiary") head.push("Level: university / tertiary student");
  else if (profile?.grade) head.push(`Level: Grade ${profile.grade} (South African high school)`);
  if (profile?.school) head.push(`School or institution: ${profile.school}`);

  const unitLines = units.map((u) => {
    const s = signalsFor(u.id);
    const topics = mastery.filter((t) => t.subjectId === u.id);
    const weak = [...topics]
      .sort((a, b) => a.mastery - b.mastery)
      .slice(0, 3)
      .map((t) => `${t.topic} (${t.mastery}%)`);
    const strong = [...topics]
      .sort((a, b) => b.mastery - a.mastery)
      .slice(0, 2)
      .map((t) => `${t.topic} (${t.mastery}%)`);
    const parts: string[] = [];
    parts.push(s.currentMark != null ? `current mark ${s.currentMark}%` : "no marks logged yet");
    if (s.predictedMark != null) parts.push(`predicted ${s.predictedMark}%`);
    if (strong.length) parts.push(`strong: ${strong.join(", ")}`);
    if (weak.length) parts.push(`needs work: ${weak.join(", ")}`);
    if (s.nextAssessment)
      parts.push(`next assessment: ${s.nextAssessment.title} due ${fmtDate(s.nextAssessment.dueDate)}`);
    return `- ${u.name}: ${parts.join("; ")}.`;
  });

  const upcoming = assessments
    .filter((a) => a.status !== "graded" && new Date(a.dueDate).getTime() >= Date.now() - 86_400_000)
    .sort((a, b) => +new Date(a.dueDate) - +new Date(b.dueDate))
    .slice(0, 5)
    .map((a) => `- ${fmtDate(a.dueDate)}: ${nameFor(a.subjectId) ?? "a subject"} — ${a.title} (${a.type})`);

  const sections: string[] = [];
  if (head.length) sections.push(head.join("\n"));
  if (unitLines.length) sections.push(`How their ${unitNounPlural} are going:\n${unitLines.join("\n")}`);
  if (upcoming.length) sections.push(`Upcoming assessments (soonest first):\n${upcoming.join("\n")}`);

  return sections.length ? sections.join("\n\n") : null;
}

export default function ChatbotPage() {
  const theme = useTheme();
  const mdUp = useMediaQuery(theme.breakpoints.up("md"));

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState<string | null>(null);
  const [deep, setDeep] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  // One flag, two behaviours: on desktop it collapses the rail in place, on
  // mobile it opens the drawer. Starts closed on mobile either way.
  const [historyOpen, setHistoryOpen] = useState(false);
  const [clearOpen, setClearOpen] = useState(false);

  const tutor = useAiTutor();
  const conversations = useTutorConversations();
  const activeConvo = useTutorConversation(activeId);
  const createConvo = useCreateTutorConversation();
  const saveConvo = useSaveTutorConversation();
  const deleteConvo = useDeleteTutorConversation();
  const clearConvos = useClearTutorConversations();

  const scrollRef = useRef<HTMLDivElement>(null);
  const revealRef = useRef<number | null>(null);
  // Tracks which conversation id's server messages are already loaded into the
  // local transcript, so switching loads once and sends never re-clobber it.
  const loadedIdRef = useRef<string | null>(null);
  // One-shot latch for the history-rail preference restore. See the effect below.
  const restoredRef = useRef(false);
  const busy = tutor.isPending || streaming !== null;

  const { data: session } = useSession();
  const profileQuery = useAcademicProfile();
  const academic = useAcademicUnits();
  const signals = useAcademicSignals();
  const masteryQuery = useTopicMastery();
  const assessmentsQuery = useAssessments();
  const firstName = (session?.user?.name || "").trim().split(/\s+/)[0] || "";

  // Restore the deep-mode preference.
  useEffect(() => {
    if (typeof window === "undefined") return;
    setDeep(window.localStorage.getItem(DEEP_KEY) === "1");
  }, []);

  // Restore the rail's open state on desktop only: on mobile it's a drawer,
  // which must always start closed.
  //
  // This waits for mdUp rather than running on mount, because useMediaQuery
  // reports false on the first render (it has no window to measure during SSR)
  // and only reports the truth after hydration. Restoring on mount therefore
  // read mdUp === false on a 1920px screen and left the rail collapsed. The ref
  // keeps it a one-shot: dragging a window across the breakpoint later must not
  // re-open a rail the student deliberately closed.
  useEffect(() => {
    if (!mdUp || restoredRef.current) return;
    restoredRef.current = true;
    setHistoryOpen(window.localStorage.getItem(HISTORY_KEY) !== "0");
  }, [mdUp]);

  const toggleHistory = () => {
    const next = !historyOpen;
    setHistoryOpen(next);
    if (!mdUp) return;
    try {
      window.localStorage.setItem(HISTORY_KEY, next ? "1" : "0");
    } catch {
      /* storage unavailable — preference just won't persist */
    }
  };
  const applyDeep = (next: boolean) => {
    setDeep(next);
    try {
      window.localStorage.setItem(DEEP_KEY, next ? "1" : "0");
    } catch {
      /* storage unavailable — preference just won't persist */
    }
  };

  // The student's full academic picture, sent with each request and injected
  // into the tutor's system prompt server-side (never shown on screen): who
  // they are, how each subject/course is going (marks + topic mastery), and
  // what's coming up. Recomputed each render from the live query data; cheap.
  const studentContext = buildStudentContext({
    firstName,
    profile: profileQuery.data ?? null,
    units: academic.units,
    unitNounPlural: academic.unitNounPlural,
    nameFor: academic.nameFor,
    signalsFor: signals.signalsFor,
    mastery: masteryQuery.data ?? [],
    assessments: assessmentsQuery.data ?? [],
  });

  // Load an existing conversation's transcript when the user switches to it.
  useEffect(() => {
    if (!activeId) return;
    if (activeConvo.data?.id === activeId && loadedIdRef.current !== activeId) {
      setMessages(activeConvo.data.messages.map((m) => ({ role: m.role, content: m.content })));
      loadedIdRef.current = activeId;
    }
  }, [activeId, activeConvo.data]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, tutor.isPending, streaming]);

  useEffect(
    () => () => {
      if (revealRef.current) cancelAnimationFrame(revealRef.current);
    },
    [],
  );

  // Persist the finished transcript: update the active conversation, or create
  // one on the first turn. Never loses data — "New chat" no longer wipes.
  const persist = (finalMessages: ChatMessage[]) => {
    const api = toApi(finalMessages);
    if (api.length === 0) return;
    if (activeId) {
      saveConvo.mutate({ id: activeId, messages: api });
    } else {
      createConvo.mutate(
        { messages: api },
        {
          onSuccess: (convo) => {
            loadedIdRef.current = convo.id;
            setActiveId(convo.id);
          },
        },
      );
    }
  };

  // Time-driven word-by-word reveal (~22 words/sec), then commit + persist.
  const revealReply = (full: string, base: ChatMessage[]) => {
    if (revealRef.current) cancelAnimationFrame(revealRef.current);
    const finalMessages = [...base, { role: "assistant" as const, content: full }];
    const commit = () => {
      setMessages(finalMessages);
      persist(finalMessages);
    };

    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setStreaming(null);
      commit();
      return;
    }

    const tokens = full.split(/(\s+)/);
    const total = tokens.length;
    const words = Math.max(1, Math.ceil(total / 2));
    const duration = Math.min(5200, Math.max(950, words * 45));
    let startTs: number | null = null;
    setStreaming("");
    const tick = (ts: number) => {
      if (startTs === null) startTs = ts;
      const t = Math.min(1, (ts - startTs) / duration);
      const shown = Math.max(1, Math.floor(t * total));
      setStreaming(tokens.slice(0, shown).join(""));
      if (t < 1) {
        revealRef.current = requestAnimationFrame(tick);
      } else {
        revealRef.current = null;
        setStreaming(null);
        commit();
      }
    };
    revealRef.current = requestAnimationFrame(tick);
  };

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || busy) return;

    const next = [...messages, { role: "user" as const, content: trimmed }];
    setMessages(next);
    setInput("");

    const payloadFull = toApi(next);
    const payload =
      payloadFull.length > MAX_SENT_MESSAGES ? payloadFull.slice(-MAX_SENT_MESSAGES) : payloadFull;

    tutor.mutate(
      { messages: payload, deep, studentContext: studentContext ?? undefined },
      {
        onSuccess: (data) => revealReply(data.reply, next),
        onError: (e) => {
          const withError = [...next, { role: "assistant" as const, content: errorText(e), error: true }];
          setMessages(withError);
        },
      },
    );
  };

  const newChat = () => {
    if (busy) return;
    if (revealRef.current) cancelAnimationFrame(revealRef.current);
    revealRef.current = null;
    setStreaming(null);
    setActiveId(null);
    loadedIdRef.current = null;
    setMessages([]);
    setInput("");
    closeDrawer();
  };

  // Picking a chat on mobile should get the drawer out of the way; on desktop
  // the rail is the navigation, so it stays put.
  const closeDrawer = () => {
    if (!mdUp) setHistoryOpen(false);
  };

  const selectConversation = (id: string) => {
    if (busy || id === activeId) {
      closeDrawer();
      return;
    }
    setActiveId(id);
    closeDrawer();
  };

  const removeConversation = (id: string) => {
    deleteConvo.mutate(id);
    if (id === activeId) newChat();
  };

  const clearHistory = () => {
    setClearOpen(false);
    clearConvos.mutate(undefined, { onSuccess: () => newChat() });
  };

  const renameConversation = (id: string, title: string) => {
    saveConvo.mutate({ id, title });
  };

  const loadingConvo = !!activeId && loadedIdRef.current !== activeId;
  const empty = messages.length === 0 && streaming === null && !loadingConvo;
  const status = tutor.isPending ? "Thinking…" : streaming !== null ? "Typing…" : "Online";

  const sidebar = (
    <HistorySidebar
      items={conversations.data ?? []}
      loading={conversations.isLoading}
      activeId={activeId}
      onSelect={selectConversation}
      onNew={newChat}
      onDelete={removeConversation}
      onRename={renameConversation}
      onClear={() => setClearOpen(true)}
      onCollapse={mdUp ? toggleHistory : () => setHistoryOpen(false)}
      clearing={clearConvos.isPending}
      disabled={busy}
    />
  );

  return (
    // Full-bleed: the shell drops its padding and measure for this route and
    // pins itself to one viewport, so the chat fills whatever is left under the
    // top bar instead of sitting in a card. Filling (flex: 1) rather than
    // measuring (calc(100dvh - 68px)) is deliberate: the old sum ignored the
    // top bar's 1px border and pushed the document 1px past the viewport, which
    // is all Chrome needs to paint a full-height page scrollbar. History is a
    // rail with a single dividing line, the way a chat surface reads, not a
    // floating panel.
    <Box
      sx={{
        flex: 1,
        display: "flex",
        minHeight: 0,
        overflow: "hidden",
        bgcolor: "background.default",
      }}
    >
      {/* Chat column — first in source order, so the history rail sits on the
          right for sighted users AND is reached after the conversation by
          screen readers and keyboard tabbing. */}
      <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <Stack
          direction="row"
          alignItems="center"
          spacing={1.5}
          sx={{
            px: { xs: 2, sm: 3 },
            py: 1.5,
            flexShrink: 0,
            borderBottom: 1,
            borderColor: "divider",
            bgcolor: "background.paper",
          }}
        >
          <Avatar sx={{ bgcolor: "primary.main", width: 36, height: 36 }}>
            <SmartToyIcon fontSize="small" sx={{ color: "primary.contrastText" }} />
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }} noWrap>
              {activeConvo.data && activeId ? activeConvo.data.title : "AI Tutor"}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: tutor.isPending
                  ? "warning.main"
                  : streaming !== null
                    ? "secondary.main"
                    : "success.main",
              }}
            >
              {status}
              {deep ? " · Deep" : ""}
            </Typography>
          </Box>
          <Tooltip title="New chat">
            <span>
              <IconButton onClick={newChat} disabled={busy} aria-label="Start a new chat">
                <AddCommentIcon />
              </IconButton>
            </span>
          </Tooltip>
          {/* The only way back to the rail once it's collapsed, so it stays in
              the header at every width rather than living inside the rail. */}
          {(!mdUp || !historyOpen) && (
            <Tooltip title="Chat history">
              <IconButton
                onClick={() => (mdUp ? toggleHistory() : setHistoryOpen(true))}
                aria-label="Show chat history"
              >
                <HistoryIcon />
              </IconButton>
            </Tooltip>
          )}
        </Stack>

        {/* Conversation. The scrollbar is styled down to a thin muted track:
            the default is a 15px light slab that reads as chrome and butted
            straight into the history rail's divider. scrollbar-gutter keeps the
            space reserved so text doesn't reflow the moment a reply gets long
            enough to scroll. */}
        <Box
          ref={scrollRef}
          sx={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            overscrollBehavior: "contain",
            scrollbarGutter: "stable",
            px: { xs: 2, sm: 3 },
            scrollbarWidth: "thin",
            scrollbarColor: (t) => `${alpha(t.palette.text.primary, 0.2)} transparent`,
            "&::-webkit-scrollbar": { width: 10 },
            "&::-webkit-scrollbar-track": { background: "transparent" },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: (t) => alpha(t.palette.text.primary, 0.16),
              borderRadius: 8,
              border: "3px solid transparent",
              backgroundClip: "content-box",
            },
            "&::-webkit-scrollbar-thumb:hover": {
              backgroundColor: (t) => alpha(t.palette.text.primary, 0.3),
            },
          }}
        >
          <Box sx={{ maxWidth: 780, mx: "auto", py: 3 }}>
            {loadingConvo ? (
              <Stack alignItems="center" justifyContent="center" sx={{ minHeight: 240 }}>
                <CircularProgress size={26} />
              </Stack>
            ) : empty ? (
              <EmptyChat firstName={firstName} unitNoun={academic.unitNoun} onPick={send} busy={busy} />
            ) : (
              <Stack spacing={3}>
                {messages.map((m, i) =>
                  m.role === "assistant" ? (
                    <AssistantMessage key={i} content={m.content} error={m.error} />
                  ) : (
                    <UserMessage key={i} content={m.content} />
                  ),
                )}
                {/* Streams as rendered markdown, not plain text that reflows
                    into markdown at the end — headings, bold, lists and math
                    resolve as they arrive, so the reply never visibly restyles
                    itself once it settles. */}
                {streaming !== null && <AssistantMessage content={streaming} caret />}
                {tutor.isPending && <ThinkingRow deep={deep} />}
              </Stack>
            )}
          </Box>
        </Box>

        {/* Composer — docked to the bottom of the surface. */}
        <Box
          sx={{
            flexShrink: 0,
            px: { xs: 2, sm: 3 },
            pt: 1.5,
            pb: { xs: 1.5, sm: 2 },
            borderTop: 1,
            borderColor: "divider",
            bgcolor: "background.paper",
          }}
        >
          <Box sx={{ maxWidth: 780, mx: "auto" }}>
            <Stack
              direction="row"
              spacing={1.5}
              alignItems="center"
              sx={{
                pl: 2.25,
                pr: 1,
                py: 0.75,
                borderRadius: 3,
                border: 1,
                borderColor: "divider",
                bgcolor: "background.paper",
                transition: "border-color 150ms ease",
                "&:focus-within": { borderColor: "secondary.main" },
              }}
            >
              <TextField
                fullWidth
                variant="standard"
                placeholder="Ask your tutor anything"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send(input);
                  }
                }}
                multiline
                maxRows={6}
                InputProps={{
                  disableUnderline: true,
                  sx: { fontSize: "0.95rem", lineHeight: 1.5, py: 0 },
                }}
              />
              <IconButton
                onClick={() => send(input)}
                disabled={!input.trim() || busy}
                aria-label="Send"
                sx={{
                  flexShrink: 0,
                  alignSelf: "flex-end",
                  width: 40,
                  height: 40,
                  bgcolor: "secondary.main",
                  color: "secondary.contrastText",
                  "&:hover": { bgcolor: "secondary.dark" },
                  "&.Mui-disabled": { bgcolor: "action.disabledBackground", color: "text.disabled" },
                }}
              >
                <SendIcon fontSize="small" />
              </IconButton>
            </Stack>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              spacing={1}
              sx={{ mt: 1, px: 0.5 }}
            >
              <ModePicker deep={deep} onChange={applyDeep} disabled={busy} />
              <Typography variant="caption" color="text.secondary" sx={{ textAlign: "right" }}>
                The AI tutor can make mistakes. Check important facts.
              </Typography>
            </Stack>
          </Box>
        </Box>
      </Box>

      {/* History rail, right-hand side. Width animates to zero rather than
          unmounting, so collapsing keeps the list's scroll position and doesn't
          make it flash back in on reopen. */}
      {mdUp && (
        <Box
          sx={{
            width: historyOpen ? 272 : 0,
            flexShrink: 0,
            borderLeft: historyOpen ? 1 : 0,
            borderColor: "divider",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            bgcolor: "background.paper",
            transition: "width 200ms cubic-bezier(0.16, 1, 0.3, 1)",
            "@media (prefers-reduced-motion: reduce)": { transition: "none" },
          }}
          aria-hidden={!historyOpen}
        >
          <Box sx={{ width: 272, height: "100%", display: "flex", flexDirection: "column" }}>
            {sidebar}
          </Box>
        </Box>
      )}

      {!mdUp && (
        <Drawer anchor="right" open={historyOpen} onClose={() => setHistoryOpen(false)}>
          <Box sx={{ width: 288, height: "100%", display: "flex", flexDirection: "column" }}>
            {sidebar}
          </Box>
        </Drawer>
      )}

      <Dialog open={clearOpen} onClose={() => setClearOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Clear chat history?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This permanently deletes all {conversations.data?.length ?? 0} of your saved chats. The
            chat on screen stays until you leave the page, but it won't be saved.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setClearOpen(false)}>Cancel</Button>
          <Button onClick={clearHistory} color="error" variant="contained">
            Clear history
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

function HistorySidebar({
  items,
  loading,
  activeId,
  onSelect,
  onNew,
  onDelete,
  onRename,
  onClear,
  onCollapse,
  clearing,
  disabled,
}: {
  items: TutorConversationSummary[];
  loading: boolean;
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  onRename: (id: string, title: string) => void;
  onClear: () => void;
  onCollapse: () => void;
  clearing: boolean;
  disabled: boolean;
}) {
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [menuId, setMenuId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const openMenu = (e: React.MouseEvent<HTMLElement>, id: string) => {
    e.stopPropagation();
    setMenuAnchor(e.currentTarget);
    setMenuId(id);
  };
  const closeMenu = () => {
    setMenuAnchor(null);
    setMenuId(null);
  };
  const startRename = (item: TutorConversationSummary) => {
    setRenamingId(item.id);
    setRenameValue(item.title);
    closeMenu();
  };
  const commitRename = () => {
    if (renamingId && renameValue.trim()) onRename(renamingId, renameValue.trim());
    setRenamingId(null);
    setRenameValue("");
  };

  return (
    <>
      <Stack
        direction="row"
        alignItems="center"
        spacing={0.5}
        sx={{ pl: 2, pr: 1, py: 1.5, minHeight: 64, flexShrink: 0 }}
      >
        <Typography variant="subtitle2" sx={{ flex: 1, fontWeight: 700 }}>
          Chats
        </Typography>
        <Tooltip title="Clear history">
          <span>
            <IconButton
              size="small"
              onClick={onClear}
              disabled={items.length === 0 || clearing}
              aria-label="Clear chat history"
            >
              {clearing ? <CircularProgress size={18} /> : <DeleteSweepIcon fontSize="small" />}
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="Hide history">
          <IconButton size="small" onClick={onCollapse} aria-label="Hide chat history">
            <KeyboardDoubleArrowRightIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>
      <Box sx={{ px: 1.5, pb: 1.5 }}>
        <Button
          fullWidth
          variant="outlined"
          color="secondary"
          startIcon={<AddCommentIcon />}
          onClick={onNew}
          disabled={disabled}
          sx={{ justifyContent: "flex-start", textTransform: "none", borderRadius: 2 }}
        >
          New chat
        </Button>
      </Box>
      <Divider />
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          overscrollBehavior: "contain",
          scrollbarWidth: "thin",
          scrollbarColor: (t) => `${alpha(t.palette.text.primary, 0.2)} transparent`,
          "&::-webkit-scrollbar": { width: 10 },
          "&::-webkit-scrollbar-track": { background: "transparent" },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: (t) => alpha(t.palette.text.primary, 0.16),
            borderRadius: 8,
            border: "3px solid transparent",
            backgroundClip: "content-box",
          },
        }}
      >
        {loading ? (
          <Stack alignItems="center" sx={{ py: 4 }}>
            <CircularProgress size={20} />
          </Stack>
        ) : items.length === 0 ? (
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", px: 2, py: 3, textAlign: "center" }}>
            Your past chats will appear here.
          </Typography>
        ) : (
          <List dense disablePadding sx={{ px: 1, py: 0.5 }}>
            {items.map((item) =>
              renamingId === item.id ? (
                <Box key={item.id} sx={{ px: 1, py: 0.5 }}>
                  <TextField
                    autoFocus
                    fullWidth
                    size="small"
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onBlur={commitRename}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        commitRename();
                      } else if (e.key === "Escape") {
                        setRenamingId(null);
                      }
                    }}
                  />
                </Box>
              ) : (
                <ListItemButton
                  key={item.id}
                  selected={item.id === activeId}
                  onClick={() => onSelect(item.id)}
                  sx={{ borderRadius: 2, mb: 0.25, pr: 1, alignItems: "flex-start" }}
                >
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                      {item.title}
                    </Typography>
                    {item.preview && (
                      <Typography variant="caption" color="text.secondary" noWrap sx={{ display: "block" }}>
                        {item.preview}
                      </Typography>
                    )}
                  </Box>
                  <IconButton
                    size="small"
                    edge="end"
                    onClick={(e) => openMenu(e, item.id)}
                    aria-label="Conversation options"
                    sx={{ ml: 0.5, mt: -0.25 }}
                  >
                    <MoreVertIcon fontSize="small" />
                  </IconButton>
                </ListItemButton>
              ),
            )}
          </List>
        )}
      </Box>

      {/* Surfaces the cap only once it's about to bite. Saying "20 max" to a
          student with three chats is noise; saying it as the oldest starts
          dropping off is the difference between a bug and a rule. */}
      {items.length >= MAX_CONVERSATIONS && (
        <>
          <Divider />
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", px: 2, py: 1.25, lineHeight: 1.4 }}
          >
            Your last {MAX_CONVERSATIONS} chats are kept. Starting a new one removes the oldest.
          </Typography>
        </>
      )}

      <Menu anchorEl={menuAnchor} open={!!menuAnchor} onClose={closeMenu}>
        <MenuItem
          onClick={() => {
            const item = items.find((i) => i.id === menuId);
            if (item) startRename(item);
          }}
        >
          <ListItemIcon>
            <EditOutlinedIcon fontSize="small" />
          </ListItemIcon>
          Rename
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (menuId) onDelete(menuId);
            closeMenu();
          }}
          sx={{ color: "error.main" }}
        >
          <ListItemIcon>
            <DeleteOutlineIcon fontSize="small" sx={{ color: "error.main" }} />
          </ListItemIcon>
          Delete
        </MenuItem>
      </Menu>
    </>
  );
}

const MODES = [
  {
    key: "standard" as const,
    label: "Standard",
    desc: "Fast answers for everyday questions.",
    Icon: BoltIcon,
  },
  {
    key: "deep" as const,
    label: "Deep",
    desc: "Slower, but thinks harder through tough, multi-step problems.",
    Icon: AutoAwesomeIcon,
  },
];

// Composer mode selector, styled like a model picker: a labelled button that
// shows the current mode and opens a menu explaining both. Clearer than a
// filled/outlined chip, where "on" was ambiguous.
function ModePicker({
  deep,
  onChange,
  disabled,
}: {
  deep: boolean;
  onChange: (deep: boolean) => void;
  disabled: boolean;
}) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const current = deep ? MODES[1] : MODES[0];
  const CurrentIcon = current.Icon;

  return (
    <>
      <Button
        onClick={(e) => setAnchor(e.currentTarget)}
        disabled={disabled}
        size="small"
        startIcon={
          <CurrentIcon fontSize="small" sx={{ color: deep ? "secondary.main" : "text.secondary" }} />
        }
        endIcon={<KeyboardArrowDownIcon fontSize="small" />}
        aria-haspopup="menu"
        sx={{ textTransform: "none", color: "text.primary", fontWeight: 600, borderRadius: 2, px: 1 }}
      >
        {current.label}
      </Button>
      <Menu
        anchorEl={anchor}
        open={!!anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: "top", horizontal: "left" }}
        transformOrigin={{ vertical: "bottom", horizontal: "left" }}
        slotProps={{ paper: { sx: { maxWidth: 320 } } }}
      >
        {MODES.map((m) => {
          const selected = (m.key === "deep") === deep;
          const Icon = m.Icon;
          return (
            <MenuItem
              key={m.key}
              selected={selected}
              onClick={() => {
                onChange(m.key === "deep");
                setAnchor(null);
              }}
              sx={{ alignItems: "flex-start", py: 1, whiteSpace: "normal" }}
            >
              <ListItemIcon sx={{ mt: 0.25 }}>
                <Icon
                  fontSize="small"
                  sx={{ color: m.key === "deep" ? "secondary.main" : "text.secondary" }}
                />
              </ListItemIcon>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {m.label}
                  </Typography>
                  {selected && <CheckIcon fontSize="small" sx={{ color: "secondary.main" }} />}
                </Stack>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "block", lineHeight: 1.35 }}
                >
                  {m.desc}
                </Typography>
              </Box>
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
}

const messageIn = {
  animation: "messageIn 260ms cubic-bezier(0.16, 1, 0.3, 1)",
  "@keyframes messageIn": {
    from: { opacity: 0, transform: "translateY(8px)" },
    to: { opacity: 1, transform: "translateY(0)" },
  },
  "@media (prefers-reduced-motion: reduce)": { animation: "none" },
} as const;

// What the student said. This one keeps its bubble: it's the shorter half of
// the transcript and the fill is what makes the back-and-forth scannable when
// you're skimming for your own question.
function UserMessage({ content }: { content: string }) {
  return (
    <Stack direction="row" justifyContent="flex-end" sx={messageIn}>
      <Box
        sx={{
          maxWidth: "80%",
          px: 2,
          py: 1.25,
          borderRadius: "18px 18px 4px 18px",
          bgcolor: "primary.main",
          color: "primary.contrastText",
        }}
      >
        <Typography
          component="div"
          sx={{ fontSize: "0.9375rem", lineHeight: 1.55, whiteSpace: "pre-wrap", wordBreak: "break-word" }}
        >
          {content}
        </Typography>
      </Box>
    </Stack>
  );
}

// What the tutor said. No bubble, no avatar, no fill: the reply is the page's
// main content, and boxing it fought the long-form answers this tutor actually
// gives — worked examples, headings, lists, math. Reads as a document, the way
// the student's own notes would. Errors are the exception: they're the system
// speaking, not the tutor, so they get a tinted callout to say so.
function AssistantMessage({
  content,
  error,
  caret,
}: {
  content: string;
  error?: boolean;
  // Blinking caret trailing the last line while a reply streams in. Attached
  // via ::after on the final block so it sits inline at the end of the text
  // rather than orphaned on its own line under a rendered markdown block.
  caret?: boolean;
}) {
  if (error) {
    return (
      <Box
        sx={{
          ...messageIn,
          px: 2,
          py: 1.25,
          borderRadius: 2,
          bgcolor: (t) => alpha(t.palette.warning.main, 0.14),
          border: 1,
          borderColor: (t) => alpha(t.palette.warning.main, 0.3),
        }}
      >
        <Typography component="div" sx={{ fontSize: "0.9375rem", lineHeight: 1.55 }}>
          {content}
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        ...messageIn,
        // Markdown sets its own body size for the compact surfaces it also
        // serves; here the reply is the reading material, so bring it up to
        // match the student's own message.
        "& > *": { fontSize: "0.9375rem" },
        ...(caret && {
          "& > * > *:last-child::after": {
            content: '""',
            display: "inline-block",
            width: "2px",
            height: "1.05em",
            marginLeft: "2px",
            verticalAlign: "text-bottom",
            backgroundColor: "text.secondary",
            animation: "caret 1s steps(1) infinite",
          },
          "@keyframes caret": { "50%": { opacity: 0 } },
          "@media (prefers-reduced-motion: reduce)": {
            animation: "none",
            "& > * > *:last-child::after": { animation: "none" },
          },
        }),
      }}
    >
      <Markdown>{content}</Markdown>
    </Box>
  );
}

// Sits where the reply will land, unboxed like the reply itself, so the dots
// give way to text rather than a bubble popping in around them.
function ThinkingRow({ deep }: { deep: boolean }) {
  return (
    <Stack direction="row" alignItems="center" spacing={1}>
      <Box sx={{ display: "flex", gap: 0.5 }}>
        {[0, 1, 2].map((i) => (
          <Box
            key={i}
            sx={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              bgcolor: "text.secondary",
              animation: "blink 1.4s ease-in-out infinite",
              animationDelay: `${i * 0.15}s`,
              "@keyframes blink": { "0%, 80%, 100%": { opacity: 0.25 }, "40%": { opacity: 1 } },
              "@media (prefers-reduced-motion: reduce)": { animation: "none", opacity: 0.5 },
            }}
          />
        ))}
      </Box>
      {deep && (
        <Typography variant="caption" color="text.secondary">
          Thinking deeply
        </Typography>
      )}
    </Stack>
  );
}

function EmptyChat({
  firstName,
  unitNoun,
  onPick,
  busy,
}: {
  firstName: string;
  unitNoun: string;
  onPick: (t: string) => void;
  busy: boolean;
}) {
  return (
    <Stack alignItems="center" justifyContent="center" spacing={2} sx={{ minHeight: 320, textAlign: "center", px: 2 }}>
      <Avatar sx={{ bgcolor: "primary.main", width: 56, height: 56 }}>
        <SmartToyIcon />
      </Avatar>
      <Box sx={{ maxWidth: 460 }}>
        <Typography variant="h6" sx={{ mb: 0.5 }}>
          {firstName ? `Hi ${firstName}, ask me anything` : "Ask me anything"}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          I know your level and your {unitNoun}s, so I can explain a tricky concept, generate
          practice questions with solutions, or plan an essay. Pick a starting point or just type.
        </Typography>
      </Box>
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap justifyContent="center">
        {QUICK_PROMPTS.map((p) => (
          <Button
            key={p}
            variant="outlined"
            size="small"
            onClick={() => onPick(p)}
            disabled={busy}
            sx={{ textTransform: "none", borderRadius: 2 }}
          >
            {p}
          </Button>
        ))}
      </Stack>
    </Stack>
  );
}
