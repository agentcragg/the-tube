import { useSyncExternalStore } from "react";

// London time for anything that changes with the clock (labels like TONIGHT,
// "being watched right now", day/night drawings). Pages are built ahead of
// time, so this only runs in the browser: the server snapshot is null and
// components should render a sensible static version until it isn't.
//
// The Fun lab can override the time ("Pretend it's…") so time-based ideas can
// be previewed before the first screening. The override is an ISO string
// stored in localStorage under PRETEND_KEY; changing it fires CLOCK_EVENT.

export const PRETEND_KEY = "tube-pretend-time";
export const CLOCK_EVENT = "tube-clock";

function readPretend(): string | null {
  try {
    return localStorage.getItem(PRETEND_KEY);
  } catch {
    return null;
  }
}

let cached: { key: string; value: Date } | null = null;

function snapshot(): Date {
  const pretend = readPretend();
  // Round to the minute so the snapshot is stable between ticks
  const now = pretend ? new Date(pretend) : new Date();
  const key = `${pretend ?? "real"}:${Math.floor(now.getTime() / 60_000)}`;
  if (!cached || cached.key !== key) cached = { key, value: now };
  return cached.value;
}

function subscribe(onChange: () => void) {
  const timer = setInterval(onChange, 30_000);
  window.addEventListener(CLOCK_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    clearInterval(timer);
    window.removeEventListener(CLOCK_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

/** The current time (or the Fun lab's pretend time); null while rendering on the server. */
export function useLondonNow(): Date | null {
  return useSyncExternalStore(subscribe, snapshot, () => null);
}

/** Date and time parts in Europe/London, whatever the visitor's own time zone. */
export function londonParts(d: Date) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/London",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      weekday: "short",
      hourCycle: "h23",
    })
      .formatToParts(d)
      .map((p) => [p.type, p.value]),
  );
  return {
    isoDate: `${parts.year}-${parts.month}-${parts.day}`, // e.g. "2027-01-19"
    hour: Number(parts.hour),
    minute: Number(parts.minute),
    weekday: parts.weekday as string, // "Mon", "Tue", …
  };
}

/** Whole days from a London date (YYYY-MM-DD) to another; negative if `to` is earlier. */
export function daysBetween(fromIso: string, toIso: string) {
  return Math.round((Date.parse(toIso + "T00:00:00Z") - Date.parse(fromIso + "T00:00:00Z")) / 86_400_000);
}
