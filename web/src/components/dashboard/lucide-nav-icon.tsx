// Lets a Lucide icon stand in for a nav icon.
//
// The nav item contract is a component taking MUI's `fontSize` prop, which is
// what every existing entry in nav-config.ts passes. Lucide takes a numeric
// `size` instead, so without this adapter a Lucide icon would receive
// fontSize="small" straight onto an <svg> and render at the wrong size with a
// React warning to match. Wrapping is cheaper than converting a nav file that
// somebody else is editing.

import type { LucideIcon } from "lucide-react";
import type { NavIcon } from "./nav-icons";

const PIXELS = { small: 20, medium: 24, large: 28 } as const;

export function navIcon(Icon: LucideIcon): NavIcon {
  const Wrapped: NavIcon = ({ fontSize = "medium" }) => (
    <Icon size={PIXELS[fontSize]} strokeWidth={1.75} aria-hidden />
  );
  Wrapped.displayName = `NavIcon(${Icon.displayName ?? "Lucide"})`;
  return Wrapped;
}
