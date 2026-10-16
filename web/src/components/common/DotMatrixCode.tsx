"use client";

import { useEffect, useRef } from "react";
import Box from "@mui/material/Box";
import type { SxProps, Theme } from "@mui/material/styles";

// The status code itself as the artwork: the numerals are rasterised once,
// sampled on a lattice, and redrawn as a matrix of small squares. It reuses the
// visual language the product already speaks in, the mastery grid and the node
// graph in the brand mark, so the page still looks like Aptiverse rather than
// like a generic error screen.
//
// Everything is canvas and arithmetic. No library, no external asset, no SVG
// to download. Cell counts land around 200 to 400, which is nothing for a
// mid-range Android, and the loop parks itself the moment the intro finishes
// and the pointer goes quiet, so an idle tab costs zero frames.
//
// Colour rule: the matrix lives on a graphite surface, cells are near-white,
// and citron only ever appears as a filled cell. It is never thin text on a
// light ground.

const CITRON = "#C3E84F";
const FONT_STACK = '"Frygia", "Roboto", system-ui, sans-serif';

// Intro: cells converge on the lattice. ease-out-expo, no overshoot.
const INTRO_MS = 620;
const STAGGER_MS = 260;

// Pointer lens: cells inside the radius grow and take the citron fill, so the
// accent follows the reader instead of sitting there as decoration.
const LENS_RADIUS = 96;

type Cell = {
  x: number;
  y: number;
  offsetX: number;
  offsetY: number;
  delay: number;
  accent: boolean;
};

// Deterministic PRNG. Seeded so the scatter is identical on every mount and
// the composition never rerolls into something lopsided.
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const easeOutExpo = (p: number) => (p >= 1 ? 1 : 1 - Math.pow(2, -10 * p));

export type DotMatrixCodeProps = {
  /** The status code to draw, for example "404" or "403". */
  code: string;
  /** Near-white cell colour. Pass the graphite surface's contrastText. */
  cellColor: string;
  /** Height of the canvas box. Drives the type size. */
  sx?: SxProps<Theme>;
};

