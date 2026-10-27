"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { createConversation } from "@/lib/api/generated/endpoints/ai-tutor/ai-tutor";
import type { ConfirmedTutorAction } from "@/lib/api/generated/model";
import { IdleTimeoutError } from "@/lib/sse/parse-sse";

import {
  applyTutorEvent,
  emptyReply,
  refusalOf,
  streamTutorReply,
  type RefusalKind,
  type TutorReply,
} from "../lib/tutor-stream";

export type ChatMessage = {
  key: string;
  role: "user" | "assistant";
  content: string;
  /** Live or finished streamed reply (assistant only). */
  reply?: TutorReply;
  /** Saved status from the server: complete, incomplete or failed. */
  savedStatus?: string;
  notSent?: boolean;
};

let counter = 0;
const nextKey = () => `m${Date.now()}-${counter++}`;

/**
 * Chat state for one conversation: optimistic user messages, a streamed
 * assistant reply, stop, retry and the refusals the API sends before
 * streaming (blocked during a test, daily limit, unavailable).
 */
export function useTutorChat({
  conversationId: initialId,
  initialMessages,
  onConversationCreated,
  stream = streamTutorReply,
  create = (title: string) => createConversation({ title, mode: null }),
}: {
  conversationId: string | null;
  initialMessages: ChatMessage[];
  onConversationCreated?: (id: string) => void;
  stream?: typeof streamTutorReply;
  create?: (title: string) => Promise<{ id: string }>;
}) {
  const [conversationId, setConversationId] = useState(initialId);
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [streaming, setStreaming] = useState(false);
  const [refusal, setRefusal] = useState<RefusalKind | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const stoppedRef = useRef(false);

  useEffect(() => () => abortRef.current?.abort(), []);

  const updateReply = useCallback(
    (key: string, update: (reply: TutorReply) => TutorReply) => {
      setMessages((list) =>
        list.map((m) =>
          m.key === key && m.reply ? { ...m, reply: update(m.reply) } : m,
        ),
      );
    },
    [],
  );

  const send = useCallback(
    async (text: string, confirmedAction?: ConfirmedTutorAction) => {
      const message = text.trim();
      if (!message || streaming) return false;
      setRefusal(null);
      const userKey = nextKey();
      const replyKey = nextKey();
      setMessages((list) => [
        ...list,
        { key: userKey, role: "user", content: message },
        { key: replyKey, role: "assistant", content: "", reply: emptyReply() },
      ]);
      setStreaming(true);
      stoppedRef.current = false;
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        let id = conversationId;
        if (!id) {
          const created = await create(message.slice(0, 80));
          id = created.id;
          setConversationId(id);
          onConversationCreated?.(id);
        }
        await stream(
          id,
          {
            message,
            allowPrivateNotes: false,
            confirmedAction: confirmedAction ?? null,
          },
          (event) => updateReply(replyKey, (r) => applyTutorEvent(r, event)),
          { signal: controller.signal },
        );
        // A stream that ends without done or error was cut off.
        updateReply(replyKey, (r) =>
          r.status === "streaming" ? { ...r, status: "cut-off" } : r,
        );
      } catch (error) {
        if (
          stoppedRef.current ||
          (error instanceof DOMException && error.name === "AbortError")
        ) {
          updateReply(replyKey, (r) =>
            r.status === "streaming" ? { ...r, status: "stopped" } : r,
          );
        } else if (error instanceof IdleTimeoutError) {
          updateReply(replyKey, (r) => ({ ...r, status: "cut-off" }));
        } else {
          // Refused before streaming: drop the empty reply, keep the text.
          const kind = refusalOf(error);
          setRefusal(kind);
          setMessages((list) =>
            list
              .filter((m) => m.key !== replyKey)
              .map((m) => (m.key === userKey ? { ...m, notSent: true } : m)),
          );
          return false;
        }
      } finally {
        setStreaming(false);
        abortRef.current = null;
      }
      return true;
    },
    [
      conversationId,
      create,
      onConversationCreated,
      stream,
      streaming,
      updateReply,
    ],
  );

  const stop = useCallback(() => {
    stoppedRef.current = true;
    abortRef.current?.abort();
  }, []);

  /** Resends the last user message after a cut-off or failed reply. */
  const retry = useCallback(() => {
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    if (!lastUser) return;
    void send(lastUser.content);
  }, [messages, send]);

  return {
    conversationId,
    messages,
    streaming,
    refusal,
    send,
    stop,
    retry,
    setRefusal,
  };
}
