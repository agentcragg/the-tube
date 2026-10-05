"use client";

import { useEffect, useSyncExternalStore } from "react";
import { usePicked } from "@/components/endeavour/use-scene";
import type { State } from "@/components/endeavour/state";
import { londonParts, useLondonNow } from "@/lib/clock";
import { isNightHour } from "@/lib/dark";

// Keeps <html class="dark"> right once the page is running (lib/dark.ts set
// it before the first paint): when the device switches between light and
// dark, when night falls or ends while the page is open, and when the footer
// drawing's time switch picks a state, so dark mode can be seen in the day.

// The drawing's states that count as night
const DARK_STATES: State[] = ["queue", "screening", "after", "night", "egg"];

const DEVICE_DARK = "(prefers-color-scheme: dark)";
function subscribeDevice(onChange: () => void) {
  const query = matchMedia(DEVICE_DARK);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

export default function DarkMode() {
  const now = useLondonNow();
  const picked = usePicked();
  const deviceDark = useSyncExternalStore(subscribeDevice, () => matchMedia(DEVICE_DARK).matches, () => false);

  useEffect(() => {
    if (!now) return;
    const night = picked ? DARK_STATES.includes(picked) : isNightHour(londonParts(now).hour);
    document.documentElement.classList.toggle("dark", deviceDark || night);
  }, [now, picked, deviceDark]);

  return null;
}