export function DotMatrixCode({ code, cellColor, sx }: DotMatrixCodeProps) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let cells: Cell[] = [];
    let pitch = 10;
    let width = 0;
    let height = 0;
    let raf = 0;
    let startedAt = 0;
    let lens = 0;
    let lensTarget = 0;
    const pointer = { x: -9999, y: -9999 };
    let running = false;
    let disposed = false;

    // Rasterise the code offscreen, then keep only the lattice points that land
    // inside a glyph. Resampling on resize keeps the type optically the same
    // size at 390px and at 1440px.
    function build() {
      const rect = wrap!.getBoundingClientRect();
      width = Math.max(1, Math.round(rect.width));
      height = Math.max(1, Math.round(rect.height));
      pitch = width < 420 ? 8 : width < 700 ? 10 : 12;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas!.width = Math.round(width * dpr);
      canvas!.height = Math.round(height * dpr);
      canvas!.style.width = `${width}px`;
      canvas!.style.height = `${height}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

      const off = document.createElement("canvas");
      off.width = width;
      off.height = height;
      const octx = off.getContext("2d", { willReadFrequently: true });
      if (!octx) return;

      let size = Math.round(height * 0.86);
      const fit = (s: number) => {
        octx.font = `700 ${s}px ${FONT_STACK}`;
      };
      fit(size);
      const maxWidth = width * 0.84;
      const measured = octx.measureText(code).width;
      if (measured > maxWidth) {
        size = Math.max(24, Math.floor((size * maxWidth) / measured));
        fit(size);
      }
      octx.textAlign = "center";
      octx.textBaseline = "middle";
      octx.fillStyle = "#ffffff";
      octx.fillText(code, width / 2, height / 2 + size * 0.02);

      const data = octx.getImageData(0, 0, width, height).data;
      const rand = mulberry32(20260722);
      const next: Cell[] = [];
      let i = 0;
      for (let gy = pitch / 2; gy < height; gy += pitch) {
        for (let gx = pitch / 2; gx < width; gx += pitch) {
          const idx = ((gy | 0) * width + (gx | 0)) * 4 + 3;
          if (data[idx] <= 140) continue;
          // Scatter along a ring so the assembly reads as convergence, not
          // as everything sliding in from one edge.
          const angle = rand() * Math.PI * 2;
          const dist = 30 + rand() * 90;
          next.push({
            x: gx,
            y: gy,
            offsetX: Math.cos(angle) * dist,
            offsetY: Math.sin(angle) * dist * 0.6,
            delay: (gx / width) * STAGGER_MS + rand() * 60,
            // Sparse standing accent, a little under one cell in ten.
            accent: Math.imul(i + 1, 2654435761) % 11 === 0,
          });
          i += 1;
        }
      }
      cells = next;
    }

    function paint(now: number) {
      if (!startedAt) startedAt = now;
      const t = reduced ? INTRO_MS + STAGGER_MS + 1 : now - startedAt;
      const introDone = t > INTRO_MS + STAGGER_MS;

      lens += (lensTarget - lens) * 0.14;
      if (lensTarget === 0 && lens < 0.01) lens = 0;

      ctx!.clearRect(0, 0, width, height);

      const base = pitch * 0.58;
      const radius = base * 0.3;
      const roundable = typeof ctx!.roundRect === "function";

      for (const c of cells) {
        const p = Math.min(1, Math.max(0, (t - c.delay) / INTRO_MS));
        const e = easeOutExpo(p);
        if (e <= 0) continue;

        let x = c.x + c.offsetX * (1 - e);
        let y = c.y + c.offsetY * (1 - e);
        let scale = 0.4 + 0.6 * e;
        let highlight = 0;

        if (lens > 0.01) {
          const dx = x - pointer.x;
          const dy = y - pointer.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < LENS_RADIUS * LENS_RADIUS) {
            const f = Math.pow(1 - Math.sqrt(d2) / LENS_RADIUS, 2) * lens;
            scale += f * 0.85;
            // A slight pull inward reads as attention rather than repulsion.
            x -= dx * f * 0.16;
            y -= dy * f * 0.16;
            highlight = f;
          }
        }

        const s = base * scale;
        const half = s / 2;
        ctx!.globalAlpha = e;
        ctx!.fillStyle = c.accent ? CITRON : cellColor;
        ctx!.beginPath();
        if (roundable) ctx!.roundRect(x - half, y - half, s, s, radius);
        else ctx!.rect(x - half, y - half, s, s);
        ctx!.fill();

        if (highlight > 0.04 && !c.accent) {
          ctx!.globalAlpha = e * highlight;
          ctx!.fillStyle = CITRON;
          ctx!.fill();
        }
      }
      ctx!.globalAlpha = 1;

      if (!introDone || lens > 0.01) {
        raf = window.requestAnimationFrame(paint);
      } else {
        running = false;
      }
    }

    function kick() {
      if (running) return;
      running = true;
      raf = window.requestAnimationFrame(paint);
    }

    function redraw() {
      build();
      startedAt = 0;
      kick();
    }

    redraw();

    const onPointerMove = (ev: PointerEvent) => {
      if (reduced) return;
      const rect = canvas!.getBoundingClientRect();
      pointer.x = ev.clientX - rect.left;
      pointer.y = ev.clientY - rect.top;
      lensTarget = 1;
      kick();
    };
    const onPointerLeave = () => {
      lensTarget = 0;
      kick();
    };

    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerdown", onPointerMove);
    canvas.addEventListener("pointerleave", onPointerLeave);
    canvas.addEventListener("pointercancel", onPointerLeave);
    canvas.addEventListener("pointerup", onPointerLeave);

    const observer = new ResizeObserver(() => {
      build();
      // Resizing mid intro should not restart it, but a settled matrix needs
      // one frame to redraw at the new size.
      kick();
    });
    observer.observe(wrap);

    // Frygia arrives from a stylesheet, so the first raster can land on the
    // fallback face. Resample once the real face is ready.
    if (typeof document !== "undefined" && document.fonts?.ready) {
      document.fonts.ready.then(() => {
        if (disposed) return;
        build();
        kick();
      });
    }

    return () => {
      disposed = true;
      observer.disconnect();
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerdown", onPointerMove);
      canvas.removeEventListener("pointerleave", onPointerLeave);
      canvas.removeEventListener("pointercancel", onPointerLeave);
      canvas.removeEventListener("pointerup", onPointerLeave);
      window.cancelAnimationFrame(raf);
    };
  }, [cellColor, code]);

  return (
    <Box ref={wrapRef} sx={{ position: "relative", width: "100%", ...sx }}>
      <Box
        component="canvas"
        ref={canvasRef}
        role="img"
        aria-label={code}
        sx={{ display: "block", width: "100%", height: "100%", touchAction: "manipulation" }}
      />
    </Box>
  );
}
