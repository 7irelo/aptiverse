import katex from "katex";
import "katex/dist/katex.min.css";
import Box from "@mui/material/Box";
import type { SxProps, Theme } from "@mui/material/styles";

// Renders text that may contain LaTeX so generated questions read like a
// real question paper instead of ASCII soup like "(x^2 - 4)/(x - 2)".
// KaTeX typesets to an HTML string with no DOM needed (works on the server
// too), and ships its own fonts via the CSS import above — so there's no
// hydration flash and no async load.
//
// Supported delimiters (the generator emits inline $...$; the rest are
// tolerated so hand-written or model-authored content still renders):
//   $$...$$  \[...\]   display maths (own line, centred)
//   $...$    \(...\)   inline maths

// Tests generated before the LaTeX prompt are stored as ASCII, e.g.
// "(x^2 - 4)/(x - 2)". Convert the most common CAPS/calculus patterns to
// inline LaTeX so old content renders without regenerating it. Anything
// that already carries explicit math ($...$, \(...\), \[...\]) is trusted
// and left untouched.
function normalizeAsciiMath(text: string): string {
  if (/\$|\\\(|\\\[/.test(text)) return text;

  let out = text;

  // x^(-1) -> x^{-1} so a parenthesised exponent groups cleanly.
  out = out.replace(/\^\(([^()]+)\)/g, "^{$1}");

  // Parenthesised fractions: (A)/(B) or (A)/B -> $\frac{A}{B}$. The numerator
  // is a paren group that may contain one level of nesting (so
  // "(f(x+h) - f(x))" matches); the denominator is another paren group or a
  // bare token. KaTeX renders any superscripts or function calls inside.
  out = out.replace(
    /\(((?:[^()]+|\([^()]*\))+)\)\s*\/\s*(\([^()]*\)|[A-Za-z0-9^{}]+)/g,
    (_m, num: string, den: string) => {
      const d = den.startsWith("(") && den.endsWith(")") ? den.slice(1, -1) : den;
      return `$\\frac{${num.trim()}}{${d.trim()}}$`;
    },
  );

  // Bare fractions: a/b with no spaces, only when it's clearly maths (has a
  // digit AND a letter or caret) so "4/x", "-4/x^2" convert but prose slashes
  // ("km/h", "and/or", "12/2024") never do.
  out = out.replace(/(-?[A-Za-z0-9^{}]+)\/([A-Za-z0-9^{}]+)/g, (m: string, a: string, b: string) => {
    if (m.includes("$")) return m;
    if (!(/\d/.test(m) && /[A-Za-z^]/.test(m))) return m;
    return `$\\frac{${a}}{${b}}$`;
  });

  // Superscripts, but only outside the math spans produced above, so we never
  // nest a $...$ inside a \frac.
  out = out
    .split(/(\$[^$]*\$)/)
    .map((seg) =>
      seg.startsWith("$")
        ? seg
        : seg.replace(/([A-Za-z0-9)\]}])\^(\{[^}]+\}|-?\d+|[A-Za-z])/g, (mm) => `$${mm}$`),
    )
    .join("");

  return out;
}

type Segment = { type: "text" | "inline" | "display"; value: string };

function parse(text: string): Segment[] {
  const out: Segment[] = [];
  // Display delimiters are listed first so $$ wins over $ at the same spot.
  const re = /\$\$([\s\S]+?)\$\$|\\\[([\s\S]+?)\\\]|\$([^$\n]+?)\$|\\\(([\s\S]+?)\\\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) out.push({ type: "text", value: text.slice(last, m.index) });
    if (m[1] !== undefined) out.push({ type: "display", value: m[1] });
    else if (m[2] !== undefined) out.push({ type: "display", value: m[2] });
    else if (m[3] !== undefined) out.push({ type: "inline", value: m[3] });
    else if (m[4] !== undefined) out.push({ type: "inline", value: m[4] });
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push({ type: "text", value: text.slice(last) });
  return out;
}

function render(latex: string, displayMode: boolean): string {
  try {
    // throwOnError:false → a malformed expression renders in red rather than
    // taking down the whole question.
    return katex.renderToString(latex, { throwOnError: false, displayMode });
  } catch {
    return latex;
  }
}

export function MathText({ text, sx }: { text: string; sx?: SxProps<Theme> }) {
  const parts = parse(normalizeAsciiMath(text));
  const hasMath = parts.some((p) => p.type !== "text");

  if (!hasMath) {
    return (
      <Box component="span" sx={sx}>
        {text}
      </Box>
    );
  }

  return (
    <Box component="span" sx={sx}>
      {parts.map((p, i) => {
        if (p.type === "text") {
          return <span key={i}>{p.value}</span>;
        }
        return (
          <Box
            key={i}
            component={p.type === "display" ? "div" : "span"}
            sx={p.type === "display" ? { my: 1.5, textAlign: "center" } : undefined}
            dangerouslySetInnerHTML={{ __html: render(p.value, p.type === "display") }}
          />
        );
      })}
    </Box>
  );
}
