/**
 * Helpers for text that mixes prose and maths.
 *
 * Generated questions use inline LaTeX ($...$). Older content was stored as
 * plain ASCII, for example "(x^2 - 4)/(x - 2)". normalizeAsciiMath converts
 * the common school and calculus patterns to inline LaTeX so that content
 * still renders like a question paper. Text that already carries explicit
 * maths delimiters is trusted and left alone.
 */

const HAS_EXPLICIT_MATH = /\$|\\\(|\\\[/;

export function normalizeAsciiMath(text: string): string {
  if (HAS_EXPLICIT_MATH.test(text)) return text;

  let out = text;

  // x^(-1) becomes x^{-1} so a parenthesised exponent groups cleanly.
  out = out.replace(/\^\(([^()]+)\)/g, "^{$1}");

  // Parenthesised fractions: (A)/(B) or (A)/B. The numerator may hold one
  // level of nesting, so "(f(x+h) - f(x))/h" converts as a whole.
  out = out.replace(
    /\(((?:[^()]+|\([^()]*\))+)\)\s*\/\s*(\([^()]*\)|[A-Za-z0-9^{}]+)/g,
    (_match, num: string, den: string) => {
      const d =
        den.startsWith("(") && den.endsWith(")") ? den.slice(1, -1) : den;
      return `$\\frac{${num.trim()}}{${d.trim()}}$`;
    },
  );

  // Bare fractions such as 4/x or -4/x^2, only when clearly maths (a digit
  // and a letter or caret), so prose like km/h, and/or and 12/2024 survives.
  out = out.replace(
    /(-?[A-Za-z0-9^{}]+)\/([A-Za-z0-9^{}]+)/g,
    (match: string, a: string, b: string) => {
      if (match.includes("$")) return match;
      if (!(/\d/.test(match) && /[A-Za-z^]/.test(match))) return match;
      return `$\\frac{${a}}{${b}}$`;
    },
  );

  // Superscripts, only outside the maths spans made above so a $...$ never
  // ends up nested inside a \frac.
  out = out
    .split(/(\$[^$]*\$)/)
    .map((segment) =>
      segment.startsWith("$")
        ? segment
        : segment.replace(
            /([A-Za-z0-9)\]}])\^(\{[^}]+\}|-?\d+|[A-Za-z])/g,
            (match) => `$${match}$`,
          ),
    )
    .join("");

  return out;
}

/**
 * Rewrites \( \) and \[ \] delimiters as $ and $$, which is what remark-math
 * understands, so hand-written or model-authored content renders too.
 */
export function normalizeMathDelimiters(text: string): string {
  return text
    .replace(/\\\[([\s\S]+?)\\\]/g, (_m, body: string) => `$$${body}$$`)
    .replace(/\\\(([\s\S]+?)\\\)/g, (_m, body: string) => `$${body}$`);
}

export type MathSegment = {
  type: "text" | "inline" | "display";
  value: string;
};

/** Splits text into prose and maths segments. $$ wins over $ at one spot. */
export function parseMathSegments(text: string): MathSegment[] {
  const out: MathSegment[] = [];
  const re =
    /\$\$([\s\S]+?)\$\$|\\\[([\s\S]+?)\\\]|\$([^$\n]+?)\$|\\\(([\s\S]+?)\\\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) {
      out.push({ type: "text", value: text.slice(last, m.index) });
    }
    if (m[1] !== undefined) out.push({ type: "display", value: m[1] });
    else if (m[2] !== undefined) out.push({ type: "display", value: m[2] });
    else if (m[3] !== undefined) out.push({ type: "inline", value: m[3] });
    else if (m[4] !== undefined) out.push({ type: "inline", value: m[4] });
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push({ type: "text", value: text.slice(last) });
  return out;
}
