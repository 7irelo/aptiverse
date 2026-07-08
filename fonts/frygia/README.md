# Frygia font

Aptiverse brand font. Family name in CSS: `Frygia`.

## Which file to use

- **Claude Design (or any sandbox that blocks external font URLs):** attach or paste `frygia-embedded.css`. Core weights are inlined as base64 woff2 (300, 400, 400 italic, 500, 700, 900). Then set `font-family: "Frygia", sans-serif;`.
- **In the codebase or normal web hosting:** use `frygia.css`, which references the local `Frygia-*.woff2 / .woff / .ttf` files. Serve this folder statically.

## Weights available (family "Frygia")

100 Thin, 200 XLight, 300 Light, 400 Regular (+ italic), 500 Medium, 700 Bold, 900 Black, plus matching italics. Full set present as `.woff2`, `.woff`, and `.ttf`.

## Recommended stack

```css
font-family: "Frygia", "Roboto", -apple-system, BlinkMacSystemFont, "Segoe UI",
  "Helvetica Neue", Arial, sans-serif;
```

Source: `original-cloudfront-stylesheet.css` (the stylesheet the app loads from CloudFront).
