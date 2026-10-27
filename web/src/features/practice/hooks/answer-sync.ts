import { ApiError } from "@/lib/api/fetcher";
import type {
  SaveAttemptAnswerRequest,
  SavedAnswer,
  SavedAnswerView,
} from "@/lib/api/generated/model";

/** One answer as the runner holds it: exactly one field is set. */
export type AnswerValue =
  { selectedIndex: number } | { textAnswer: string } | { selfRating: string };

export type SyncStatus =
  "idle" | "saving" | "saved" | "offline" | "conflict" | "closed";

export type SaveFn = (
  questionId: string,
  body: SaveAttemptAnswerRequest,
) => Promise<SavedAnswer>;

type Entry = {
  value: AnswerValue | null;
  revision: number;
  dirty: boolean;
  inFlight: boolean;
  conflicts: number;
  failures: number;
  timer: ReturnType<typeof setTimeout> | null;
};

type Stored = Record<string, { value: AnswerValue; revision: number }>;

export type AnswerSyncOptions = {
  attemptId: string;
  initial: readonly SavedAnswerView[];
  save: SaveFn;
  onStatus?: (status: SyncStatus) => void;
  /** Server time of each successful save, to resync the countdown. */
  onSaved?: (savedAt: string) => void;
  debounceMs?: number;
  storage?: Pick<Storage, "getItem" | "setItem" | "removeItem"> | null;
};

export function storageKey(attemptId: string): string {
  return `aptiverse.attempt.${attemptId}`;
}

export function valueOf(answer: SavedAnswerView): AnswerValue | null {
  if (answer.selectedIndex !== null && answer.selectedIndex !== undefined) {
    return { selectedIndex: answer.selectedIndex };
  }
  if (answer.textAnswer !== null && answer.textAnswer !== undefined) {
    return { textAnswer: answer.textAnswer };
  }
  if (answer.selfRating) return { selfRating: answer.selfRating };
  return null;
}

function sameValue(a: AnswerValue | null, b: AnswerValue | null): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

/** Retry delay after a failed save: 1 s, 2 s, 4 s, up to 30 s. */
export function backoffMs(failures: number): number {
  return Math.min(30_000, 1000 * 2 ** Math.max(0, failures - 1));
}

/**
 * Keeps a practice attempt's answers in sync with the server.
 *
 * - Every change is written to localStorage first, so a reload or a dead
 *   connection never loses an answer; unsynced answers replay on load.
 * - Saves are debounced per question and run one at a time per question,
 *   each carrying baseRevision (the revision last seen).
 * - A 409 practice.revision_conflict adopts the server's currentRevision
 *   and resends the student's latest value (the newest intent wins). A
 *   second conflict in a row stops and reports "conflict".
 * - Network failures and 5xx retry with backoff and report "offline".
 * - A closed attempt (submitted, deadline passed) stops all saving.
 */
export class AnswerSync {
  private readonly entries = new Map<string, Entry>();
  private readonly opts: Required<
    Omit<AnswerSyncOptions, "storage" | "onSaved" | "onStatus">
  > &
    Pick<AnswerSyncOptions, "storage" | "onSaved" | "onStatus">;
  private status: SyncStatus = "idle";
  private closed = false;

  constructor(options: AnswerSyncOptions) {
    this.opts = { debounceMs: 800, ...options };
    for (const answer of options.initial) {
      this.entries.set(
        answer.questionId,
        this.newEntry(valueOf(answer), answer.revision),
      );
    }
    this.restoreLocal();
  }

  private newEntry(value: AnswerValue | null, revision: number): Entry {
    return {
      value,
      revision,
      dirty: false,
      inFlight: false,
      conflicts: 0,
      failures: 0,
      timer: null,
    };
  }

  private entry(questionId: string): Entry {
    let e = this.entries.get(questionId);
    if (!e) {
      e = this.newEntry(null, 0);
      this.entries.set(questionId, e);
    }
    return e;
  }

  /** Answers the runner should show, merged from server and local store. */
  answers(): Record<string, AnswerValue> {
    const out: Record<string, AnswerValue> = {};
    for (const [id, e] of this.entries) if (e.value) out[id] = e.value;
    return out;
  }

  /** Replaces the callback that receives each save's server time. */
  setOnSaved(fn: ((savedAt: string) => void) | undefined) {
    this.opts.onSaved = fn;
  }

  getStatus(): SyncStatus {
    return this.status;
  }

  hasPending(): boolean {
    for (const e of this.entries.values())
      if (e.dirty || e.inFlight) return true;
    return false;
  }

