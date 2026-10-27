import {
  ApiError,
  BFF_PREFIX,
  parseRetryAfter,
  type ProblemDetails,
} from "@/lib/api/fetcher";
import { getSendMessageUrl } from "@/lib/api/generated/endpoints/ai-tutor/ai-tutor";
import type { SendMessageRequest } from "@/lib/api/generated/model";
import { readSse, type SseEvent } from "@/lib/sse/parse-sse";

/**
 * The tutor's streamed reply. Event payloads (camelCase JSON) are the
 * API's TutorStreamEvents: route, token, tool_call, citation, confirm, then
 * exactly one done or error. The OpenAPI document types the stream only as
 * a generic SSE item, so the payload shapes are mirrored here.
 */
export type TutorCitation = {
  chunkId: string | null;
  title: string | null;
  page: number | null;
  headingPath: string[];
  licence: string | null;
  displayRule: string | null;
  private: boolean;
};

export type TutorTool = { name: string; ok: boolean };

export type TutorConfirm = { tool: string; arguments: unknown };

export type ReplyStatus =
  "streaming" | "done" | "stopped" | "cut-off" | "failed";

export type TutorReply = {
  status: ReplyStatus;
  text: string;
  citations: TutorCitation[];
  tools: TutorTool[];
  confirm: TutorConfirm | null;
  route: { intent: string; gradedWork: boolean } | null;
  messageId: string | null;
  errorCode: string | null;
};

export function emptyReply(): TutorReply {
  return {
    status: "streaming",
    text: "",
    citations: [],
    tools: [],
    confirm: null,
    route: null,
    messageId: null,
    errorCode: null,
  };
}

function parse(data: string): Record<string, unknown> | null {
  try {
    const value = JSON.parse(data) as unknown;
    return value && typeof value === "object"
      ? (value as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

const str = (v: unknown) => (typeof v === "string" ? v : null);

/** Applies one stream event to the reply. Pure; unknown events are ignored. */
export function applyTutorEvent(
  reply: TutorReply,
  event: SseEvent,
): TutorReply {
  const data = parse(event.data);
  if (!data) return reply;
  switch (event.event) {
    case "token":
      return { ...reply, text: reply.text + (str(data.text) ?? "") };
    case "route":
      return {
        ...reply,
        route: {
          intent: str(data.intent) ?? "",
          gradedWork: data.gradedWork === true,
        },
      };
    case "tool_call":
      return {
        ...reply,
        tools: [
          ...reply.tools,
          { name: str(data.name) ?? "tool", ok: data.ok === true },
        ],
      };
    case "citation": {
      const citation: TutorCitation = {
        chunkId: str(data.chunkId),
        title: str(data.title),
        page: typeof data.page === "number" ? data.page : null,
        headingPath: Array.isArray(data.headingPath)
          ? data.headingPath.filter((h): h is string => typeof h === "string")
          : [],
        licence: str(data.licence),
        displayRule: str(data.displayRule),
        private: data.private === true,
      };
      const key = (c: TutorCitation) => `${c.chunkId}|${c.title}|${c.page}`;
      if (reply.citations.some((c) => key(c) === key(citation))) return reply;
      return { ...reply, citations: [...reply.citations, citation] };
    }
    case "confirm":
      return {
        ...reply,
        confirm: {
          tool: str(data.tool) ?? "",
          arguments: data.arguments ?? {},
        },
      };
    case "done":
      return { ...reply, status: "done", messageId: str(data.messageId) };
    case "error":
      return {
        ...reply,
        status:
          data.code === "ai.interrupted" || data.code === "ai.timeout"
            ? "cut-off"
            : "failed",
        errorCode: str(data.code),
        messageId: str(data.messageId),
      };
    default:
      return reply;
  }
}

/**
 * Sends a message and streams the reply through the BFF. Uses fetch with a
 * stream reader (EventSource cannot POST). Throws ApiError when the API
 * refuses before streaming (blocked during an attempt, daily limit, ...).
 */
export async function streamTutorReply(
  conversationId: string,
  body: SendMessageRequest,
  onEvent: (event: SseEvent) => void,
  options: { signal?: AbortSignal; idleMs?: number; fetch?: typeof fetch } = {},
): Promise<void> {
  const url = getSendMessageUrl(conversationId);
  const doFetch = options.fetch ?? fetch;
  const response = await doFetch(`${BFF_PREFIX}${url}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      accept: "text/event-stream",
    },
    body: JSON.stringify(body),
    signal: options.signal,
  });
  const type = response.headers.get("content-type") ?? "";
  if (!response.ok || !type.includes("text/event-stream") || !response.body) {
    let problem: ProblemDetails | undefined;
    try {
      problem = (await response.json()) as ProblemDetails;
    } catch {
      problem = undefined;
    }
    throw new ApiError(
      response.ok ? 502 : response.status,
      problem,
      url,
      parseRetryAfter(response.headers.get("retry-after")),
    );
  }
  await readSse(response.body, onEvent, {
    signal: options.signal,
    idleMs: options.idleMs,
  });
}

export type RefusalKind =
  | "blocked"
  | "daily-limit"
  | "rate-limited"
  | "unavailable"
  | "profile"
  | "not-found"
  | "forbidden"
  | "failed";

/** Maps a refusal before streaming to the state the chat shows. */
export function refusalOf(error: unknown): RefusalKind {
  if (!(error instanceof ApiError)) return "failed";
  if (error.code === "ai.blocked_during_attempt") return "blocked";
  if (error.code === "ai.daily_limit_reached") return "daily-limit";
  if (error.code === "ai.profile_required") return "profile";
  if (error.status === 429) return "rate-limited";
  if (error.status === 503) return "unavailable";
  if (error.status === 404) return "not-found";
  if (error.status === 403) return "forbidden";
  return "failed";
}

export const STREAM_ERROR_COPY: Record<string, string> = {
  "ai.unavailable":
    "The tutor is unavailable right now. Please try again in a few minutes.",
  "ai.turn_failed": "Something went wrong with this reply. Try again.",
  "ai.interrupted": "This reply was cut off.",
  "ai.timeout": "This reply was cut off.",
};
