"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import Box from "@mui/material/Box";
import Fab from "@mui/material/Fab";
import Drawer from "@mui/material/Drawer";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import Chip from "@mui/material/Chip";
import LinearProgress from "@mui/material/LinearProgress";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import HelpOutlineIcon from "@mui/icons-material/HelpOutlineOutlined";
import SendIcon from "@mui/icons-material/SendOutlined";
import CloseIcon from "@mui/icons-material/Close";
import Link from "next/link";
import {
  useAiHelp,
  parseQuotaError,
  type AiHelpMessage,
  type AiHelpQuotaError,
} from "@/lib/hooks/useAiHelp";
import { useUsage } from "@/lib/hooks/useUsage";
import { useQueryClient } from "@tanstack/react-query";

// Floating help bot — anchored bottom-right of the authenticated shell.
// FAB opens a Drawer with a lightweight chat UI; messages stream through
// POST /api/ai/help which charges the user's ai.quick quota.
//
// Designed to stay out of the way: small FAB, drawer slides in from the
// right, doesn't block the underlying page. Closes on Esc.
export function AIHelpBot() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<AiHelpMessage[]>([
    {
      role: "assistant",
      content:
        "I'm Aptiverse's help bot. Ask me how to do something, like \"how do I log an assessment?\" or \"where do I see my marks?\"",
    },
  ]);
  const [quotaSnapshot, setQuotaSnapshot] = useState<{ used: number; limit: number } | null>(null);
  const [quotaError, setQuotaError] = useState<AiHelpQuotaError | null>(null);

  const ask = useAiHelp();
  const scrollRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Only render for authenticated users — the FAB is meaningless on the
  // marketing site and would invite anonymous spam.
  const authenticated = status === "authenticated" && Boolean(session);

  // Fetch fresh usage when the drawer opens so the meter is visible
  // immediately — not "appears after the first message" like before.
  const usage = useUsage(open && authenticated);

  // Effective snapshot: prefer the local one (updated by the latest chat
  // call) over the API value, since the API value is the snapshot from
  // before the most recent message. Falls back to the API for first-open.
  const effectiveSnapshot = quotaSnapshot ?? (usage.data
    ? { used: usage.data.aiQuick.used, limit: usage.data.aiQuick.limit }
    : null);

  // Auto-scroll to bottom on new message / drawer open.
  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, ask.isPending, open]);

  if (!authenticated) return null;

  const sendMessage = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const nextHistory: AiHelpMessage[] = [...messages, { role: "user", content: trimmed }];
    setMessages(nextHistory);
    setInput("");
    setQuotaError(null);

    ask.mutate(
      { messages: nextHistory.filter((m) => m.role === "user" || m.role === "assistant") },
      {
        onSuccess: (data) => {
          setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
          setQuotaSnapshot({ used: data.used, limit: data.limit });
          // Invalidate the cached /usage query so the billing page (and
          // other consumers) see the new number on next read.
          queryClient.invalidateQueries({ queryKey: ["entitlements", "me", "usage"] });
        },
        onError: (err) => {
          const quota = parseQuotaError(err);
          if (quota) {
            setQuotaError(quota);
            setQuotaSnapshot({ used: quota.Used, limit: quota.Limit });
            // Don't append the assistant bubble — the inline upgrade card
            // explains the state more clearly than a chat message would.
            return;
          }
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content:
                err.status === 503
                  ? "The AI is unavailable right now. Try again in a moment, or use the Help page in the meantime."
                  : "Something went wrong on my side. Try again in a moment.",
            },
          ]);
        },
      },
    );
  };

  return (
    <>
      <Tooltip title="Help bot" placement="left">
        <Fab
          color="primary"
          onClick={() => setOpen(true)}
          sx={{
            position: "fixed",
            // Offset by the gesture bar, not just a flat 16px. On an iPhone
            // with a home indicator a bare `bottom: 16` puts half the FAB
            // under system chrome, where taps are swallowed by the OS.
            bottom: {
              xs: "calc(env(safe-area-inset-bottom) + 16px)",
              sm: "calc(env(safe-area-inset-bottom) + 24px)",
            },
            right: {
              xs: "calc(env(safe-area-inset-right) + 16px)",
              sm: "calc(env(safe-area-inset-right) + 24px)",
            },
            zIndex: (t) => t.zIndex.drawer - 1,
          }}
          aria-label="Open help bot"
        >
          <HelpOutlineIcon />
        </Fab>
      </Tooltip>

      <Drawer
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
        slotProps={{
          paper: {
            sx: {
              // 100% of the drawer's own container, not 100vw. 100vw includes
              // the scrollbar gutter, which pushes the drawer a few pixels
              // past the right edge and gives the page a sideways scroll.
              // dvh so the composer is not pushed under the browser chrome.
              width: { xs: "100%", sm: 420 },
              maxWidth: "100%",
              height: "100dvh",
              display: "flex",
              flexDirection: "column",
            },
          },
        }}
      >
        {/* Header */}
        <Stack
          direction="row"
          alignItems="center"
          spacing={1.5}
          sx={{
            p: 2,
            borderBottom: 1,
            borderColor: "divider",
            bgcolor: "background.paper",
          }}
        >
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              Help bot
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Ask how to do anything in Aptiverse
            </Typography>
          </Box>
          <IconButton onClick={() => setOpen(false)} aria-label="Close help bot" size="small">
            <CloseIcon />
          </IconButton>
        </Stack>

        {/* Quota meter — shown as soon as the drawer opens (fetched via
            useUsage). Skipped entirely for unlimited plans and for zero-
            quota plans (e.g. Free if quick AI somehow lands at 0). */}
        {effectiveSnapshot && effectiveSnapshot.limit > 0 && (
          <Box
            sx={{
              px: 2,
              py: 1.25,
              borderBottom: 1,
              borderColor: "divider",
              bgcolor: "action.hover",
            }}
          >
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
              <Typography variant="caption" color="text.secondary">
                Quick AI this month
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 700 }}>
                {effectiveSnapshot.used.toLocaleString()} / {effectiveSnapshot.limit.toLocaleString()}
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={Math.min(100, (effectiveSnapshot.used / effectiveSnapshot.limit) * 100)}
              color={
                effectiveSnapshot.used / effectiveSnapshot.limit >= 0.95
                  ? "error"
                  : effectiveSnapshot.used / effectiveSnapshot.limit >= 0.75
                    ? "warning"
                    : "primary"
              }
              sx={{ height: 6, borderRadius: 3 }}
            />
          </Box>
        )}
        {/* Unlimited plans get a subtle "you're on School / unlimited" pill instead */}
        {effectiveSnapshot && effectiveSnapshot.limit < 0 && (
          <Box sx={{ px: 2, py: 1, borderBottom: 1, borderColor: "divider", bgcolor: "action.hover" }}>
            <Typography variant="caption" color="text.secondary">
              Quick AI: unlimited on your plan ({effectiveSnapshot.used.toLocaleString()} used this month)
            </Typography>
          </Box>
        )}

        {/* Messages */}
        <Box
          ref={scrollRef}
          sx={{
            flex: 1,
            overflowY: "auto",
            p: 2,
            display: "flex",
            flexDirection: "column",
            gap: 1.5,
          }}
        >
          {messages.map((m, i) => (
            <ChatBubble key={i} role={m.role}>
              {m.content}
            </ChatBubble>
          ))}
          {ask.isPending && (
            <Stack direction="row" spacing={1.25} alignItems="center">
              <Box
                sx={{
                  px: 1.5,
                  py: 1,
                  borderRadius: 2,
                  bgcolor: "action.hover",
                  display: "flex",
                  gap: 0.5,
                }}
              >
                {[0, 1, 2].map((i) => (
                  <Box
                    key={i}
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      bgcolor: "primary.main",
                      animation: "blink 1.4s ease-in-out infinite",
                      animationDelay: `${i * 0.15}s`,
                      "@keyframes blink": {
                        "0%, 80%, 100%": { opacity: 0.25 },
                        "40%": { opacity: 1 },
                      },
                    }}
                  />
                ))}
              </Box>
            </Stack>
          )}

          {quotaError && (
            <Box
              sx={{
                mt: 1,
                p: 2,
                borderRadius: 2,
                border: 1,
                borderColor: "warning.light",
                bgcolor: (t) =>
                  t.palette.mode === "dark"
                    ? "rgba(255,167,38,0.08)"
                    : "rgba(255,167,38,0.10)",
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
                You&apos;ve used this month&apos;s Quick AI replies.
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                Used {quotaError.Used} of {quotaError.Limit}. Upgrade your plan for a bigger
                allowance, or wait for next month&apos;s reset.
              </Typography>
              <Stack direction="row" spacing={1}>
                <Button component={Link} href="/pricing" variant="contained" size="small">
                  See plans
                </Button>
                <Button component={Link} href="/dashboard/billing" variant="outlined" size="small">
                  View usage
                </Button>
              </Stack>
            </Box>
          )}
        </Box>

        {/* Composer */}
        <Box
          component="form"
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(input);
          }}
          sx={{
            p: 2,
            borderTop: 1,
            borderColor: "divider",
            display: "flex",
            gap: 1,
            bgcolor: "background.paper",
          }}
        >
          <TextField
            fullWidth
            size="small"
            placeholder="Ask anything about Aptiverse…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={ask.isPending || quotaError !== null}
            autoComplete="off"
          />
          <IconButton
            type="submit"
            color="primary"
            disabled={ask.isPending || quotaError !== null || !input.trim()}
            aria-label="Send"
          >
            <SendIcon />
          </IconButton>
        </Box>

        {/* Footer with starter prompts */}
        {messages.length <= 1 && !ask.isPending && (
          <Box sx={{ px: 2, pb: 2 }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
              Try asking:
            </Typography>
            <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
              {SUGGESTIONS.map((s) => (
                <Chip
                  key={s}
                  label={s}
                  size="small"
                  variant="outlined"
                  onClick={() => sendMessage(s)}
                  sx={{ cursor: "pointer", fontSize: "0.72rem" }}
                />
              ))}
            </Stack>
          </Box>
        )}
      </Drawer>
    </>
  );
}

// Kept neutral on purpose: this bot is mounted in the shell for every role
// (student, parent, teacher, admin) and for both education levels, so it can't
// assume the reader has CAPS subjects and SBAs.
const SUGGESTIONS = [
  "How do I log an assessment?",
  "Where do I see my marks?",
  "How do I see my mastery?",
  "What's the difference between Pro and Max?",
];

function ChatBubble({ role, children }: { role: "user" | "assistant"; children: React.ReactNode }) {
  const isUser = role === "user";
  return (
    <Stack
      direction="row"
      spacing={1.25}
      alignItems="flex-start"
      sx={{ justifyContent: isUser ? "flex-end" : "flex-start" }}
    >
      <Box
        sx={{
          maxWidth: "80%",
          px: 1.75,
          py: 1.1,
          borderRadius: 2,
          bgcolor: isUser ? "primary.main" : "action.hover",
          color: isUser ? "primary.contrastText" : "text.primary",
        }}
      >
        <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
          {children}
        </Typography>
      </Box>
    </Stack>
  );
}
