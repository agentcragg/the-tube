import { useSyncExternalStore } from "react";

// London time for anything that changes with the clock (the Endeavour
// drawing, the laurels on the wall, "Screening"/"Screened"). Pages are built
// ahead of time, so this only runs in the browser: the server snapshot is null
// and components should render a sensible static version until it isn't.

let cached: { minute: number; value: Date } | null = null;

// The same Date for the whole minute, so the snapshot is stable between ticks
function snapshot(): Date {
  const minute = Math.floor(Date.now() / 60_000);
  if (!cached || cached.minute !== minute) cached = { minute, value: new Date() };
  return cached.value;
}

function subscribe(onChange: () => void) {
  const timer = setInterval(onChange, 30_000);
  return () => clearInterval(timer);
}

/** The current time; null while rendering on the server. */
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
