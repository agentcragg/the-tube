// What's shown on each night, keyed by film slug. The laurels on the wall
// (components/laurels) read this: once a night is over, the tiles of the
// shorts shown before it get a laurel. Times are London time.
//
// Only the shorts need typing in: their YouTube IDs and lengths (take
// "lengthSeconds" from the YouTube watch page). The feature and Q&A times are
// worked out from them by planNight().

import { getFilm } from "@/lib/films";

export type Short = {
  id: string; // YouTube video ID
  title: string;
  seconds: number; // length, from YouTube
};

export type Night = {
  doors: string; // "19:30"
  shorts?: { start: string; items: Short[] }; // the pre-show
  feature: string; // start time of the feature, "20:25"
  extra?: { start: string; label: string }; // e.g. a Q&A
};

// DRAFT: both times need confirming
export const DOORS = "19:30";
export const SHORTS_AT = "20:00";
export const BREAK_MINUTES = 5; // after the shorts, and between the feature and a Q&A
export const EXTRA_MINUTES = 30; // how long a Q&A is allowed for

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

type Plan = {
  shorts?: Short[];
  extra?: string; // defaults to the film's own "extra" line
};

/** A night's times, worked out from the shorts' lengths and the film's running time. */
export function planNight(slug: string, { shorts, extra }: Plan = {}): Night {
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
  };
}

// DRAFT: placeholder pairings. Petscop is paired with In the Dark as on
// Matt's list; the rest are from his shorts list, not yet confirmed.
export const NIGHTS: Record<string, Night> = {
  "southland-tales": planNight("southland-tales", {
    shorts: [
      { id: "8xqVeG9UiKs", title: "Southern nights", seconds: 62 },
      { id: "q4lb0gXOq4I", title: "Mike Oldfield on Blue Peter", seconds: 715 },
    ],
  }),
  "in-the-dark": planNight("in-the-dark", {
    shorts: [{ id: "6e6RK8o1fcs", title: "Petscop", seconds: 548 }],
  }),
  "nebraska-city-special": planNight("nebraska-city-special", {
    shorts: [
      { id: "4AfAGE1r4Ew", title: "Hufflepuff", seconds: 135 },
      { id: "iLJNSD3H5sg", title: "Possibly in Michigan", seconds: 705 },
    ],
  }),
};
