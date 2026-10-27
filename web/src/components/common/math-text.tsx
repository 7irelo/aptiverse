import "katex/dist/katex.min.css";

import katex from "katex";

import { normalizeAsciiMath, parseMathSegments } from "@/lib/math/ascii-math";
import { cn } from "@/lib/utils";

function renderLatex(latex: string, displayMode: boolean): string {
  try {
    // throwOnError false: a malformed expression renders in the error colour
    // instead of taking down the whole question.
    return katex.renderToString(latex, {
      throwOnError: false,
      displayMode,
      output: "htmlAndMathml",
    });
  } catch {
    return latex;
  }
}

type MathTextProps = {
  text: string;
  /**
   * Convert legacy ASCII maths such as "(x^2 - 4)/(x - 2)" to LaTeX first.
   * On by default because older generated questions were stored that way.
   */
  asciiMath?: boolean;
  className?: string;
};

/**
 * A line of text that may contain maths. Supports $...$ and \(...\) inline,
 * $$...$$ and \[...\] on their own line. KaTeX renders to an HTML string, so
 * this works in Server Components with no client JavaScript and no flash.
 */
export function MathText({ text, asciiMath = true, className }: MathTextProps) {
  const source = asciiMath ? normalizeAsciiMath(text) : text;
  const parts = parseMathSegments(source);

  if (!parts.some((part) => part.type !== "text")) {
    return <span className={className}>{text}</span>;
  }

  return (
    <span className={cn("[&_.katex]:text-[1.05em]", className)}>
      {parts.map((part, index) => {
        if (part.type === "text") return <span key={index}>{part.value}</span>;
        const display = part.type === "display";
        // A span with display block, so display maths stays valid inside a
        // paragraph or a button label.
        return (
          <span
            key={index}
            className={display ? "my-3 block overflow-x-auto text-center" : ""}
            dangerouslySetInnerHTML={{
              __html: renderLatex(part.value, display),
            }}
          />
        );
      })}
    </span>
  );
}
