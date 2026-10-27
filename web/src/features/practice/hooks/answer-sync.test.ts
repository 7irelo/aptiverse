import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "@/lib/api/fetcher";
import type { SaveAttemptAnswerRequest } from "@/lib/api/generated/model";

import {
  AnswerSync,
  backoffMs,
  storageKey,
  type SyncStatus,
} from "./answer-sync";

function memoryStorage() {
  const data = new Map<string, string>();
  return {
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => void data.set(k, v),
    removeItem: (k: string) => void data.delete(k),
    data,
  };
}

const saved = (revision: number) => ({
  questionId: "q1",
  revision,
  savedAt: "2026-10-27T10:00:00Z",
});

describe("AnswerSync", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("debounces saves and sends the revision it last saw", async () => {
    const calls: SaveAttemptAnswerRequest[] = [];
    const sync = new AnswerSync({
      attemptId: "a1",
      initial: [],
      debounceMs: 800,
      save: async (_q, body) => {
        calls.push(body);
        return saved(body.baseRevision + 1);
      },
    });
    sync.set("q1", { textAnswer: "x" });
    sync.set("q1", { textAnswer: "x = 3" });
    await vi.advanceTimersByTimeAsync(799);
    expect(calls).toHaveLength(0);
    await vi.advanceTimersByTimeAsync(1);
    expect(calls).toEqual([
      {
        selectedIndex: null,
        textAnswer: "x = 3",
        selfRating: null,
        baseRevision: 0,
      },
    ]);
    sync.set("q1", { textAnswer: "x = 3 or -3" });
    await sync.flush("q1");
    expect(calls[1]!.baseRevision).toBe(1);
    expect(sync.getStatus()).toBe("saved");
  });

  it("adopts currentRevision on a conflict and resends the latest value", async () => {
    const calls: SaveAttemptAnswerRequest[] = [];
    const sync = new AnswerSync({
      attemptId: "a1",
      initial: [],
      save: async (_q, body) => {
        calls.push(body);
        if (body.baseRevision !== 4) {
          throw new ApiError(
            409,
            { code: "practice.revision_conflict", currentRevision: 4 },
            "/x",
          );
        }
        return saved(5);
      },
    });
    sync.set("q1", { selectedIndex: 2 });
    await sync.flush("q1");
    expect(calls.map((c) => c.baseRevision)).toEqual([0, 4]);
    expect(calls[1]!.selectedIndex).toBe(2);
    expect(sync.getStatus()).toBe("saved");
  });

  it("stops and reports a conflict that repeats", async () => {
    const statuses: SyncStatus[] = [];
    let n = 0;
    const sync = new AnswerSync({
      attemptId: "a1",
      initial: [],
      onStatus: (s) => statuses.push(s),
      save: async () => {
        n += 1;
        throw new ApiError(
          409,
          { code: "practice.revision_conflict", currentRevision: 10 + n },
          "/x",
        );
      },
    });
    sync.set("q1", { selectedIndex: 1 });
    await sync.flush("q1");
    expect(n).toBe(2);
    expect(statuses.at(-1)).toBe("conflict");
  });

  it("retries network failures with backoff and reports offline", async () => {
    let fail = true;
    const statuses: SyncStatus[] = [];
    const save = vi.fn(async () => {
      if (fail) throw new TypeError("Failed to fetch");
      return saved(1);
    });
    const sync = new AnswerSync({
      attemptId: "a1",
      initial: [],
      save,
      onStatus: (s) => statuses.push(s),
    });
    sync.set("q1", { selectedIndex: 0 });
    await sync.flush("q1");
    expect(statuses.at(-1)).toBe("offline");
    fail = false;
    await vi.advanceTimersByTimeAsync(backoffMs(1));
    expect(save).toHaveBeenCalledTimes(2);
    expect(statuses.at(-1)).toBe("saved");
  });

  it("stops saving when the attempt is closed", async () => {
    const save = vi.fn(async () => {
      throw new ApiError(409, { code: "practice.deadline_passed" }, "/x");
    });
    const sync = new AnswerSync({ attemptId: "a1", initial: [], save });
    sync.set("q1", { selectedIndex: 0 });
    await sync.flush("q1");
    expect(sync.getStatus()).toBe("closed");
    sync.set("q1", { selectedIndex: 1 });
    await vi.advanceTimersByTimeAsync(5_000);
    expect(save).toHaveBeenCalledTimes(1);
  });

  it("keeps answers locally and replays unsynced ones after a reload", async () => {
    const storage = memoryStorage();
    const failing = new AnswerSync({
      attemptId: "a1",
      initial: [],
      storage,
      save: async () => {
        throw new TypeError("offline");
      },
    });
    failing.set("q1", { textAnswer: "kept" });
    failing.close();
    expect(storage.data.get(storageKey("a1"))).toContain("kept");

    const calls: SaveAttemptAnswerRequest[] = [];
    const reloaded = new AnswerSync({
      attemptId: "a1",
      initial: [],
      storage,
      save: async (_q, body) => {
        calls.push(body);
        return saved(1);
      },
    });
    expect(reloaded.answers()).toEqual({ q1: { textAnswer: "kept" } });
    reloaded.replay();
    await vi.advanceTimersByTimeAsync(0);
    expect(calls[0]!.textAnswer).toBe("kept");
  });

  it("caps backoff at 30 seconds", () => {
    expect(backoffMs(1)).toBe(1000);
    expect(backoffMs(3)).toBe(4000);
    expect(backoffMs(10)).toBe(30_000);
  });
});
