"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Avatar from "@mui/material/Avatar";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import SendIcon from "@mui/icons-material/Send";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { PageHeader } from "@/components/common/PageHeader";
import { SAMPLE_CHAT } from "@/lib/mockData";

const QUICK_PROMPTS = [
  "Explain Le Chatelier in 30 seconds",
  "Generate 5 trig identity problems",
  "Help me outline an essay on climate",
  "Quiz me on genetics",
  "Translate 'hypothesis' to isiZulu",
];

export default function ChatbotPage() {
  const [messages, setMessages] = useState(SAMPLE_CHAT);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);

  const send = (text: string) => {
    if (!text.trim()) return;
    setMessages((m) => [
      ...m,
      { id: String(Date.now()), role: "user", content: text, ts: new Date().toISOString() },
    ]);
    setInput("");
    setThinking(true);
    setTimeout(() => {
      setMessages((m) => [
        ...m,
        {
          id: String(Date.now() + 1),
          role: "assistant",
          content: "Great question — let me think through this with you. (This is a demo response. The real bot is connected to your AI service.)",
          ts: new Date().toISOString(),
        },
      ]);
      setThinking(false);
    }, 800);
  };

  return (
    <>
      <PageHeader
        title="AI Tutor"
        description="A patient explainer, drill-generator and exam coach. No question is too small."
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "AI Tutor" }]}
      />

      <Card sx={{ height: "calc(100vh - 240px)", display: "flex", flexDirection: "column" }}>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ p: 2.5, borderBottom: 1, borderColor: "divider" }}>
          <Avatar sx={{ bgcolor: "primary.main", width: 40, height: 40 }}>
            <SmartToyIcon />
          </Avatar>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Aptiverse Tutor
            </Typography>
            <Typography variant="caption" color="success.main" sx={{ fontWeight: 600 }}>
              ● Online · Knows your subjects
            </Typography>
          </Box>
          <Box sx={{ flex: 1 }} />
          <Chip icon={<AutoAwesomeIcon />} label="NSC-aligned" size="small" variant="outlined" />
        </Stack>

        <Box sx={{ flex: 1, overflowY: "auto", p: 3 }}>
          <Stack spacing={2}>
            {messages.map((m) => (
              <Stack
                key={m.id}
                direction="row"
                spacing={1.5}
                alignItems="flex-start"
                justifyContent={m.role === "user" ? "flex-end" : "flex-start"}
              >
                {m.role === "assistant" && (
                  <Avatar sx={{ bgcolor: "primary.main", width: 32, height: 32 }}>
                    <SmartToyIcon fontSize="small" />
                  </Avatar>
                )}
                <Box
                  sx={{
                    maxWidth: "70%",
                    p: 1.75,
                    px: 2,
                    borderRadius: 2,
                    bgcolor: m.role === "user" ? "primary.main" : "action.hover",
                    color: m.role === "user" ? "primary.contrastText" : "text.primary",
                  }}
                >
                  <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                    {m.content}
                  </Typography>
                </Box>
                {m.role === "user" && (
                  <Avatar sx={{ bgcolor: "secondary.main", width: 32, height: 32, fontSize: "0.85rem", fontWeight: 700 }}>
                    T
                  </Avatar>
                )}
              </Stack>
            ))}
            {thinking && (
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
            )}
          </Stack>
        </Box>

        <Box sx={{ p: 2, borderTop: 1, borderColor: "divider" }}>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 1.5 }}>
            {QUICK_PROMPTS.map((p) => (
              <Chip key={p} label={p} variant="outlined" onClick={() => send(p)} clickable size="small" />
            ))}
          </Stack>
          <Stack direction="row" spacing={1.5}>
            <TextField
              fullWidth
              placeholder="Ask anything — about a topic, a question, or how to study smarter."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              multiline
              maxRows={4}
            />
            <Button onClick={() => send(input)} variant="contained" startIcon={<SendIcon />} sx={{ alignSelf: "flex-end", height: 44 }}>
              Send
            </Button>
          </Stack>
        </Box>
      </Card>
    </>
  );
}
