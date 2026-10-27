import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ApiError } from "@/lib/api/fetcher";

import type { streamTutorReply } from "../lib/tutor-stream";
import { useTutorChat } from "./use-tutor-chat";

type Stream = typeof streamTutorReply;

const ev = (event: string, data: unknown) => ({
  event,
  data: JSON.stringify(data),
});

describe("useTutorChat", () => {
  it("creates the conversation on first send and streams the reply", async () => {
    const created: string[] = [];
    const stream: Stream = async (_id, _body, onEvent) => {
      onEvent(ev("token", { text: "Hello" }));
      onEvent(ev("done", { messageId: "m1" }));
    };
    const { result } = renderHook(() =>
      useTutorChat({
        conversationId: null,
        initialMessages: [],
        stream,
        create: async () => ({ id: "c1" }),
        onConversationCreated: (id) => created.push(id),
      }),
    );
    await act(async () => {
      await result.current.send("Hi");
    });
    expect(created).toEqual(["c1"]);
    expect(result.current.messages).toHaveLength(2);
    expect(result.current.messages[1]!.reply).toMatchObject({
      text: "Hello",
      status: "done",
    });
  });

  it("stop aborts the stream and keeps the partial text", async () => {
    const stream: Stream = (_id, _body, onEvent, options) =>
      new Promise((_resolve, reject) => {
        onEvent(ev("token", { text: "Partial" }));
        options?.signal?.addEventListener("abort", () =>
          reject(new DOMException("stopped", "AbortError")),
        );
      });
    const { result } = renderHook(() =>
      useTutorChat({ conversationId: "c1", initialMessages: [], stream }),
    );
    let sending: Promise<boolean> | undefined;
    act(() => {
      sending = result.current.send("Hi");
    });
    await waitFor(() => expect(result.current.streaming).toBe(true));
    await act(async () => {
      result.current.stop();
      await sending;
    });
    expect(result.current.messages[1]!.reply).toMatchObject({
      text: "Partial",
      status: "stopped",
    });
  });

  it("shows the blocked state when the API refuses during a test", async () => {
    const stream: Stream = async () => {
      throw new ApiError(409, { code: "ai.blocked_during_attempt" }, "/x");
    };
    const { result } = renderHook(() =>
      useTutorChat({ conversationId: "c1", initialMessages: [], stream }),
    );
    let sent = true;
    await act(async () => {
      sent = await result.current.send("Hi");
    });
    expect(sent).toBe(false);
    expect(result.current.refusal).toBe("blocked");
    expect(result.current.messages).toEqual([
      expect.objectContaining({ role: "user", notSent: true }),
    ]);
  });

  it("marks a stream that ends without done as cut off", async () => {
    const stream: Stream = async (_id, _body, onEvent) => {
      onEvent(ev("token", { text: "Half" }));
    };
    const { result } = renderHook(() =>
      useTutorChat({ conversationId: "c1", initialMessages: [], stream }),
    );
    await act(async () => {
      await result.current.send("Hi");
    });
    expect(result.current.messages[1]!.reply!.status).toBe("cut-off");
  });
});
