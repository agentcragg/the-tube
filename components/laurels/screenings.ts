// Which wall videos have been shown at The Tube, read from the running orders
// in lib/nights.ts (each night's shorts). Nothing to type in here: when a
// night's shorts are added there, their tiles on the wall get a laurel once
// that night is over.

import { daysBetween, londonParts } from "@/lib/clock";
import { getFilm } from "@/lib/films";
import { EXTRA_MINUTES, NIGHTS, type Night } from "@/lib/nights";

export type Screening = {
  slug: string;
  film: string; // the feature it was shown before
  colour: string; // that film's colour
  date: string; // ISO date of the night
  over: number; // minutes after midnight on `date` (London) when the night is over
};

// Used when a film has no running time yet
const LATE = 23 * 60;

const minutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

// The end of the feature, or of the Q&A after it
function overAt(night: Night, runtime?: number) {
  const feature = runtime ? minutes(night.feature) + Math.ceil(runtime / 60) : LATE;
  const extra = night.extra ? minutes(night.extra.start) + EXTRA_MINUTES : 0;
  return Math.max(feature, extra);
}

// YouTube ID → every night it was shown at, earliest first
const SCREENINGS = new Map<string, Screening[]>();
for (const [slug, night] of Object.entries(NIGHTS)) {
  const film = getFilm(slug);
  if (!film) continue;
  const screening = { slug, film: film.title, colour: film.colour, date: film.date, over: overAt(night, film.runtime) };
  for (const short of night.shorts?.items ?? []) {
    SCREENINGS.set(short.id, [...(SCREENINGS.get(short.id) ?? []), screening]);
  }
}
for (const list of SCREENINGS.values()) list.sort((a, b) => a.date.localeCompare(b.date));

/** Whether this video is in any night's running order, past or future. */
export const isProgrammed = (videoId: string) => SCREENINGS.has(videoId);

/** The first night this video was shown at, if that night is over by `now`. */
export function firstScreening(videoId: string, now: Date): Screening | undefined {
  const p = londonParts(now);
  const t = p.hour * 60 + p.minute;
  return SCREENINGS.get(videoId)?.find((s) => daysBetween(s.date, p.isoDate) * 1440 + t >= s.over);
}

/** "Tue 19 Jan 2027", the same in every browser and time zone. */
export function nightDay(iso: string) {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric", timeZone: "UTC" })
      .formatToParts(new Date(iso + "T00:00:00Z"))
      .map((x) => [x.type, x.value]),
  );
  return `${p.weekday} ${p.day} ${p.month} ${p.year}`;
}
