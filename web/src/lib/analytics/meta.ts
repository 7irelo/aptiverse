// Meta pixel loader. Nothing in this file runs until the consent layer calls
// loadMetaPixel(), and the consent layer only calls it on an explicit accept.
//
// The pixel is the one piece here that is unambiguously consent-required: it
// is a third-party script, it sets _fbp and _fbc, and those identifiers are
// the whole point of it. There is no cookieless variant and no legitimate
// interest argument to make. If NEXT_PUBLIC_META_PIXEL_ID is unset the loader
// is a no-op, so a developer without the id gets a working app rather than a
// console full of errors.
//
// The Purchase event is deliberately NOT fired from here. It is reported
// server-side by the API from the Paystack verify and webhook paths, because
// a browser redirect back from a payment provider is the least trustworthy
// moment in the funnel: ad blockers strip the script, iOS closes the tab, and
// a person on a metered connection may simply not wait for it. See
// MetaConversionsClient on the API side.

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

type Fbq = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void;
  queue: unknown[];
  // fbevents.js reassigns this to itself once loaded and reads it while
  // draining the queue. It is not decorative: see the note in loadMetaPixel.
  push?: unknown;
  loaded?: boolean;
  version?: string;
};

declare global {
  interface Window {
    fbq?: Fbq;
    _fbq?: Fbq;
  }
}

let loaded = false;

export function isMetaConfigured(): boolean {
  return Boolean(PIXEL_ID);
}

// The standard fbevents bootstrap, rewritten as a module rather than pasted as
// an inline <script>. Same behaviour, but it can be reasoned about, it never
// touches document.write, and it can be called at exactly the moment consent
// is given instead of at parse time.
export function loadMetaPixel(): void {
  if (loaded || typeof window === "undefined" || !PIXEL_ID) return;
  loaded = true;

  if (!window.fbq) {
    const fbq = function (this: unknown, ...args: unknown[]) {
      if (fbq.callMethod) fbq.callMethod.apply(fbq, args);
      else fbq.queue.push(args);
    } as Fbq;
    fbq.queue = [];
    // fbq.push = fbq is NOT boilerplate to be tidied away. fbevents.js drains
    // the pre-load queue by calling fbq.push, and without this line the queued
    // init call is never replayed: the script loads, the pixel initialises with
    // no id, and the console reads "Invalid PixelID: null". Verified by
    // omitting it, which is how this comment came to exist.
    fbq.push = fbq;
    fbq.loaded = true;
    fbq.version = "2.0";
    window.fbq = fbq;
    if (!window._fbq) window._fbq = fbq;

    const script = document.createElement("script");
    script.async = true;
    script.src = "https://connect.facebook.net/en_US/fbevents.js";
    document.head.appendChild(script);
  }

  // autoConfig off: we send the events we mean to send. Left on, the pixel
  // also harvests button text and form field names from every page, which is
  // both more data than we asked for and more than the banner promised.
  window.fbq?.("set", "autoConfig", false, PIXEL_ID);
  window.fbq?.("init", PIXEL_ID);
  window.fbq?.("track", "PageView");
}

// Withdrawal. The script cannot be unloaded once it is in the document, so we
// tell it to stop and then remove the identifiers it set. On a fresh page load
// after a reject it never loads at all.
export function revokeMetaPixel(): void {
  if (typeof window === "undefined") return;
  try {
    window.fbq?.("consent", "revoke");
  } catch {
    /* pixel was never loaded */
  }
  for (const name of ["_fbp", "_fbc"]) {
    document.cookie = `${name}=; Max-Age=0; path=/`;
    // Cookies set on the registrable domain need the domain repeated to be
    // cleared, otherwise the delete silently misses.
    const host = window.location.hostname;
    const parts = host.split(".");
    if (parts.length > 1) {
      document.cookie = `${name}=; Max-Age=0; path=/; domain=.${parts.slice(-2).join(".")}`;
    }
  }
}

export function metaTrack(event: string, params?: Record<string, unknown>, eventId?: string): void {
  if (!loaded || typeof window === "undefined") return;
  const options = eventId ? { eventID: eventId } : undefined;
  window.fbq?.("track", event, params ?? {}, options);
}

export function metaTrackCustom(event: string, params?: Record<string, unknown>, eventId?: string): void {
  if (!loaded || typeof window === "undefined") return;
  const options = eventId ? { eventID: eventId } : undefined;
  window.fbq?.("trackCustom", event, params ?? {}, options);
}

function readCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : undefined;
}

// _fbp is the pixel's browser id. Only exists once the pixel has run, which
// means only once consent was given, which is exactly the gate we want on
// sending it to the Conversions API.
export function getFbp(): string | undefined {
  return readCookie("_fbp");
}

// _fbc is the click id, derived from fbclid. The pixel writes it on the first
// page load that carries fbclid, but if the person accepted the banner on a
// later page the pixel never saw that URL, so fall back to rebuilding it from
// the attribution record in Meta's documented fb.1.<timestamp>.<fbclid> shape.
export function getFbc(fbclid?: string): string | undefined {
  const cookie = readCookie("_fbc");
  if (cookie) return cookie;
  if (!fbclid) return undefined;
  return `fb.1.${Date.now()}.${fbclid}`;
}
