import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { createFocusThrottle, useFocusMonitor } from "./use-focus-monitor";

function setVisibility(value: "hidden" | "visible") {
  Object.defineProperty(document, "visibilityState", {
    configurable: true,
    get: () => value,
  });
  document.dispatchEvent(new Event("visibilitychange"));
}

describe("createFocusThrottle", () => {
  it("counts events within the window once", () => {
    const shouldCount = createFocusThrottle(1000);
    expect(shouldCount(0)).toBe(true);
    expect(shouldCount(400)).toBe(false);
    expect(shouldCount(1000)).toBe(true);
  });
});

describe("useFocusMonitor", () => {
  afterEach(() => {
    vi.useRealTimers();
    setVisibility("visible");
  });

  it("reports a blur and a hidden tab close together once", () => {
    vi.useFakeTimers();
    const report = vi.fn();
    const onReturn = vi.fn();
    renderHook(() => useFocusMonitor({ enabled: true, report, onReturn }));
    window.dispatchEvent(new Event("blur"));
    setVisibility("hidden");
    expect(report).toHaveBeenCalledTimes(1);
    expect(report).toHaveBeenCalledWith("window_blur");
    setVisibility("visible");
    expect(onReturn).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(1500);
    setVisibility("hidden");
    expect(report).toHaveBeenCalledTimes(2);
    expect(report).toHaveBeenLastCalledWith("visibility_hidden");
  });

  it("does nothing while disabled", () => {
    const report = vi.fn();
    renderHook(() => useFocusMonitor({ enabled: false, report }));
    window.dispatchEvent(new Event("blur"));
    setVisibility("hidden");
    expect(report).not.toHaveBeenCalled();
  });
});
