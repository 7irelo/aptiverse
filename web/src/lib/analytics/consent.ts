// Consent state for non-essential storage and tracking.
//
// Why this exists at all: until analytics was added, every cookie the site set
// was strictly necessary (NextAuth session, CSRF, callback URL) and the public
// marketing pages set none, so no consent gate was required. Adding an
// advertising pixel changes that answer. Under POPIA and under GDPR/ePrivacy,
// advertising and analytics are not strictly necessary, so the tag must not
// load and no identifier may be set until the person agrees.
//
// There is exactly ONE non-essential category here, deliberately. A row of
// pre-ticked category switches is the classic dark pattern, and a single
// honest yes/no is easier to present truthfully at 390px than a settings
// panel nobody reads.
//
// Two things sit behind that one switch:
//
//   marketing   The Meta pixel. Loads a third-party script from
//               connect.facebook.net and sets _fbp / _fbc cookies that follow
//               a person across sites. Consent is not optional for this, ever.
//
//   measurement Vercel Web Analytics, and our own first-touch campaign record.
//               Vercel Web Analytics is cookieless: it writes nothing to the
//               device and builds its visitor count from a server-side hash
//               that rotates daily, so ePrivacy Article 5(3), which is about
//               storing or reading data on terminal equipment, is not engaged
//               by it and aggregate first-party audience measurement is the
//               textbook legitimate-interest case. That is why it is allowed
//               to run before a decision has been made. Our own attribution
//               record is different: it IS device storage, so it is only ever
//               written once consent is granted, and is held in memory until
//               then. An explicit reject switches both off anyway, which is
//               more than the law asks for and costs nothing.
//
// The stored record carries a version and a timestamp so an expanded future
// policy can invalidate an old agreement rather than silently inherit it.

export const CONSENT_VERSION = 1;
export const CONSENT_STORAGE_KEY = "aptiverse.consent.v1";

// What the banner is asking about, in the words the banner uses. Kept here so
// the banner, the preferences dialog and the privacy page cannot drift apart.
export const CONSENT_SUMMARY =
  "We would like to measure which adverts bring students to Aptiverse. That means loading Meta's advertising tag, which sets cookies in your browser and can follow you to other sites.";

export type ConsentRecord = {
  version: number;
  // The single non-essential category. True only on an explicit accept.
  marketing: boolean;
  // ISO 8601, UTC. Evidence of when the choice was made.
  decidedAt: string;
  // Where the choice came from, for the same reason the API records a source
  // on a terms acceptance.
  source: "banner" | "preferences";
};

export type ConsentState = {
  // "unknown" until the client has read storage, so nothing renders or fires
  // off a guess during SSR and the first paint.
  status: "unknown" | "pending" | "decided";
  record: ConsentRecord | null;
  // navigator.globalPrivacyControl. A legally recognised opt-out signal in
  // several jurisdictions and a plain statement of preference everywhere else.
  // We honour it as a rejection and do not nag the person with a banner.
  gpc: boolean;
  // Third-party advertising. Never true without an explicit accept.
  marketingAllowed: boolean;
  // Cookieless page-view measurement, and persisting the campaign record.
  measurementAllowed: boolean;
};

const INITIAL: ConsentState = {
  status: "unknown",
  record: null,
  gpc: false,
  marketingAllowed: false,
  measurementAllowed: false,
};

let state: ConsentState = INITIAL;
const listeners = new Set<() => void>();
// Separate channel: "the user asked to review their choice". Rendering the
// dialog is the provider's job, opening it is a footer link's job, and neither
// should have to know about the other.
const openListeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function derive(record: ConsentRecord | null, gpc: boolean): ConsentState {
  if (gpc) {
    // A machine-readable "do not sell or share" is a decision. Treat it as a
    // reject, and do not ask again on every page.
    return { status: "decided", record, gpc, marketingAllowed: false, measurementAllowed: false };
  }
  if (!record) {
    // No decision yet. Cookieless measurement may run (see the note above);
    // nothing may be written to the device and no pixel may load.
    return { status: "pending", record: null, gpc, marketingAllowed: false, measurementAllowed: true };
  }
  return {
    status: "decided",
    record,
    gpc,
    marketingAllowed: record.marketing,
    measurementAllowed: record.marketing,
  };
}

function readStoredRecord(): ConsentRecord | null {
  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ConsentRecord>;
    // A record written against an older policy is not evidence of agreement to
    // the current one. Ignore it and ask again.
    if (parsed.version !== CONSENT_VERSION) return null;
    if (typeof parsed.marketing !== "boolean") return null;
    return {
      version: CONSENT_VERSION,
      marketing: parsed.marketing,
      decidedAt: typeof parsed.decidedAt === "string" ? parsed.decidedAt : new Date().toISOString(),
      source: parsed.source === "preferences" ? "preferences" : "banner",
    };
  } catch {
    // Private mode, disabled storage, corrupt JSON. No record means no consent.
    return null;
  }
}

function readGpc(): boolean {
  try {
    return (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl === true;
  } catch {
    return false;
  }
}

let initialised = false;

// Read the browser once, on the client, after mount. Safe to call repeatedly.
export function initConsent(): void {
  if (initialised || typeof window === "undefined") return;
  initialised = true;
  state = derive(readStoredRecord(), readGpc());
  emit();
}

export function getConsentState(): ConsentState {
  return state;
}

// The SSR snapshot must be a stable object identity or useSyncExternalStore
// loops. INITIAL is a module constant, so it is.
export function getServerConsentState(): ConsentState {
  return INITIAL;
}

export function subscribeConsent(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// Record a decision. `marketing: false` is written to storage exactly like an
// accept: a reject that is not remembered is a banner that re-nags forever,
// which is its own dark pattern.
export function setConsent(marketing: boolean, source: ConsentRecord["source"] = "banner"): void {
  const record: ConsentRecord = {
    version: CONSENT_VERSION,
    marketing,
    decidedAt: new Date().toISOString(),
    source,
  };
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(record));
  } catch {
    // Storage unavailable. Honour the choice for this page load rather than
    // failing the interaction.
  }
  state = derive(record, state.gpc);
  emit();
}

// Reopen the choice. Used by the footer link and the privacy page so the
// decision stays revocable, which is a requirement and not a nicety.
export function openConsentPreferences(): void {
  for (const l of openListeners) l();
}

export function subscribeConsentOpen(listener: () => void): () => void {
  openListeners.add(listener);
  return () => openListeners.delete(listener);
}