  private setStatus(status: SyncStatus) {
    if (this.status === status) return;
    this.status = status;
    this.opts.onStatus?.(status);
  }

  private restoreLocal() {
    const storage = this.opts.storage;
    if (!storage) return;
    let stored: Stored | null = null;
    try {
      const raw = storage.getItem(storageKey(this.opts.attemptId));
      stored = raw ? (JSON.parse(raw) as Stored) : null;
    } catch {
      stored = null;
    }
    if (!stored) return;
    for (const [id, local] of Object.entries(stored)) {
      const e = this.entry(id);
      // A local answer the server has not seen yet wins and is replayed.
      if (!sameValue(local.value, e.value)) {
        e.value = local.value;
        e.dirty = true;
      }
    }
  }

  private writeLocal() {
    const storage = this.opts.storage;
    if (!storage) return;
    const stored: Stored = {};
    for (const [id, e] of this.entries) {
      if (e.value) stored[id] = { value: e.value, revision: e.revision };
    }
    try {
      storage.setItem(storageKey(this.opts.attemptId), JSON.stringify(stored));
    } catch {
      // Storage full or blocked: the server copy still syncs.
    }
  }

  /** Replays answers restored from the local store. */
  replay() {
    for (const [id, e] of this.entries) if (e.dirty) this.schedule(id, 0);
  }

  /** Records a change and schedules its save. */
  set(questionId: string, value: AnswerValue) {
    if (this.closed) return;
    const e = this.entry(questionId);
    e.value = value;
    e.dirty = true;
    e.conflicts = 0;
    this.writeLocal();
    this.schedule(questionId, this.opts.debounceMs);
  }

  /** Saves now (on Next, Previous, navigator jumps and pagehide). */
  flush(questionId?: string): Promise<void> {
    const ids = questionId ? [questionId] : [...this.entries.keys()];
    return Promise.all(
      ids.map((id) => {
        const e = this.entries.get(id);
        if (!e || !e.dirty) return Promise.resolve();
        if (e.timer) clearTimeout(e.timer);
        e.timer = null;
        return this.run(id);
      }),
    ).then(() => undefined);
  }

  /** Stops saving (the attempt was submitted or closed). */
  close(clearLocal = false) {
    this.closed = true;
    for (const e of this.entries.values()) {
      if (e.timer) clearTimeout(e.timer);
      e.timer = null;
    }
    if (clearLocal) {
      try {
        this.opts.storage?.removeItem(storageKey(this.opts.attemptId));
      } catch {
        // ignore
      }
    }
  }

  private schedule(questionId: string, delay: number) {
    const e = this.entry(questionId);
    if (e.timer) clearTimeout(e.timer);
    e.timer = setTimeout(() => {
      e.timer = null;
      void this.run(questionId);
    }, delay);
  }

  private async run(questionId: string): Promise<void> {
    const e = this.entry(questionId);
    if (this.closed || e.inFlight || !e.dirty || !e.value) return;
    e.inFlight = true;
    e.dirty = false;
    const value = e.value;
    this.setStatus("saving");
    try {
      const saved = await this.opts.save(questionId, {
        selectedIndex: "selectedIndex" in value ? value.selectedIndex : null,
        textAnswer: "textAnswer" in value ? value.textAnswer : null,
        selfRating: "selfRating" in value ? value.selfRating : null,
        baseRevision: e.revision,
      });
      e.revision = saved.revision;
      e.failures = 0;
      e.conflicts = 0;
      this.writeLocal();
      this.opts.onSaved?.(saved.savedAt);
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        if (error.code === "practice.revision_conflict") {
          const current = error.problem?.currentRevision;
          e.conflicts += 1;
          if (typeof current === "number" && e.conflicts <= 1) {
            e.revision = current;
            e.dirty = true;
          } else {
            e.inFlight = false;
            this.setStatus("conflict");
            return;
          }
        } else {
          // attempt_not_active, deadline_passed, attempt_paused: stop.
          e.inFlight = false;
          this.close();
          this.setStatus("closed");
          return;
        }
      } else if (
        error instanceof ApiError &&
        error.status < 500 &&
        error.status !== 429
      ) {
        // A refused answer will not succeed on retry.
        e.inFlight = false;
        this.setStatus("conflict");
        return;
      } else {
        e.dirty = true;
        e.failures += 1;
        e.inFlight = false;
        this.setStatus("offline");
        this.schedule(questionId, backoffMs(e.failures));
        return;
      }
    }
    e.inFlight = false;
    if (e.dirty) {
      return this.run(questionId);
    }
    if (!this.hasPending()) this.setStatus("saved");
  }
}
