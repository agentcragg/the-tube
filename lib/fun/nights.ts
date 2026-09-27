// What happens on each night, keyed by film slug. Used by the running order
// (components/fun/running) and the laurels on the wall (components/fun/laurels).
// Times are London time. Everything here is placeholder until Matt confirms it.
//
// Only the shorts need typing in: their YouTube IDs and lengths (YouTube's
// oEmbed doesn't give durations; take "lengthSeconds" from the watch page).
// The feature and Q&A times are worked out from them by planNight().

import { getFilm } from "@/lib/films";

export type Short = {
  id: string; // YouTube video ID
  title: string;
  seconds: number; // length, from YouTube
  uploaded?: string; // e.g. "Mar 2007"
  quality?: string; // e.g. "240p"
};

export type Night = {
  doors: string; // "19:30"
  shorts?: { start: string; items: Short[] }; // the pre-show
  feature: string; // start time of the feature, "20:25"
  extra?: { start: string; label: string }; // e.g. a Q&A
  presentedBy?: string; // who picked the shorts, for the week-after Spotlight
  presenterAvatar?: string; // optional small square photo or drawing, e.g. "/people/matt.jpg"
  presenterUrl?: string; // optional link for the presenter's name
  note?: string; // one line about the shorts
};

// DRAFT: both times need confirming
export const DOORS = "19:30";
export const SHORTS_AT = "20:00";
export const BREAK_MINUTES = 5; // after the shorts, and between the feature and a Q&A
export const EXTRA_MINUTES = 30; // how long a Q&A is allowed for
export const WIND_DOWN_MINUTES = 30; // the front page keeps the night up this long after the end

// DRAFT: all the words the running order, the live band and the Spotlight use
export const COPY = {
  doors: "Bar open upstairs",
  shorts: (minutes: number) => `Selected short subjects (${minutes} min)`,
  feature: (length?: string) => (length ? `Feature (${length})` : "Feature"),
  onNow: "on now",
  approximate: "Times after the shorts are approximate.",
  sealedUntilDay: (day: string) => `Sealed until ${day}.`,
  sealedUntilTonight: (time: string) => `Sealed until ${time} tonight.`,
  opening: "The rest open as they're shown.",
  sealed: "Sealed",
  sealedShort: (length: string) => `Sealed short, ${length}`, // for screen readers
  bandLabel: (title: string) => `Tonight at The Tube: ${title}`, // for screen readers
  bandDoors: (time: string) => `Downstairs from ${time}. Bar open upstairs at Endeavour.`,
  bandOn: "Being watched right now in the basement at Endeavour…",
  bandTalk: "On now in the basement at Endeavour…",
  bandDone: "Just shown in the basement at Endeavour.",
  tabTitle: (what: string) => `▶ Now showing: ${what} · The Tube`,
  spotlight: "Spotlight Videos",
  shownBefore: "Shown before",
  presentedBy: "Presented by:",
};

const toSeconds = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 3600 + m * 60;
};
const toClock = (seconds: number) => {
  const m = Math.round(seconds / 60);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(Math.floor(m / 60) % 24)}:${pad(m % 60)}`;
};
// To the nearest five minutes, since these are estimates
const roughly = (seconds: number) => Math.round(seconds / 300) * 300;

// "Followed by a Q&A with director Nick Varvaro" → "Q&A with director Nick Varvaro"
const tidyExtra = (extra?: string) => {
  const s = extra?.replace(/^followed by (an? )?/i, "").trim();
  return s ? s[0].toUpperCase() + s.slice(1) : undefined;
};

type Plan = Omit<Night, "doors" | "shorts" | "feature" | "extra"> & {
  shorts?: Short[];
  extra?: string; // defaults to the film's own "extra" line
};

/** A night's times, worked out from the shorts' lengths and the film's running time. */
export function planNight(slug: string, { shorts, extra, ...rest }: Plan = {}): Night {
  const film = getFilm(slug);
  const start = toSeconds(SHORTS_AT);
  const shortsLength = (shorts ?? []).reduce((sum, s) => sum + s.seconds, 0);
  const feature = shortsLength ? roughly(start + shortsLength + BREAK_MINUTES * 60) : start;
  const label = extra ?? tidyExtra(film?.extra);
  const extraStart = roughly(feature + (film?.runtime ?? 0) + BREAK_MINUTES * 60);
  return {
    doors: DOORS,
    ...(shorts?.length ? { shorts: { start: SHORTS_AT, items: shorts } } : {}),
    feature: toClock(feature),
    ...(label ? { extra: { start: toClock(extraStart), label } } : {}),
    ...rest,
  };
}

// Placeholder shorts, for trying the idea out. Petscop is paired with In the
// Dark as on Matt's list; the others are from his own shorts list, put on the
// nights the Fun lab's "Pretend it's…" times land on. None of it is confirmed.
// Lengths, upload months and top quality are from each YouTube watch page.
export const NIGHTS: Record<string, Night> = {
  "southland-tales": planNight("southland-tales", {
    shorts: [
      { id: "8xqVeG9UiKs", title: "Southern nights", seconds: 62, uploaded: "Apr 2024", quality: "1080p" },
      { id: "q4lb0gXOq4I", title: "Mike Oldfield on Blue Peter", seconds: 715, uploaded: "Jul 2021", quality: "720p" },
    ],
    presentedBy: "Matt", // DRAFT
    note: "Mike Oldfield recording the Blue Peter theme, 25 January 1979.", // DRAFT
  }),
  "in-the-dark": planNight("in-the-dark", {
    shorts: [{ id: "6e6RK8o1fcs", title: "Petscop", seconds: 548, uploaded: "Mar 2017", quality: "720p" }],
    presentedBy: "Matt", // DRAFT
  }),
  "nebraska-city-special": planNight("nebraska-city-special", {
    shorts: [
      { id: "4AfAGE1r4Ew", title: "Hufflepuff", seconds: 135, uploaded: "Apr 2026", quality: "1080p" },
      { id: "iLJNSD3H5sg", title: "Possibly in Michigan", seconds: 705, uploaded: "Jul 2018", quality: "480p" },
    ],
    presentedBy: "Matt", // DRAFT
  }),
};

/** Every screening has a night, even before its shorts are typed in. */
export const nightFor = (slug: string): Night => NIGHTS[slug] ?? planNight(slug);
