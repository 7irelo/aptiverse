import "katex/dist/katex.min.css";

import type { ComponentProps } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";

import {
  normalizeAsciiMath,
  normalizeMathDelimiters,
} from "@/lib/math/ascii-math";
import { cn } from "@/lib/utils";

/** react-markdown passes its AST node to custom components; keep it off the DOM. */
function withoutNode<T extends { node?: unknown }>(props: T): Omit<T, "node"> {
  const rest = { ...props };
  delete rest.node;
  return rest;
}

/**
 * Element styles for rendered Markdown. There is no typography plugin; each
 * element maps to tokens so tutor answers and explanations match the app.
 * Headings start at h3 because Markdown always sits inside a page that owns
 * its h1 and h2.
 */
const components: Components = {
  h1: (props) => (
    <h3 className="mt-6 text-xl font-semibold" {...withoutNode(props)} />
  ),
  h2: (props) => (
    <h3 className="mt-6 text-lg font-semibold" {...withoutNode(props)} />
  ),
  h3: (props) => (
    <h4 className="mt-5 text-base font-semibold" {...withoutNode(props)} />
  ),
  h4: (props) => (
    <h5 className="mt-4 text-base font-semibold" {...withoutNode(props)} />
  ),
  p: (props) => <p className="leading-7" {...withoutNode(props)} />,
  a: ({ href = "", ...props }) => {
    const external = /^https?:\/\//.test(href);
    return (
      <a
        href={href}
        className="font-medium text-foreground underline underline-offset-4 hover:text-muted-foreground"
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        {...withoutNode(props)}
      />
    );
  },
  ul: (props) => (
    <ul className="list-disc space-y-1 pl-6" {...withoutNode(props)} />
  ),
  ol: (props) => (
    <ol className="list-decimal space-y-1 pl-6" {...withoutNode(props)} />
  ),
  blockquote: (props) => (
    <blockquote
      className="border-l-4 border-citron-surface pl-4 text-muted-foreground"
      {...withoutNode(props)}
    />
  ),
  code: ({ className, ...props }) => (
    <code
      className={cn(
        "rounded bg-muted px-1 py-0.5 font-mono text-[0.9em]",
        className,
      )}
      {...withoutNode(props)}
    />
  ),
  pre: (props) => (
    <pre
      className="overflow-x-auto rounded-lg bg-muted p-4 text-sm [&_code]:bg-transparent [&_code]:p-0"
      {...withoutNode(props)}
    />
  ),
  table: (props) => (
    <div className="overflow-x-auto">
      <table
        className="w-full border-collapse text-sm"
        {...withoutNode(props)}
      />
    </div>
  ),
  th: (props) => (
    <th
      className="border-b px-3 py-2 text-left font-semibold"
      {...withoutNode(props)}
    />
  ),
  td: (props) => <td className="border-b px-3 py-2" {...withoutNode(props)} />,
  hr: (props) => <hr className="my-6" {...withoutNode(props)} />,
};

type MarkdownProps = {
  children: string;
  /**
   * Convert legacy ASCII maths before parsing. Off by default: it is meant
   * for short question text, and prose with slashes reads better untouched.
   */
  asciiMath?: boolean;
  className?: string;
} & Pick<ComponentProps<"div">, "id">;

/**
 * Renders Markdown with GitHub tables and lists and KaTeX maths ($...$,
 * $$...$$, \(...\) and \[...\]). Raw HTML in the source is ignored, so
 * model or user content cannot inject markup. Works in Server Components.
 */
export function Markdown({
  children,
  asciiMath = false,
  className,
  id,
}: MarkdownProps) {
  const source = normalizeMathDelimiters(
    asciiMath ? normalizeAsciiMath(children) : children,
  );
  return (
    <div
      id={id}
      className={cn(
        "flex flex-col gap-4 text-base break-words [&_.katex-display]:overflow-x-auto [&_.katex-display]:py-1",
        className,
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[[rehypeKatex, { throwOnError: false }]]}
        components={components}
      >
        {source}
      </ReactMarkdown>
    </div>
  );
}
