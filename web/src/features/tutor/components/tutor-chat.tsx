"use client";

import {
  ArrowDown,
  Copy,
  LoaderCircle,
  RotateCcw,
  Send,
  Square,
} from "lucide-react";
import Link from "next/link";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";

import { FormAlert } from "@/components/common/form-alert";
import { Markdown } from "@/components/common/markdown";
import { Button } from "@/components/ui/button";

import { useTutorChat, type ChatMessage } from "../hooks/use-tutor-chat";
import {
  STREAM_ERROR_COPY,
  type RefusalKind,
  type TutorReply,
} from "../lib/tutor-stream";
import { CitationList, ConfirmCard, ToolActivity } from "./reply-parts";

const MAX_CHARS = 4000;

const REFUSAL_COPY: Record<RefusalKind, string> = {
  blocked:
    "The tutor is off while you have a practice test in progress. Submit the test to chat again.",
  "daily-limit":
    "You have reached today's tutor message limit. It resets at midnight UTC.",
  "rate-limited":
    "You're sending messages quickly. Wait a moment and try again.",
  unavailable:
    "The tutor is unavailable right now. Please try again in a few minutes. Your message was not counted.",
  profile:
    "Finish setting up your study profile before chatting with the tutor.",
  "not-found": "We could not find that conversation.",
  forbidden: "The AI tutor is not part of your plan.",
  failed: "Your message was not sent. Check your connection and try again.",
};

type TutorChatProps = {
  conversationId: string | null;
  initialMessages: ChatMessage[];
  suggestions: string[];
  unitLabel: string | null;
};

