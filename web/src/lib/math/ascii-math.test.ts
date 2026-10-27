import { describe, expect, it } from "vitest";

import {
  normalizeAsciiMath,
  normalizeMathDelimiters,
  parseMathSegments,
} from "./ascii-math";

describe("normalizeAsciiMath", () => {
  it("turns parenthesised fractions into \\frac", () => {
    expect(normalizeAsciiMath("Simplify (x^2 - 4)/(x - 2)")).toBe(
      "Simplify $\\frac{x^2 - 4}{x - 2}$",
    );
  });

  it("keeps one level of nesting in the numerator", () => {
    expect(normalizeAsciiMath("(f(x+h) - f(x))/h")).toBe(
      "$\\frac{f(x+h) - f(x)}{h}$",
    );
  });

  it("converts bare maths fractions but not prose slashes", () => {
    expect(normalizeAsciiMath("y = 4/x")).toBe("y = $\\frac{4}{x}$");
    expect(normalizeAsciiMath("Drive at 60 km/h and/or walk")).toBe(
      "Drive at 60 km/h and/or walk",
    );
    expect(normalizeAsciiMath("Due 12/2024")).toBe("Due 12/2024");
  });

  it("wraps superscripts and groups parenthesised exponents", () => {
    expect(normalizeAsciiMath("Solve x^2 = 9")).toBe("Solve $x^2$ = 9");
    expect(normalizeAsciiMath("Find x^(-1)")).toBe("Find $x^{-1}$");
  });

  it("leaves text with explicit maths untouched", () => {
    const text = "Already $x^2$ and 4/x";
    expect(normalizeAsciiMath(text)).toBe(text);
  });
});

describe("normalizeMathDelimiters", () => {
  it("rewrites bracket delimiters as dollars", () => {
    expect(normalizeMathDelimiters("a \\(x\\) b \\[y\\]")).toBe(
      "a $x$ b $$y$$",
    );
  });
});

describe("parseMathSegments", () => {
  it("splits prose, inline and display maths", () => {
    expect(parseMathSegments("Area $\\pi r^2$ then $$E=mc^2$$.")).toEqual([
      { type: "text", value: "Area " },
      { type: "inline", value: "\\pi r^2" },
      { type: "text", value: " then " },
      { type: "display", value: "E=mc^2" },
      { type: "text", value: "." },
    ]);
  });

  it("returns a single text segment when there is no maths", () => {
    expect(parseMathSegments("Plain words")).toEqual([
      { type: "text", value: "Plain words" },
    ]);
  });
});
