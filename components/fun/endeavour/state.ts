// Which drawing of Endeavour to show at a given moment, London time.
import { daysBetween, londonParts } from "@/lib/clock";
import type { Film } from "@/lib/films";
import { STRIP_TIMES as T } from "@/lib/fun/endeavour";

export type State = "morning" | "day" | "evening" | "setup" | "queue" | "screening" | "after" | "night" | "egg";

export type Scene = {
  state: State;
  tonight?: Film; // the film on today, if there is one: its colour lights the screen
  next?: Film; // today's or the next film: its colour goes in the poster case
  eggVideo?: string; // YouTube ID for the 3:14am screen
};

export function sceneAt(now: Date, films: Film[], wallIds: string[]): Scene {
  const { isoDate, hour, minute } = londonParts(now);
  const m = hour * 60 + minute;
  const tonight = films.find((f) => f.date === isoDate);
  const next = films.find((f) => f.date >= isoDate);

  let state: State;
  if (m < T.morning) state = m >= T.egg && m < T.egg + 1 ? "egg" : "night";
  else if (m < T.day) state = "morning";
  else if (m < T.evening) state = "day";
  else if (!tonight) state = "evening";
  else if (m < T.queue) state = "setup";
  else if (m < T.screening) state = "queue";
  else if (m < T.after) state = "screening";
  else state = "after";

  // A different video from the wall each night, the same one all minute
  let eggVideo: string | undefined;
  if (state === "egg" && wallIds.length) {
    const n = wallIds.length;
    eggVideo = wallIds[((daysBetween("2027-01-01", isoDate) % n) + n) % n];
  }

  return { state, tonight, next, eggVideo };
}