/** The tutor thread, composer and streamed replies. */
export function TutorChat({
  conversationId,
  initialMessages,
  suggestions,
  unitLabel,
}: TutorChatProps) {
  const chat = useTutorChat({
    conversationId,
    initialMessages,
    onConversationCreated: (id) => {
      // Update the URL without a navigation, so the stream keeps running.
      window.history.replaceState(null, "", `/dashboard/tutor/${id}`);
    },
  });
  const [draft, setDraft] = useState("");
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [atBottom, setAtBottom] = useState(true);
  const endRef = useRef<HTMLDivElement>(null);
  const threadRef = useRef<HTMLDivElement>(null);
  const inputId = useId();
  const [announcement, setAnnouncement] = useState("");
  const wasStreaming = useRef(false);

  const last = chat.messages[chat.messages.length - 1];
  const lastReply = last?.role === "assistant" ? last.reply : undefined;

  useEffect(() => {
    if (chat.streaming && !wasStreaming.current)
      setAnnouncement("Tutor is replying");
    if (!chat.streaming && wasStreaming.current && lastReply) {
      setAnnouncement(
        lastReply.status === "done"
          ? lastReply.text
          : (statusLabel(lastReply) ?? ""),
      );
    }
    wasStreaming.current = chat.streaming;
  }, [chat.streaming, lastReply]);

  useEffect(() => {
    if (atBottom) endRef.current?.scrollIntoView({ block: "end" });
  }, [chat.messages, atBottom]);

  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      setAtBottom(
        window.innerHeight + window.scrollY >= doc.scrollHeight - 120,
      );
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  async function submit(event?: FormEvent) {
    event?.preventDefault();
    const text = draft;
    if (!text.trim() || chat.streaming) return;
    setDraft("");
    const sent = await chat.send(text);
    if (!sent) setDraft(text);
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    const desktop = window.matchMedia("(pointer: fine)").matches;
    if (event.key === "Enter" && !event.shiftKey && desktop) {
      event.preventDefault();
      void submit();
    }
  }

  const blocked = chat.refusal === "blocked" || chat.refusal === "daily-limit";

  return (
    <div className="flex flex-col gap-4">
      <p className="rounded-lg border bg-card p-3 text-sm text-muted-foreground">
        Aptiverse tutor is an AI study aid, not a person. It can make mistakes,
        so check important answers.
      </p>

      <div
        ref={threadRef}
        className="flex flex-col gap-4"
        aria-label="Conversation"
        role="log"
        aria-live="off"
      >
        {chat.messages.length === 0 ? (
          <div className="flex flex-col gap-3 py-6">
            <h2 className="text-lg font-semibold">What are you working on?</h2>
            <ul className="flex flex-col gap-2">
              {suggestions.map((s) => (
                <li key={s}>
                  <Button
                    variant="outline"
                    className="min-h-11 w-full justify-start px-4 text-left whitespace-normal"
                    onClick={() => setDraft(s)}
                  >
                    {s}
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          chat.messages.map((m, i) => (
            <MessageRow
              key={m.key}
              message={m}
              isLast={i === chat.messages.length - 1}
              streaming={chat.streaming}
              confirmDismissed={dismissed.has(m.key)}
              onConfirm={(reply) => {
                if (!reply.confirm) return;
                setDismissed((s) => new Set(s).add(m.key));
                void chat.send("Yes, make the quiz.", {
                  tool: reply.confirm.tool,
                  arguments: reply.confirm.arguments as never,
                });
              }}
              onDismiss={() => setDismissed((s) => new Set(s).add(m.key))}
              onStop={chat.stop}
              onRetry={chat.retry}
            />
          ))
        )}
        <div ref={endRef} />
      </div>
      <span className="sr-only" aria-live="polite">
        {announcement}
      </span>

      {chat.streaming && !atBottom ? (
        <Button
          variant="outline"
          className="fixed right-4 bottom-40 z-10 min-h-11 rounded-full px-4 shadow"
          onClick={() => endRef.current?.scrollIntoView({ block: "end" })}
        >
          <ArrowDown aria-hidden="true" />
          Jump to latest
        </Button>
      ) : null}

      {chat.refusal ? (
        <FormAlert>
          <p>{REFUSAL_COPY[chat.refusal]}</p>
          {chat.refusal === "blocked" ? (
            <div>
              <Button asChild className="min-h-11 px-4">
                <Link href="/dashboard/practice">Back to your test</Link>
              </Button>
            </div>
          ) : null}
        </FormAlert>
      ) : null}

      <form
        onSubmit={(e) => void submit(e)}
        className="sticky bottom-0 flex flex-col gap-2 border-t bg-background py-3"
      >
        <label htmlFor={inputId} className="sr-only">
          Message the tutor
        </label>
        <div className="flex items-end gap-2">
          <textarea
            id={inputId}
            value={draft}
            maxLength={MAX_CHARS}
            rows={1}
            disabled={blocked}
            onChange={(e) => setDraft(e.target.value.slice(0, MAX_CHARS))}
            onKeyDown={onKeyDown}
            placeholder={`Ask about ${unitLabel ?? "any subject"}...`}
            className="field-sizing-content max-h-40 min-h-11 flex-1 resize-none rounded-2xl border border-input bg-background px-4 py-2.5 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50 dark:bg-input/30"
          />
          {chat.streaming ? (
            <Button
              type="button"
              variant="outline"
              className="min-h-11 px-4"
              onClick={chat.stop}
            >
              <Square aria-hidden="true" />
              Stop
            </Button>
          ) : (
            <Button
              type="submit"
              className="min-h-11 px-4"
              disabled={!draft.trim() || blocked}
            >
              <Send aria-hidden="true" />
              Send
            </Button>
          )}
        </div>
        {draft.length >= 3500 ? (
          <p className="text-xs text-muted-foreground" aria-live="polite">
            {draft.length} of {MAX_CHARS} characters
          </p>
        ) : null}
      </form>
    </div>
  );
}

function statusLabel(reply: TutorReply): string | null {
  if (reply.status === "stopped") return "Stopped";
  if (reply.status === "cut-off") return "This reply was cut off.";
  if (reply.status === "failed") {
    return (
      (reply.errorCode && STREAM_ERROR_COPY[reply.errorCode]) ??
      "This reply did not finish."
    );
  }
  return null;
}

function MessageRow({
  message,
  isLast,
  streaming,
  confirmDismissed,
  onConfirm,
  onDismiss,
  onStop,
  onRetry,
}: {
  message: ChatMessage;
  isLast: boolean;
  streaming: boolean;
  confirmDismissed: boolean;
  onConfirm: (reply: TutorReply) => void;
  onDismiss: () => void;
  onStop: () => void;
  onRetry: () => void;
}) {
  if (message.role === "user") {
    return (
      <div className="flex flex-col items-end gap-1">
        <span className="text-xs text-muted-foreground">You</span>
        <div className="max-w-[85%] rounded-2xl bg-primary px-4 py-2 whitespace-pre-wrap text-primary-foreground">
          {message.content}
        </div>
        {message.notSent ? (
          <span className="text-xs text-error">Not sent</span>
        ) : null}
      </div>
    );
  }

  const reply = message.reply;
  const text = reply ? reply.text : message.content;
  const live = reply?.status === "streaming";
  const label = reply
    ? statusLabel(reply)
    : message.savedStatus === "incomplete"
      ? "This reply was cut off."
      : null;

  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs text-muted-foreground">Tutor</span>
      <div
        className="min-h-12 rounded-2xl border bg-card px-4 py-3"
        aria-busy={live || undefined}
      >
        {text ? (
          <Markdown>{text}</Markdown>
        ) : live ? (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <LoaderCircle
              aria-hidden="true"
              className="size-4 animate-spin motion-reduce:animate-none"
            />
            Thinking
          </p>
        ) : null}
      </div>
      {reply ? <ToolActivity tools={reply.tools} /> : null}
      {reply ? <CitationList citations={reply.citations} /> : null}
      {reply?.confirm && reply.status === "done" && !confirmDismissed ? (
        <ConfirmCard
          confirm={reply.confirm}
          disabled={streaming}
          onConfirm={() => onConfirm(reply)}
          onDismiss={onDismiss}
        />
      ) : null}
      <div className="flex min-h-11 flex-wrap items-center gap-2">
        {live ? (
          <Button variant="ghost" className="min-h-11 px-3" onClick={onStop}>
            <Square aria-hidden="true" />
            Stop
          </Button>
        ) : (
          <>
            {label ? (
              <span className="text-sm text-muted-foreground">{label}</span>
            ) : null}
            {isLast && reply && reply.status !== "done" ? (
              <Button
                variant="outline"
                className="min-h-11 px-3"
                onClick={onRetry}
              >
                <RotateCcw aria-hidden="true" />
                Try again
              </Button>
            ) : null}
            {text ? (
              <Button
                variant="ghost"
                className="min-h-11 px-3"
                onClick={() => void navigator.clipboard?.writeText(text)}
              >
                <Copy aria-hidden="true" />
                Copy
              </Button>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
