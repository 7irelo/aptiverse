// Campaign attribution: what brought this person here, kept alive long enough
// to be attached to the thing they eventually do.
//
// The problem this solves: an advert lands someone on /for-students with
// ?utm_source=meta&utm_campaign=uni-launch, they read for a while, then sign
// up on /register and pay on Paystack's domain. By the time the money lands,
// the query string is three navigations and one third-party redirect ago. If
// nothing carried it, every conversion looks like it came from nowhere.
//
// Two storage tiers, for a legal reason and not an engineering one:
//
//   memory     Set the instant a campaign URL is seen, always, consent or not.
//              Holding a value in a JavaScript variable for the life of a tab
//              is not storage on terminal equipment, and the App Router keeps
//              this module alive across client-side navigations, so the common
//              path (advert -> landing -> Link to /register) is covered even
//              for someone who never touches the banner.
//
//   localStorage  Written only once marketing consent is granted, because that
//              genuinely is device storage for a non-essential purpose. A
//              reject means the record dies with the tab, and that is the
//              correct outcome rather than a bug.
//
// First touch wins inside the TTL window. If someone clicks two adverts a week
// apart, the first one gets the credit here. Meta's own reporting will still
// credit the later click through fbclid, so the two views are complementary
// rather than contradictory, and one first-party number that does not move is
// easier to reason about than a last-touch number that does.

export const ATTRIBUTION_STORAGE_KEY = "aptiverse.attribution.v1";

// The affiliate referral code gets its own key, and unlike the campaign record
// above it is written whether or not marketing consent was granted.
//
// That difference is deliberate and it is not a loophole. A UTM parameter is
// measurement: it exists so we can learn something about the visitor, which is
// precisely what consent governs. A referral code is a term of a commercial
// arrangement with a third party. Somebody handed out a link and is owed 20%
// of the first three payments if it converts. Dropping the code because the
// visitor declined analytics would not protect the visitor from anything; it
// would quietly not pay a student who did the work of recommending us.
//
// It is a short opaque code the affiliate chose to publish, it says nothing
// about the person holding it, and it is sent to exactly one place: our own
// API, so it can be attached to the account they create.
export const REFERRAL_STORAGE_KEY = "aptiverse.referral.v1";

// A random per-browser id, used as one weak self-referral signal among
// several. Never leaves for anywhere except our own API, and the server hashes
// it before storing, because all it ever asks is whether two of them match.
export const DEVICE_STORAGE_KEY = "aptiverse.device.v1";

// 30 days. Long enough for a student to think about a subscription over a
// month, short enough that a stale record does not haunt a later campaign.
const TTL_MS = 30 * 24 * 60 * 60 * 1000;

export type Attribution = {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  // Meta and Google click identifiers. fbclid is what makes a Meta conversion
  // attributable to a specific ad click rather than to "paid social" in
  // aggregate, so it matters more than the utm fields do for Meta reporting.
  fbclid?: string;
  gclid?: string;
  // Where they landed and what referred them, for the first-party view.
  landingPath?: string;
  referrer?: string;
  firstTouchAt: string;
  // An affiliate referral code from `?ref=`. Carried alongside the campaign
  // fields because it arrives the same way, but persisted separately: see
  // REFERRAL_STORAGE_KEY.
  ref?: string;
};

// Values are truncated before they are stored or sent. A query parameter is
// attacker-controlled text: nothing downstream should be handed an unbounded
// string just because it arrived in a URL.
const MAX_VALUE_LENGTH = 200;

function clean(value: string | null): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim().slice(0, MAX_VALUE_LENGTH);
  return trimmed.length > 0 ? trimmed : undefined;
}

let memory: Attribution | null = null;
let persisted: Attribution | null = null;
let hydrated = false;

type StoredAttribution = Attribution & { storedAt: number };

function readStored(): Attribution | null {
  try {
    const raw = window.localStorage.getItem(ATTRIBUTION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredAttribution;
    if (typeof parsed.storedAt !== "number" || Date.now() - parsed.storedAt > TTL_MS) {
      window.localStorage.removeItem(ATTRIBUTION_STORAGE_KEY);
      return null;
    }
    const { storedAt: _storedAt, ...rest } = parsed;
    return rest;
  } catch {
    return null;
  }
}

function hasCampaignSignal(a: Attribution): boolean {
  return Boolean(a.utmSource || a.utmMedium || a.utmCampaign || a.utmContent || a.utmTerm || a.fbclid || a.gclid);
}

// Parse the current URL. Called on mount and on every client-side navigation,
// because a person can arrive on any route, not only the home page.
export function captureAttribution(search: string, pathname: string): Attribution | null {
  if (typeof window === "undefined") return null;
  if (!hydrated) {
    persisted = readStored();
    hydrated = true;
    // A persisted first touch outranks anything in memory from this tab.
    if (persisted) memory = persisted;
  }

  const params = new URLSearchParams(search);

  // The referral code is captured from ANY route, not only the home page.
  // Links get shortened, forwarded and re-shared, so one will land on
  // /pricing?ref=X or /for-students?ref=X sooner or later and it should count
  // exactly the same. Run before the campaign logic below so a referral is
  // captured even on a purely organic arrival with no UTMs at all.
  captureReferralCode(params.get("ref"), pathname);

  const candidate: Attribution = {
    utmSource: clean(params.get("utm_source")),
    utmMedium: clean(params.get("utm_medium")),
    utmCampaign: clean(params.get("utm_campaign")),
    utmContent: clean(params.get("utm_content")),
    utmTerm: clean(params.get("utm_term")),
    fbclid: clean(params.get("fbclid")),
    gclid: clean(params.get("gclid")),
    landingPath: pathname,
    referrer: clean(typeof document !== "undefined" ? document.referrer : null),
    firstTouchAt: new Date().toISOString(),
  };

  if (!hasCampaignSignal(candidate)) {
    // Organic arrival. Still worth recording the landing page and referrer if
    // we know nothing at all yet, so a direct visitor is not indistinguishable
    // from a visitor we simply failed to observe.
    if (!memory) memory = candidate;
    return memory;
  }

  // First touch wins: an existing record with real campaign data is not
  // overwritten by a later click inside the window.
  if (memory && hasCampaignSignal(memory)) return memory;

  memory = candidate;
  return memory;
}

// Commit the in-memory record to the device. Only ever called from the consent
// layer, once marketing consent is granted.
export function persistAttribution(): void {
  if (typeof window === "undefined" || !memory) return;
  try {
    const payload: StoredAttribution = { ...memory, storedAt: Date.now() };
    window.localStorage.setItem(ATTRIBUTION_STORAGE_KEY, JSON.stringify(payload));
    persisted = memory;
  } catch {
    // Storage refused. The in-memory copy still works for this tab.
  }
}

// Drop the device copy. Called when consent is withdrawn, so a reject actually
// removes what a previous accept wrote rather than only stopping new writes.
export function forgetAttribution(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(ATTRIBUTION_STORAGE_KEY);
  } catch {
    /* nothing to do */
  }
  persisted = null;
}

