"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import "katex/dist/katex.min.css";

// Renders trusted Markdown (AI tutor replies) with GitHub-flavoured
// extensions and LaTeX math via the KaTeX already bundled for practice
// tests. Styled to the theme so headings, lists, code, tables, and math sit
// inside a chat bubble without looking like a raw dump. Content comes from
// our own model calls, so we don't sanitise beyond what react-markdown does
// by default (raw HTML is ignored).
export function Markdown({ children }: { children: string }) {
  return (
    <Box
      sx={{
        fontSize: "0.875rem",
        lineHeight: 1.55,
        color: "inherit",
        wordBreak: "break-word",
        "& > :first-of-type": { mt: 0 },
        "& > :last-child": { mb: 0 },
        "& p": { my: 0.75 },
        "& h1, & h2, & h3, & h4": { mt: 1.5, mb: 0.5, fontWeight: 700, lineHeight: 1.3 },
        "& h1": { fontSize: "1.15rem" },
        "& h2": { fontSize: "1.05rem" },
        "& h3": { fontSize: "0.98rem" },
        "& h4": { fontSize: "0.9rem" },
        "& ul, & ol": { my: 0.75, pl: 2.5 },
        "& li": { mb: 0.25 },
        "& li > p": { my: 0 },
        "& code": {
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
          fontSize: "0.85em",
          px: 0.5,
          py: "1px",
          borderRadius: 0.75,
          bgcolor: "action.hover",
        },
        "& pre": {
          my: 1,
          p: 1.5,
          borderRadius: 1.5,
          overflowX: "auto",
          border: 1,
          borderColor: "divider",
          bgcolor: (t) => (t.palette.mode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)"),
        },
        "& pre code": { p: 0, bgcolor: "transparent", fontSize: "0.82em" },
        "& blockquote": {
          my: 1,
          px: 1.5,
          py: 0.5,
          borderRadius: 1,
          bgcolor: "action.hover",
          color: "text.secondary",
          "& p": { my: 0.25 },
        },
        "& table": { borderCollapse: "collapse", my: 1, width: "100%", fontSize: "0.85em", display: "block", overflowX: "auto" },
        "& th, & td": { border: 1, borderColor: "divider", px: 1, py: 0.5, textAlign: "left" },
        "& th": { fontWeight: 700 },
        "& hr": { my: 1.5, border: 0, borderTop: 1, borderColor: "divider" },
        "& strong": { fontWeight: 700 },
        "& .katex": { fontSize: "1.02em" },
        "& .katex-display": { my: 1, overflowX: "auto", overflowY: "hidden" },
      }}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          a: ({ href, children }) => (
            <Link href={href} target="_blank" rel="noopener noreferrer" color="secondary.main">
              {children}
            </Link>
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </Box>
  );
}
