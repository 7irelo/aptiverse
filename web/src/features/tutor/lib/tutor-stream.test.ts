import { describe, expect, it } from "vitest";

import { ApiError } from "@/lib/api/fetcher";

import {
  applyTutorEvent,
  emptyReply,
  refusalOf,
  streamTutorReply,
} from "./tutor-stream";

const ev = (event: string, data: unknown) => ({
  event,
  data: JSON.stringify(data),
});

describe("applyTutorEvent", () => {
  it("builds a reply from tokens, tools, citations and done", () => {
    let reply = emptyReply();
    reply = applyTutorEvent(
      reply,
      ev("route", { intent: "explain", gradedWork: false }),
    );
    reply = applyTutorEvent(
      reply,
      ev("tool_call", { name: "search_curriculum", ok: true }),
    );
    reply = applyTutorEvent(reply, ev("token", { text: "Take the " }));
    reply = applyTutorEvent(reply, ev("token", { text: "square root." }));
    const citation = {
      chunkId: "c1",
      title: "CAPS Mathematics",
      page: 4,
      headingPath: ["Algebra"],
      licence: null,
      displayRule: null,
      private: false,
    };
    reply = applyTutorEvent(reply, ev("citation", citation));
    reply = applyTutorEvent(reply, ev("citation", citation));
    reply = applyTutorEvent(
      reply,
      ev("done", { messageId: "m1", route: "explain" }),
    );

    expect(reply.text).toBe("Take the square root.");
    expect(reply.tools).toEqual([{ name: "search_curriculum", ok: true }]);
    expect(reply.citations).toHaveLength(1);
    expect(reply.route).toEqual({ intent: "explain", gradedWork: false });
    expect(reply).toMatchObject({ status: "done", messageId: "m1" });
  });

  it("keeps the proposed action from a confirm event", () => {
    const reply = applyTutorEvent(
      emptyReply(),
      ev("confirm", { tool: "propose_quiz", arguments: { topic: "Algebra" } }),
    );
    expect(reply.confirm).toEqual({
      tool: "propose_quiz",
      arguments: { topic: "Algebra" },
    });
  });

  it("marks interruptions as cut off and other errors as failed", () => {
    expect(
      applyTutorEvent(
        emptyReply(),
        ev("error", { code: "ai.interrupted", messageId: null }),
      ).status,
    ).toBe("cut-off");
    expect(
      applyTutorEvent(
        emptyReply(),
        ev("error", { code: "ai.turn_failed", messageId: null }),
      ).status,
    ).toBe("failed");
  });

  it("ignores malformed and unknown events", () => {
    const reply = emptyReply();
    expect(applyTutorEvent(reply, { event: "token", data: "not json" })).toBe(
      reply,
    );
    expect(applyTutorEvent(reply, ev("mystery", {}))).toBe(reply);
  });
});

describe("streamTutorReply", () => {
  it("throws the API's refusal before streaming", async () => {
    const fetchStub = async () =>
      new Response(
        JSON.stringify({ status: 409, code: "ai.blocked_during_attempt" }),
        {
          status: 409,
          headers: { "content-type": "application/problem+json" },
        },
      );
    const error = await streamTutorReply(
      "c1",
      { message: "hi", allowPrivateNotes: false, confirmedAction: null },
      () => {},
      { fetch: fetchStub as typeof fetch },
    ).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(refusalOf(error)).toBe("blocked");
  });

  it("posts through the BFF and streams events", async () => {
    let calledWith = "";
    const fetchStub = async (url: string) => {
      calledWith = url;
      return new Response('event: token\ndata: {"text":"ok"}\n\n', {
        status: 200,
        headers: { "content-type": "text/event-stream" },
      });
    };
    const events: string[] = [];
    await streamTutorReply(
      "c1",
      { message: "hi", allowPrivateNotes: false, confirmedAction: null },
      (e) => events.push(e.event),
      { fetch: fetchStub as unknown as typeof fetch },
    );
    expect(calledWith).toBe("/api/bff/ai/conversations/c1/messages");
    expect(events).toEqual(["token"]);
  });

  it("maps refusals to chat states", () => {
    const err = (status: number, code?: string) =>
      new ApiError(status, code ? { code } : undefined, "/x");
    expect(refusalOf(err(429, "ai.daily_limit_reached"))).toBe("daily-limit");
    expect(refusalOf(err(429))).toBe("rate-limited");
    expect(refusalOf(err(503))).toBe("unavailable");
    expect(refusalOf(new Error("boom"))).toBe("failed");
  });
});