export function getAttribution(): Attribution | null {
  return memory;
}

// ---------------------------------------------------------------------------
// Affiliate referral code
// ---------------------------------------------------------------------------

export type StoredReferral = {
  code: string;
  landingPath?: string;
  capturedAt: string;
};

let referralMemory: StoredReferral | null = null;
let referralHydrated = false;

// Codes are eight characters from an unambiguous alphabet. Anything that is
// not that shape is a typo or someone poking at the query string, and the
// right response to both is to ignore it silently. A person must never see an
// error, or any difference at all, because a referral code was bad.
const REFERRAL_CODE_PATTERN = /^[A-Z0-9]{4,16}$/;

function normaliseCode(raw: string | null): string | undefined {
  if (!raw) return undefined;
  // Link shorteners and chat clients lowercase URLs, and copy-paste brings
  // whitespace. Normalise here and again on the API, which never trusts the
  // client's casing.
  const cleaned = raw.trim().toUpperCase().slice(0, 16);
  return REFERRAL_CODE_PATTERN.test(cleaned) ? cleaned : undefined;
}

function hydrateReferral(): void {
  if (referralHydrated) return;
  referralHydrated = true;
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(REFERRAL_STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as StoredReferral;
    if (typeof parsed?.code === "string") referralMemory = parsed;
  } catch {
    // Storage unavailable or the value is junk. Carry on with nothing.
  }
}

// First touch wins, permanently. Attribution is lifetime by design, so a code
// captured in March is still the one that counts when the person upgrades in
// September, and a second code arriving later never overwrites the first.
export function captureReferralCode(raw: string | null, landingPath?: string): string | undefined {
  const code = normaliseCode(raw);
  hydrateReferral();
  if (!code) return referralMemory?.code;
  if (referralMemory) return referralMemory.code;

  referralMemory = { code, landingPath, capturedAt: new Date().toISOString() };
  try {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(REFERRAL_STORAGE_KEY, JSON.stringify(referralMemory));
    }
  } catch {
    // Refused. The in-memory copy still carries this tab through signup, which
    // is the common path anyway.
  }
  return code;
}

export function getReferralCode(): string | undefined {
  hydrateReferral();
  return referralMemory?.code;
}

export function getStoredReferral(): StoredReferral | null {
  hydrateReferral();
  return referralMemory;
}

// Called once the API has confirmed it recorded the referral, or told us it
// will never record this one. Keeping a spent code around would mean retrying
// a claim on every page load forever.
export function clearReferralCode(): void {
  referralMemory = null;
  referralHydrated = true;
  try {
    if (typeof window !== "undefined") window.localStorage.removeItem(REFERRAL_STORAGE_KEY);
  } catch {
    /* nothing to do */
  }
}

// A stable per-browser id. Not fingerprinting: it is a random value this
// browser generated about itself, readable only by us, and its single use is
// noticing that a referrer and their referral signed up on the same device.
export function getDeviceId(): string | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const existing = window.localStorage.getItem(DEVICE_STORAGE_KEY);
    if (existing) return existing;
    const fresh = crypto.randomUUID();
    window.localStorage.setItem(DEVICE_STORAGE_KEY, fresh);
    return fresh;
  } catch {
    return undefined;
  }
}

// Flattened, string-only shape. This is what gets handed to the API at
// checkout, and from there into Paystack transaction metadata, so it has to
// survive a round trip through a JSON object with no nesting and no nulls.
export function attributionToFlat(a: Attribution | null): Record<string, string> {
  if (!a) return {};
  const out: Record<string, string> = {};
  const put = (k: string, v?: string) => {
    if (v) out[k] = v;
  };
  put("utmSource", a.utmSource);
  put("utmMedium", a.utmMedium);
  put("utmCampaign", a.utmCampaign);
  put("utmContent", a.utmContent);
  put("utmTerm", a.utmTerm);
  put("fbclid", a.fbclid);
  put("gclid", a.gclid);
  put("landingPath", a.landingPath);
  return out;
}
