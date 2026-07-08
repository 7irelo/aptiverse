"use client";

import { useEffect, useRef, useState } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import { alpha } from "@mui/material/styles";
import SendIcon from "@mui/icons-material/SendOutlined";
import SmartToyIcon from "@mui/icons-material/SmartToyOutlined";
import PersonIcon from "@mui/icons-material/PersonOutline";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesomeOutlined";
import { PageHeader } from "@/components/common/PageHeader";
import { useAiTutor, type AiChatMessage } from "@/lib/api/queries";
import { ApiError } from "@/lib/api/fetcher";

type ChatMessage = { id: string; role: "user" | "assistant"; content: string; error?: boolean };

const QUICK_PROMPTS = [
  "Explain Le Chatelier's principle simply",
  "Generate 5 trig identity problems with solutions",
  "Help me outline an essay on climate change",
  "Quiz me on genetics",
];

function errorText(e: unknown): string {
  if (e instanceof ApiError) {
    if (e.status === 402)
      return "You've used this month's AI replies. You can upgrade from Billing, or wait for next month's reset.";
    if (e.status === 503) return "The AI tutor isn't switched on in this environment yet.";
    return e.message || "Something went wrong. Please try again.";
  }
  return "Something went wrong. Please try again.";
}

export default function ChatbotPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const tutor = useAiTutor();
  const idRef = useRef(0);
  const endRef = useRef<HTMLDivElement>(null);
  const nextId = () => `${(idRef.current += 1)}`;

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, tutor.isPending]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || tutor.isPending) return;

    const userMsg: ChatMessage = { id: nextId(), role: "user", content: trimmed };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput("");

    // Only real turns go to the model — UI-only error notices are dropped.
    const payload: AiChatMessage[] = history
      .filter((m) => !m.error)
      .map((m) => ({ role: m.role, content: m.content }));

    try {
      const res = await tutor.mutateAsync(payload);
      setMessages((m) => [...m, { id: nextId(), role: "assistant", content: res.reply }]);
    } catch (e) {
      setMessages((m) => [
        ...m,
        { id: nextId(), role: "assistant", content: errorText(e), error: true },
      ]);
    }
  };

  const empty = messages.length === 0;

  return (
    <>
      <PageHeader
        title="AI Tutor"
        description="A patient explainer, drill generator, and exam coach for any subject. No question is too small."
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "AI Tutor" }]}
      />

      <Card sx={{ height: "calc(100vh - 240px)", display: "flex", flexDirection: "column" }}>
        <Stack
          direction="row"
          alignItems="center"
          spacing={2}
          sx={{ p: 2.5, borderBottom: 1, borderColor: "divider" }}
        >
          <Avatar sx={{ bgcolor: "primary.main", width: 40, height: 40 }}>
            <SmartToyIcon />
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Aptiverse Tutor
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Ready to help with any subject
            </Typography>
          </Box>
          <Chip icon={<AutoAwesomeIcon />} label="NSC-aligned" size="small" variant="outlined" />
        </Stack>

        <Box sx={{ flex: 1, overflowY: "auto", p: { xs: 2, sm: 3 } }}>
          {empty ? (
            <EmptyChat />
          ) : (
            <Stack spacing={2}>
              {messages.map((m) => (
                <MessageRow key={m.id} m={m} />
              ))}
              {tutor.isPending && <ThinkingRow />}
              <div ref={endRef} />
            </Stack>
          )}
        </Box>

        <Box sx={{ p: 2, borderTop: 1, borderColor: "divider" }}>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 1.5 }}>
            {QUICK_PROMPTS.map((p) => (
              <Chip
                key={p}
                label={p}
                variant="outlined"
                onClick={() => send(p)}
                clickable
                size="small"
                disabled={tutor.isPending}
              />
            ))}
          </Stack>
          <Stack direction="row" spacing={1.5}>
            <TextField
              fullWidth
              placeholder="Ask anything: a topic, a question, or how to study smarter."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send(input);
                }
              }}
              multiline
              maxRows={4}
            />
            <Button
              onClick={() => void send(input)}
              variant="contained"
              color="secondary"
              disabled={!input.trim() || tutor.isPending}
              startIcon={
                tutor.isPending ? <CircularProgress size={16} thickness={5} /> : <SendIcon />
              }
              sx={{ alignSelf: "flex-end", height: 44 }}
            >
              Send
            </Button>
          </Stack>
        </Box>
      </Card>
    </>
  );
}

function MessageRow({ m }: { m: ChatMessage }) {
  const isUser = m.role === "user";
  return (
    <Stack
      direction="row"
      spacing={1.5}
      alignItems="flex-start"
      justifyContent={isUser ? "flex-end" : "flex-start"}
    >
      {!isUser && (
        <Avatar sx={{ bgcolor: "primary.main", width: 32, height: 32 }}>
          <SmartToyIcon fontSize="small" />
        </Avatar>
      )}
      <Box
        sx={{
          maxWidth: "72%",
          p: 1.75,
          px: 2,
          borderRadius: 2,
          bgcolor: isUser
            ? "primary.main"
            : m.error
              ? (t) => alpha(t.palette.warning.main, 0.14)
              : "action.hover",
          color: isUser ? "primary.contrastText" : "text.primary",
        }}
      >
        <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
          {m.content}
        </Typography>
      </Box>
      {isUser && (
        <Avatar
          sx={{
            bgcolor: "secondary.main",
            color: "secondary.contrastText",
            width: 32,
            height: 32,
          }}
        >
          <PersonIcon fontSize="small" />
        </Avatar>
      )}
    </Stack>
  );
}

function ThinkingRow() {
  return (
    <Stack direction="row" spacing={1.5} alignItems="center">
      <Avatar sx={{ bgcolor: "primary.main", width: 32, height: 32 }}>
        <SmartToyIcon fontSize="small" />
      </Avatar>
      <Box sx={{ p: 1.5, px: 2, borderRadius: 2, bgcolor: "action.hover" }}>
        <Typography variant="body2" color="text.secondary">
          Thinking…
        </Typography>
      </Box>
    </Stack>
  );
}

function EmptyChat() {
  return (
    <Stack alignItems="center" justifyContent="center" spacing={2} sx={{ height: "100%", textAlign: "center", px: 2 }}>
      <Avatar sx={{ bgcolor: "primary.main", width: 56, height: 56 }}>
        <SmartToyIcon />
      </Avatar>
      <Box sx={{ maxWidth: 440 }}>
        <Typography variant="h6" sx={{ mb: 0.5 }}>
          Ask me anything
        </Typography>
        <Typography variant="body2" color="text.secondary">
          I can explain a tricky concept, generate practice questions with solutions, or help you
          plan an essay. Pick a prompt below or just start typing.
        </Typography>
      </Box>
    </Stack>
  );
}
