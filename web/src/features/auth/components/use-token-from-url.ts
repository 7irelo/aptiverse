"use client";

import { useEffect } from "react";

/**
 * Removes a one-time token from the address bar once the page has it, so it
 * does not linger in history, screenshots or a shared tab. The token stays
 * in component memory and is sent only in a POST body.
 */
export function useStripTokenFromUrl(path: string) {
  useEffect(() => {
    if (window.location.search) {
      window.history.replaceState(window.history.state, "", path);
    }
  }, [path]);
}
