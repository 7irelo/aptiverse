import { describe, expect, it, vi } from "vitest";

import {
  IdleTimeoutError,
  readSse,
  SseParser,
  type SseEvent,
} from "./parse-sse";

function streamOf(chunks: string[], options: { hang?: boolean } = {}) {
  const encoder = new TextEncoder();
  return new ReadableStream<Uint8Array>({
    start(controller) {
      for (const chunk of chunks) controller.enqueue(encoder.encode(chunk));
      if (!options.hang) controller.close();
    },
  });
}

describe("SseParser", () => {
  it("parses named events with JSON data", () => {
    const parser = new SseParser();
    const events = parser.feed(
      'event: token\ndata: {"text":"Hi"}\n\nevent: done\ndata: {"messageId":"1"}\n\n',
    );
    expect(events).toEqual([
      { event: "token", data: '{"text":"Hi"}' },
      { event: "done", data: '{"messageId":"1"}' },
    ]);
  });

  it("joins events split across chunks, including a split CRLF", () => {
    const parser = new SseParser();
    const out: SseEvent[] = [];
    for (const chunk of [
      "event: tok",
      "en\r",
      '\ndata: {"te',
      'xt":"a"}\r\n\r\n',
    ]) {
      out.push(...parser.feed(chunk));
    }
    expect(out).toEqual([{ event: "token", data: '{"text":"a"}' }]);
  });

  it("joins multi-line data, ignores comments and defaults to message", () => {
    const parser = new SseParser();
    const events = parser.feed(": keep-alive\ndata: one\ndata: two\nid: 7\n\n");
    expect(events).toEqual([{ event: "message", data: "one\ntwo", id: "7" }]);
  });

  it("drops an unterminated event at the end", () => {
    const parser = new SseParser();
    expect(parser.feed("event: token\ndata: {}")).toEqual([]);
    expect(parser.end()).toEqual([]);
  });
});

describe("readSse", () => {
  it("delivers every event from the body", async () => {
    const events: SseEvent[] = [];
    await readSse(
      streamOf([
        'event: token\ndata: {"text":"a"}\n\n',
        "event: done\ndata: {}\n\n",
      ]),
      (e) => events.push(e),
    );
    expect(events.map((e) => e.event)).toEqual(["token", "done"]);
  });

  it("rejects with AbortError when the signal aborts", async () => {
    const controller = new AbortController();
    const events: SseEvent[] = [];
    const reading = readSse(
      streamOf(['event: token\ndata: {"text":"a"}\n\n'], { hang: true }),
      (e) => {
        events.push(e);
        controller.abort();
      },
      { signal: controller.signal },
    );
    await expect(reading).rejects.toMatchObject({ name: "AbortError" });
    expect(events).toHaveLength(1);
  });

  it("gives up with IdleTimeoutError when no bytes arrive", async () => {
    vi.useFakeTimers();
    try {
      const reading = readSse(streamOf([], { hang: true }), () => {}, {
        idleMs: 1000,
      });
      const assertion =
        expect(reading).rejects.toBeInstanceOf(IdleTimeoutError);
      await vi.advanceTimersByTimeAsync(1001);
      await assertion;
    } finally {
      vi.useRealTimers();
    }
  });
});
