import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  anchorFrom,
  announcementFor,
  estimateServerNow,
  remainingSeconds,
} from "./server-clock";
import { useCountdown } from "./use-countdown";

describe("server clock", () => {
  it("measures time from the server's clock, not the device's", () => {
    // The phone's wall clock is an hour wrong; only elapsed monotonic time counts.
    const anchor = anchorFrom("2026-10-27T10:00:00.000Z", 1_000);
    expect(estimateServerNow(anchor, 6_000)).toBe(
      Date.parse("2026-10-27T10:00:05.000Z"),
    );
    expect(remainingSeconds("2026-10-27T10:10:00.000Z", anchor, 6_000)).toBe(
      595,
    );
  });

  it("never goes below zero", () => {
    const anchor = anchorFrom("2026-10-27T10:00:00.000Z", 0);
    expect(remainingSeconds("2026-10-27T09:59:00.000Z", anchor, 0)).toBe(0);
  });

  it("announces only at 5 minutes and 1 minute", () => {
    expect(announcementFor(301, 300)).toBe("5 minutes left");
    expect(announcementFor(300, 299)).toBeNull();
    expect(announcementFor(61, 60)).toBe("1 minute left");
    expect(announcementFor(Infinity, 120)).toBeNull();
  });
});

describe("useCountdown", () => {
  let perf = 0;
  beforeEach(() => {
    vi.useFakeTimers();
    perf = 0;
    vi.spyOn(performance, "now").mockImplementation(() => perf);
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("counts down from the server deadline and expires once", () => {
    const onExpire = vi.fn();
    // Device clock far in the past: it must not matter.
    vi.setSystemTime(new Date("2020-01-01T00:00:00Z"));
    const { result } = renderHook(() =>
      useCountdown({
        deadlineAt: "2026-10-27T10:00:03.000Z",
        serverNow: "2026-10-27T10:00:00.000Z",
        onExpire,
      }),
    );
    expect(result.current.seconds).toBe(3);
    act(() => {
      perf = 2_000;
      vi.advanceTimersByTime(250);
    });
    expect(result.current.seconds).toBe(1);
    act(() => {
      perf = 3_500;
      vi.advanceTimersByTime(500);
    });
    expect(result.current.seconds).toBe(0);
    expect(onExpire).toHaveBeenCalledTimes(1);
  });

  it("resyncs to a newer serverNow", () => {
    const { result } = renderHook(() =>
      useCountdown({
        deadlineAt: "2026-10-27T10:01:00.000Z",
        serverNow: "2026-10-27T10:00:00.000Z",
      }),
    );
    act(() => {
      // The server says 30 s have passed although the monotonic clock moved 5 s.
      perf = 5_000;
      result.current.resync("2026-10-27T10:00:30.000Z");
      vi.advanceTimersByTime(250);
    });
    expect(result.current.seconds).toBe(30);
  });

  it("shows the frozen value when untimed or paused", () => {
    const { result } = renderHook(() =>
      useCountdown({
        deadlineAt: null,
        serverNow: "2026-10-27T10:00:00.000Z",
        frozenSeconds: 120,
      }),
    );
    expect(result.current.seconds).toBe(120);
  });
});
