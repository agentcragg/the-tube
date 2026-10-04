"use client";

import { useEffect } from "react";
import { usePicked, useScene } from "@/components/endeavour/use-scene";
import { londonParts, useLondonNow } from "@/lib/clock";
import { STRIP_TIMES as T } from "@/lib/endeavour";
import type { Film } from "@/lib/films";
import { useLook } from "@/lib/use-look";

// House lights (look switch idea "lights"): on a screening night the page
// follows the room, in step with the footer drawing (and its ?time switch).
// While the queue is on the stairs the lights go down a little at a time;
// while the projector runs (the film, and the empty room at 3am) the page is
// near-dark; after, they come back up. This only sets --dn, how far down
// they are, on <html>; app/idea-lights.css does the rest and eases between.

const QUEUE_FROM = 5; // percent down when the queue starts
const QUEUE_TO = 30; // and just before the film; text stays dark up to here

export default function HouseLights({ films }: { films: Film[] }) {
  const on = useLook("lights");
  const scene = useScene(films);
  const picked = usePicked();
  const now = useLondonNow();

  let down = 0;
  if (scene?.state === "screening" || scene?.state === "egg") down = 100;
  else if (scene?.state === "queue" && now) {
    // Picked from the time switch: halfway through the hour
    const { hour, minute } = londonParts(now);
    const through = picked ? 0.5 : (hour * 60 + minute - T.queue) / (T.screening - T.queue);
    down = Math.round(QUEUE_FROM + (QUEUE_TO - QUEUE_FROM) * Math.min(1, Math.max(0, through)));
  }

  useEffect(() => {
    if (!on) return;
    const root = document.documentElement.style;
    root.setProperty("--dn", `${down}%`);
    return () => {
      root.removeProperty("--dn");
    };
  }, [on, down]);

  return null;
}
