"use client";

import { useEffect, useState } from "react";

// False during server render and the first client render, true once React has
// hydrated and event handlers are actually attached.
//
// Used to gate submit buttons on the auth forms. A form with no `action`
// still submits natively if its button is clicked before hydration, which
// turns the fields into query-string parameters on the current URL: on
// /login that would write the user's password into the address bar, the
// browser history and the server access log.
//
// Gate on this, never on react-hook-form's `isValid`. `isValid` is a mirror
// of the library's own value state, and a browser or password manager can
// fill an input without firing an event React can see, so the button stays
// dead while the user is looking at a filled-in form. That is what made the
// first click on Sign in do nothing (MUI gives a disabled button
// `pointer-events: none`, so the click is swallowed silently) and the second
// one work. `handleSubmit` is what blocks an invalid submit.
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}
