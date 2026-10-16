"use client";

import { Suspense, useEffect, useState, useSyncExternalStore } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Analytics } from "@vercel/analytics/react";
import {
  getConsentState,
  getServerConsentState,
  initConsent,
  subscribeConsent,
  subscribeConsentOpen,
} from "@/lib/analytics/consent";
import { captureAttribution, forgetAttribution, persistAttribution } from "@/lib/analytics/attribution";
import { isMetaConfigured, loadMetaPixel, revokeMetaPixel } from "@/lib/analytics/meta";
import { track } from "@/lib/analytics/events";
import { ConsentBanner } from "@/components/common/ConsentBanner";
import { ConsentPreferencesDialog } from "@/components/common/ConsentPreferencesDialog";

// Single place where measurement is turned on, and the only place that is
// allowed to turn it on.
//
// Order of operations matters and is the whole point of the file:
//
//   1. Read the consent record and the GPC signal. Until that has happened the
//      state is "unknown" and nothing loads, not even the banner, so the first
//      paint never fires a request it might have to apologise for.
//   2. Capture the campaign parameters into memory. No storage, no network.
//   3. Only if marketing consent is granted: load the pixel and write the
//      campaign record to the device.
//
// The consent state is read through useSyncExternalStore so a footer link, the
// privacy page and this provider all see the same value with no context
// plumbing and no re-render storms.

export function useConsent() {
  return useSyncExternalStore(subscribeConsent, getConsentState, getServerConsentState);
}

function AnalyticsInner() {
  const consent = useConsent();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [prefsOpen, setPrefsOpen] = useState(false);

  useEffect(() => {
    initConsent();
    return subscribeConsentOpen(() => setPrefsOpen(true));
  }, []);

  // Campaign capture runs on every navigation, because an advert can point at
  // any public route, not only the home page. It is in-memory only.
  useEffect(() => {
    captureAttribution(searchParams.toString(), pathname);
  }, [pathname, searchParams]);

  // React to the decision. This effect is the gate: everything non-essential
  // is downstream of it.
  useEffect(() => {
    if (consent.status === "unknown") return;
    if (consent.marketingAllowed) {
      persistAttribution();
      if (isMetaConfigured()) loadMetaPixel();
    } else if (consent.status === "decided") {
      // An explicit reject, or GPC. Clear anything an earlier accept wrote.
      forgetAttribution();
      revokeMetaPixel();
    }
  }, [consent.status, consent.marketingAllowed]);

  // One landing_view per page load, fired after the consent state is known so
  // it is routed to the sinks the person actually agreed to. Not per route
  // change: this measures arrivals from adverts, not browsing depth.
  const [landingFired, setLandingFired] = useState(false);
  useEffect(() => {
    if (consent.status === "unknown" || landingFired) return;
    setLandingFired(true);
    track("landing_view", { path: pathname });
  }, [consent.status, landingFired, pathname]);

  const showBanner = consent.status === "pending";

  return (
    <>
      {/* Cookieless page-view counting. Rendered only while measurement is
          allowed, which is everything except an explicit reject or GPC. */}
      {consent.measurementAllowed && <Analytics />}
      {showBanner && <ConsentBanner onDismiss={() => setPrefsOpen(false)} />}
      <ConsentPreferencesDialog
        open={prefsOpen}
        onClose={() => setPrefsOpen(false)}
        state={consent}
      />
    </>
  );
}

export function AnalyticsProvider() {
  // useSearchParams needs a Suspense boundary in the App Router. Without one,
  // every route that renders this provider gets pulled out of static rendering
  // and the build complains, which would be a heavy price for a consent gate.
  return (
    <Suspense fallback={null}>
      <AnalyticsInner />
    </Suspense>
  );
}
