"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";

// Rail widths. Expanded shows icon + label; collapsed is an icon-only rail
// (Euphoria's SidebarToggle model). The top bar's logo box reads these too so
// its divider stays flush with the rail's right edge as it animates.
export const SIDEBAR_WIDTH = 264;
export const SIDEBAR_COLLAPSED_WIDTH = 76;

const STORAGE_KEY = "aptiverse.sidebar.collapsed";

type SidebarCtx = {
  collapsed: boolean;
  toggle: () => void;
  setCollapsed: (v: boolean) => void;
};

const SidebarContext = createContext<SidebarCtx | null>(null);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  // Start expanded on the server so SSR markup is stable, then hydrate the
  // persisted choice after mount to avoid a hydration mismatch.
  const [collapsed, setCollapsedState] = useState(false);

  useEffect(() => {
    try {
      if (window.localStorage.getItem(STORAGE_KEY) === "1") setCollapsedState(true);
    } catch {
      /* localStorage unavailable (private mode) — default expanded */
    }
  }, []);

  const persist = (v: boolean) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, v ? "1" : "0");
    } catch {
      /* ignore */
    }
  };

  const setCollapsed = useCallback((v: boolean) => {
    setCollapsedState(v);
    persist(v);
  }, []);

  const toggle = useCallback(() => {
    setCollapsedState((prev) => {
      const next = !prev;
      persist(next);
      return next;
    });
  }, []);

  return (
    <SidebarContext.Provider value={{ collapsed, toggle, setCollapsed }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebarState(): SidebarCtx {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebarState must be used within a SidebarProvider");
  return ctx;
}
