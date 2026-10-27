/**
 * Incremental Server-Sent Events parser for fetch streams. EventSource
 * cannot POST, so the tutor stream is read with fetch and parsed here.
 * Follows the WHATWG event stream rules: lines end in LF, CR or CRLF, a
 * blank line dispatches, "data" lines join with LF, ":" lines are comments.
 */
export type SseEvent = { event: string; data: string; id?: string };

export class SseParser {
  private buffer = "";
  private data: string[] = [];
  private event = "";
  private id: string | undefined;
  private sawCr = false;

  /** Feeds a decoded chunk; returns the events it completed. */
  feed(chunk: string): SseEvent[] {
    const out: SseEvent[] = [];
    let text = chunk;
    // A CRLF split across chunks: drop the LF that follows a trailing CR.
    if (this.sawCr && text.startsWith("\n")) text = text.slice(1);
    this.sawCr = text.endsWith("\r");
    this.buffer += text;
    const lines = this.buffer.split(/\r\n|\r|\n/);
    this.buffer = lines.pop() ?? "";
    for (const line of lines) this.line(line, out);
    return out;
  }

  /** Ends the stream: an unterminated event is discarded, per the spec. */
  end(): SseEvent[] {
    this.buffer = "";
    this.data = [];
    this.event = "";
    return [];
  }

  private line(line: string, out: SseEvent[]) {
    if (line === "") {
      if (this.data.length > 0) {
        out.push({
          event: this.event || "message",
          data: this.data.join("\n"),
          ...(this.id !== undefined ? { id: this.id } : {}),
        });
      }
      this.data = [];
      this.event = "";
      return;
    }
    if (line.startsWith(":")) return;
    const colon = line.indexOf(":");
    const field = colon === -1 ? line : line.slice(0, colon);
    let value = colon === -1 ? "" : line.slice(colon + 1);
    if (value.startsWith(" ")) value = value.slice(1);
    switch (field) {
      case "data":
        this.data.push(value);
        break;
      case "event":
        this.event = value;
        break;
      case "id":
        if (!value.includes("\0")) this.id = value;
        break;
      default:
        break;
    }
  }
}

/**
 * Reads an SSE response body, calling onEvent for each event. Aborts when
 * no bytes arrive for idleMs (a dead connection) and rejects with an
 * IdleTimeoutError, or when the signal aborts.
 */
export class IdleTimeoutError extends Error {
  constructor() {
    super("The stream went quiet");
    this.name = "IdleTimeoutError";
  }
}

export async function readSse(
  body: ReadableStream<Uint8Array>,
  onEvent: (event: SseEvent) => void,
  options: { idleMs?: number; signal?: AbortSignal } = {},
): Promise<void> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  const parser = new SseParser();
  const idleMs = options.idleMs ?? 20_000;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let idle = false;

  const arm = () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      idle = true;
      void reader.cancel().catch(() => undefined);
    }, idleMs);
  };
  const onAbort = () => void reader.cancel().catch(() => undefined);
  options.signal?.addEventListener("abort", onAbort);

  try {
    arm();
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      arm();
      for (const event of parser.feed(
        decoder.decode(value, { stream: true }),
      )) {
        onEvent(event);
      }
    }
    for (const event of parser.feed(decoder.decode())) onEvent(event);
    parser.end();
    if (idle) throw new IdleTimeoutError();
    if (options.signal?.aborted) {
      throw new DOMException("The stream was stopped", "AbortError");
    }
  } finally {
    if (timer) clearTimeout(timer);
    options.signal?.removeEventListener("abort", onAbort);
  }
}
