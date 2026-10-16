// The funnel. Six questions, in order, and nothing else.
//
// This is deliberately not a page-view firehose. The founder is about to spend
// money on adverts aimed at university students, and the only numbers that
// change a decision are: how many people the advert brought, how many of those
// made an account, how many of those actually practised, and how many of those
// paid. Everything else is a distraction that costs a student on metered data
// real money to send.
//
// The optimisation target is first_practice_attempt rather than
// signup_completed, because a registration that never practises is not a
// customer and training Meta's delivery on it buys a cheaper worse audience.
//
// subscription_activated is listed here for completeness but is never fired
// from the browser. The API reports it from the Paystack verify and webhook
// paths, where the money is actually known to have moved.

import { track as vercelTrack } from "@vercel/analytics";
import { getConsentState } from "./consent";
import { getAttribution, attributionToFlat } from "./attribution";
import { metaTrack, metaTrackCustom } from "./meta";

export type FunnelEvent =
  // Someone arrived on a public page, with whatever campaign tags the advert
  // carried. Fires once per page load, not once per route change.
  | "landing_view"
  // They reached the account form and started filling it in.
  | "signup_started"
  // The account exists on the API.
  | "signup_completed"
  // A student finished the academic profile step.
  | "onboarding_completed"
  // Any submitted practice attempt.
  | "practice_attempt_submitted"
  // Their FIRST ever submitted attempt, as judged by the API rather than by
  // this device. The activation moment, and the campaign optimisation target.
  | "first_practice_attempt"
  // Checkout handed off to Paystack.
  | "subscribe_started"
  // Payment confirmed. Server-side only.
  | "subscription_activated";

export type EventProps = Record<string, string | number | boolean>;

// How each funnel step maps onto the pixel. Meta only has a fixed set of
// standard events; anything outside it is a custom event, which works fine for
// a custom conversion and for optimisation once it has been created in Events
// Manager. Nothing is bent to fit a standard name it does not mean.
const META_MAP: Record<FunnelEvent, { name: string; standard: boolean } | null> = {
  landing_view: null, // covered by the pixel's own PageView on init
  signup_started: { name: "SignupStarted", standard: false },
  signup_completed: { name: "CompleteRegistration", standard: true },
  onboarding_completed: { name: "OnboardingCompleted", standard: false },
  practice_attempt_submitted: { name: "PracticeAttempt", standard: false },
  first_practice_attempt: { name: "FirstPractice", standard: false },
  subscribe_started: { name: "InitiateCheckout", standard: true },
  subscription_activated: null, // reported server-side by the API
};

const DEBUG = process.env.NEXT_PUBLIC_ANALYTICS_DEBUG === "1";

// Vercel Web Analytics counts page views on every plan, but CUSTOM events are
// a Pro feature. Calling track() on Hobby is harmless but pointless, so it is
// behind a flag the founder flips the day he upgrades. Until then the funnel
// counts live in Meta Events Manager, which is free.
const VERCEL_CUSTOM_EVENTS = process.env.NEXT_PUBLIC_VERCEL_CUSTOM_EVENTS === "1";

export function track(event: FunnelEvent, props?: EventProps): void {
  if (typeof window === "undefined") return;
  const consent = getConsentState();

  if (DEBUG) {
    // eslint-disable-next-line no-console
    console.info("[analytics]", event, {
      ...props,
      marketingAllowed: consent.marketingAllowed,
      measurementAllowed: consent.measurementAllowed,
    });
  }

  if (consent.measurementAllowed && VERCEL_CUSTOM_EVENTS) {
    vercelTrack(event, props);
  }

  if (!consent.marketingAllowed) return;

  const meta = META_MAP[event];
  if (!meta) return;

  // Campaign fields ride along so a conversion can be read against a campaign
  // inside Meta as well as in our own numbers.
  const params = { ...attributionToFlat(getAttribution()), ...props };
  if (meta.standard) metaTrack(meta.name, params);
  else metaTrackCustom(meta.name, params);
}

// A stable id for one logical conversion, shared between whatever the browser
// sends and whatever the server sends, so Meta counts it once. Generated in the
// browser because that is where the checkout begins; carried to the API in the
// checkout request and back out through Paystack metadata.
export function newEventId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `evt-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
