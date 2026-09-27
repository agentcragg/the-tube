// The night as a list of timed items, and where "now" falls in it.
// Client only (it reads the London clock).

import { daysBetween, londonParts } from "@/lib/clock";
import type { Film } from "@/lib/films";
import { EXTRA_MINUTES, WIND_DOWN_MINUTES, type Night, type Short } from "@/lib/fun/nights";

export type Item =
  | { kind: "short"; start: number; end: number; short: Short }
  | { kind: "feature"; start: number; end: number }
  | { kind: "extra"; start: number; end: number; label: string };

export const toSeconds = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 3600 + m * 60;
};

export const clock = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(Math.floor(m / 60) % 24)}:${pad(m % 60)}`;
};

// "2:34", as on a YouTube thumbnail
export const length = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

export const youtube = (id: string) => `https://www.youtube.com/watch?v=${id}`;

// All in seconds after midnight at the start of the night's date
export function timeline(film: Film, night: Night) {
  const items: Item[] = [];
  let t = night.shorts ? toSeconds(night.shorts.start) : 0;
  for (const short of night.shorts?.items ?? []) {
    items.push({ kind: "short", start: t, end: t + short.seconds, short });
    t += short.seconds;
  }
  const feature = toSeconds(night.feature);
  items.push({ kind: "feature", start: feature, end: feature + (film.runtime ?? 0) });
  if (night.extra) {
    const start = toSeconds(night.extra.start);
    items.push({ kind: "extra", start, end: start + EXTRA_MINUTES * 60, label: night.extra.label });
  }
  const end = Math.max(...items.map((i) => i.end));
  return { doors: toSeconds(night.doors), items, end, close: end + WIND_DOWN_MINUTES * 60 };
}

/** Seconds since midnight on `date` in London; negative before that day, above 86400 after it. */
export function secondsInto(date: string, now: Date) {
  const p = londonParts(now);
  return daysBetween(date, p.isoDate) * 86_400 + p.hour * 3600 + p.minute * 60 + now.getUTCSeconds();
}

/** Index of the item on now (the last one to have started), or -1 before the first. */
export function onNow(items: Item[], t: number) {
  let i = -1;
  items.forEach((item, n) => {
    if (item.start <= t) i = n;
  });
  return i;
}

// "Tue 19 Jan", whatever the visitor's time zone
export const shortDay = (iso: string) =>
  new Date(iso + "T00:00:00Z").toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
