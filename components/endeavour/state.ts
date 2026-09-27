// Which drawing of Endeavour to show at a given moment, London time.
import { daysBetween, londonParts } from "@/lib/clock";
import type { Film } from "@/lib/films";
import { STRIP_TIMES as T } from "@/lib/endeavour";

export type State = "morning" | "day" | "evening" | "setup" | "queue" | "screening" | "after" | "night" | "egg";

export type Scene = {
  state: State;
  tonight?: Film; // the film on today, if there is one: its colour lights the screen
  next?: Film; // today's or the next film: its colour goes in the poster case
  eggVideo?: string; // YouTube ID for the 3am screen
};

// The states in the order a screening day goes, for the time switch
export const STATES: { state: State; label: string }[] = [
  { state: "morning", label: "Morning" },
  { state: "day", label: "Afternoon" },
  { state: "evening", label: "Evening, no film" },
  { state: "setup", label: "Chairs out" },
  { state: "queue", label: "Queue on the stairs" },
  { state: "screening", label: "Screening" },
  { state: "after", label: "After" },
  { state: "night", label: "Night" },
  { state: "egg", label: "3am" },
];

const SCREENING_DAY: State[] = ["setup", "queue", "screening", "after"];

// A different video from the wall each night, the same one all hour
function eggVideoFor(isoDate: string, wallIds: string[]) {
  const n = wallIds.length;
  return n ? wallIds[((daysBetween("2027-01-01", isoDate) % n) + n) % n] : undefined;
}

export function sceneAt(now: Date, films: Film[], wallIds: string[]): Scene {
  const { isoDate, hour, minute } = londonParts(now);
  const m = hour * 60 + minute;
  const tonight = films.find((f) => f.date === isoDate);
  const next = films.find((f) => f.date >= isoDate);

  let state: State;
  if (m < T.morning) state = m >= T.egg && m < T.eggEnd ? "egg" : "night";
  else if (m < T.day) state = "morning";
  else if (m < T.evening) state = "day";
  else if (!tonight) state = "evening";
  else if (m < T.queue) state = "setup";
  else if (m < T.screening) state = "queue";
  else if (m < T.after) state = "screening";
  else state = "after";

  return { state, tonight, next, eggVideo: state === "egg" ? eggVideoFor(isoDate, wallIds) : undefined };
}

/** A chosen state, as if it were the next screening day (for the time switch). */
export function sceneAs(state: State, now: Date, films: Film[], wallIds: string[]): Scene {
  const { isoDate } = londonParts(now);
  const next = films.find((f) => f.date >= isoDate) ?? films[films.length - 1];
  return {
    state,
    next,
    tonight: SCREENING_DAY.includes(state) ? next : undefined,
    eggVideo: state === "egg" ? eggVideoFor(isoDate, wallIds) : undefined,
  };
}
