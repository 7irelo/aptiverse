"use client";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { alpha } from "@mui/material/styles";
import { Markdown } from "@/components/common/Markdown";

// The AI tutor's transcript, rendered the same way wherever it appears: the
// full-page tutor at /dashboard/chatbot and the workspace side panel.
//
// These were two separate implementations and they had drifted. The workspace
// copy still bubbled the assistant, and streamed its reply as plain children,
// so a reply arrived as raw text and then visibly restyled itself into
// markdown once it settled. Same tutor, same voice, one renderer.
//
// `compact` is the only thing the two surfaces disagree on: the panel is ~400px
// against the page's 780px measure, so it steps the type down. It is a density
// switch, not a different design.

export type ChatDensity = { compact?: boolean };

const bodySize = (compact?: boolean) => (compact ? "0.875rem" : "0.9375rem");

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
export function UserMessage({ content, compact }: { content: string } & ChatDensity) {
  return (
    <Stack direction="row" justifyContent="flex-end" sx={messageIn}>
      <Box
        sx={{
          maxWidth: "85%",
          px: compact ? 1.5 : 2,
          py: compact ? 1 : 1.25,
          borderRadius: "18px 18px 4px 18px",
          bgcolor: "primary.main",
          color: "primary.contrastText",
        }}
      >
        <Typography
          component="div"
          sx={{
            fontSize: bodySize(compact),
            lineHeight: 1.55,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {content}
        </Typography>
      </Box>
    </Stack>
  );
}

// What the tutor said. No bubble, no avatar, no fill: the reply is the main
// content, and boxing it fought the long-form answers this tutor actually gives
// (worked examples, headings, lists, math). Reads as a document, the way the
// student's own notes would. Errors are the exception: they're the system
// speaking, not the tutor, so they get a tinted callout to say so.
export function AssistantMessage({
  content,
  error,
  caret,
  compact,
}: {
  content: string;
  error?: boolean;
  // Blinking caret trailing the last line while a reply streams in. Attached
  // via ::after on the final block so it sits inline at the end of the text
  // rather than orphaned on its own line under a rendered markdown block.
  caret?: boolean;
} & ChatDensity) {
  if (error) {
    return (
      <Box
        sx={{
          ...messageIn,
          px: compact ? 1.5 : 2,
          py: compact ? 1 : 1.25,
          borderRadius: 2,
          bgcolor: (t) => alpha(t.palette.warning.main, 0.14),
          border: 1,
          borderColor: (t) => alpha(t.palette.warning.main, 0.3),
        }}
      >
        <Typography component="div" sx={{ fontSize: bodySize(compact), lineHeight: 1.55 }}>
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
        "& > *": { fontSize: bodySize(compact) },
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
export function ThinkingDots({ label }: { label?: string }) {
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
      {label && (
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>
      )}
    </Stack>
  );
}
